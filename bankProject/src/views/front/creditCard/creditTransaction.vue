<template>
  <v-container class="py-6 mx-auto" style="max-width: 1100px;">
    <!-- ============== 我的交易 ============== -->
    <v-card class="pa-4 mb-6 soft-card">
      <v-card-title>我的交易</v-card-title>

      <v-row dense class="mt-1">
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="txQuery.yearMonth"
            label="月份 (yyyyMM)"
            placeholder="202508"
            clearable
          />
        </v-col>

        <v-col cols="12" sm="4">
          <v-select
            v-model="txQuery.cardId"
            :items="txCardOptions"
            item-title="label"
            item-value="value"
            label="卡片（僅顯示已開卡）"
            clearable
          />
        </v-col>

        <v-col cols="12" sm="5" class="d-flex align-center">
          <v-text-field
            v-model="txQuery.keyword"
            label="關鍵字（描述/類別）"
            clearable
            class="mr-2"
          />
          <v-btn color="primary" :loading="txLoading" @click="fetchTx">查詢</v-btn>
          <v-btn variant="tonal" class="ml-2" @click="resetAndFetchTx">重置</v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="txHeaders"
        :items="txFiltered"
        :loading="txLoading"
        item-key="transactionId"
        density="compact"
        class="mt-2 my-tx-table"
        :row-props="() => ({ class: 'my-row' })"
      >
        <template #item.cardMasked="{ item }">
          {{ maskCard(item.cardDetail?.cardCode) }}
          <span class="text-grey text-caption ml-1">(#{{ item.cardDetail?.cardId }})</span>
        </template>

        <template #item.amount="{ item }">
          <span :class="amountClass(item.amount)">{{ fmtMoney(item.amount) }}</span>
        </template>

        <template #item.cashback="{ item }">
          <span class="text-success">{{ fmtMoney(item.cashback) }}</span>
        </template>

        <template #item.merchantType="{ item }">
          <v-chip size="small" variant="tonal">{{ item.merchantType || '-' }}</v-chip>
        </template>

        <template #item.transactionTime="{ item }">
          {{ fmtDateTime(item.transactionTime) }}
        </template>

        <template #bottom>
          <div class="pa-3 d-flex align-center justify-end">
            <v-btn variant="tonal" @click="fetchTx">重新整理</v-btn>
          </div>
        </template>
      </v-data-table>

      <v-alert v-if="!txLoading && txFiltered.length === 0" type="info" class="ma-4">
        查無交易資料
      </v-alert>
    </v-card>

    <!-- ============== PayPal 模擬刷卡（Sandbox / TWD） ============== -->
    <v-card class="pa-4 soft-card">
      <v-card-title>PayPal 模擬刷卡（Sandbox / TWD）</v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="amount"
              type="number"
              min="0"
              label="金額（TWD，整數）"
              placeholder="例如 500"
              clearable
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-select
              v-model="merchantType"
              :items="merchantTypes"
              label="商店類別"
              clearable
            />
          </v-col>

          <!-- ✅ 僅可選「已開卡」的卡片 -->
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedCardId"
              :items="myCardOptions"
              item-title="label"
              item-value="value"
              label="選擇我的卡片（僅顯示已開卡）"
              :disabled="!myCardOptions.length"
              clearable
            />
          </v-col>
        </v-row>

        <v-alert v-if="!myCardOptions.length" type="info" class="mb-2">
          目前沒有可用的信用卡，請先申請或開卡。
        </v-alert>

        <div id="paypal-buttons" class="mt-4" />

        <div class="text-caption mt-2">技術支援供應方：<strong>PayPal</strong></div>

        <v-alert v-if="errorText" type="error" class="mt-4">{{ errorText }}</v-alert>
        <v-alert v-if="successText" type="success" class="mt-4">{{ successText }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";

const memberStore = useMemberStore();

/* --------- 工具：只保留 active --------- */
const norm = (s) => String(s ?? "").toLowerCase();
const isActiveCard = (c) => norm(c?.status) === "active";

/* --------- 我的卡片（只拿 active 來用） --------- */
const myCards = ref([]);
const selectedCardId = ref(null);

const activeMyCards = computed(() => myCards.value.filter(isActiveCard));

const myCardOptions = computed(() =>
  activeMyCards.value.map(c => {
    const id = Number(c.cardId ?? c.cardDetailId ?? c.id);
    const code = c.cardCode || "";
    return { value: id, label: `${maskCard(code)}（#${id}）` };
  })
);

// 保持下拉有效性
const optionValues = computed(() => new Set(myCardOptions.value.map(o => o.value)));
watch(optionValues, (set) => {
  if (!set.has(Number(selectedCardId.value))) selectedCardId.value = null;
  if (!set.has(Number(txQuery.value.cardId)))  txQuery.value.cardId = null;
});

/* --------- 交易列表 --------- */
const txHeaders = [
  { title: "交易碼", key: "transactionCode", width: 120 },
  { title: "卡片", key: "cardMasked", width: 240 },
  { title: "金額", key: "amount", width: 120 },
  { title: "回饋", key: "cashback", width: 120 },
  { title: "消費類別", key: "merchantType", width: 120 },
  { title: "描述", key: "description" },
  { title: "時間", key: "transactionTime", width: 180 },
];

const txLoading = ref(false);
const txRows = ref([]);
const txQuery = ref({ yearMonth: "", cardId: null, keyword: "" });

const txCardOptions = computed(() => myCardOptions.value);

async function fetchAllTx() {
  txLoading.value = true;
  try {
    const res = await request({
      url: "/transactionFront/getTransactionByMember",
      method: "GET",
      headers: { Authorization: `Bearer ${memberStore.token}` },
    });
    txRows.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error(e);
    txRows.value = [];
  } finally {
    txLoading.value = false;
  }
}

async function fetchTxByCard(cardId) {
  txLoading.value = true;
  try {
    const res = await request({
      url: "/transactionFront/getTransactionsByCard",
      method: "GET",
      headers: { Authorization: `Bearer ${memberStore.token}` },
      params: { cardId },
    });
    txRows.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error(e);
    txRows.value = [];
  } finally {
    txLoading.value = false;
  }
}

async function fetchTx() {
  if (txQuery.value.cardId != null) {
    await fetchTxByCard(txQuery.value.cardId);
  } else {
    await fetchAllTx();
  }
}

function resetAndFetchTx() {
  txQuery.value = { yearMonth: "", cardId: null, keyword: "" };
  fetchAllTx();
}

const txFiltered = computed(() => {
  const ym = (txQuery.value.yearMonth || "").trim();
  const kw = (txQuery.value.keyword || "").trim().toLowerCase();

  return txRows.value.filter(t => {
    if (ym) {
      const d = new Date(t.transactionTime);
      const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (yyyymm !== ym) return false;
    }
    if (kw) {
      const s = [
        t.description,
        t.merchantType,
        t.transactionCode,
        t.cardDetail?.cardCode,
        t.cardDetail?.cardId,
      ].map(v => (v == null ? "" : String(v))).join(" ").toLowerCase();
      if (!s.includes(kw)) return false;
    }
    return true;
  });
});

/* --------- PayPal --------- */
const amount = ref(500);
const merchantType = ref("餐飲");
const merchantTypes = ["餐飲", "加油", "其他"];

const successText = ref("");
const errorText   = ref("");

// 載入我的卡片（前端只保留 active）
async function fetchMyCards() {
  try {
    const res = await request({
      url: "/memberCard/getCard",
      method: "GET",
      headers: { Authorization: `Bearer ${memberStore.token}` }
    });
    myCards.value = Array.isArray(res) ? res : [];

    const firstActive = activeMyCards.value[0];
    selectedCardId.value = firstActive
      ? Number(firstActive.cardId ?? firstActive.cardDetailId ?? firstActive.id)
      : null;
  } catch (e) {
    console.error(e);
    myCards.value = [];
    selectedCardId.value = null;
  }
}

// PayPal SDK（固定 currency=TWD & components=buttons）
async function ensureSdkLoadedTWD() {
  const existing = [...document.scripts].find(
    s =>
      s.src &&
      s.src.includes("paypal.com/sdk/js") &&
      s.src.includes("currency=TWD") &&
      s.src.includes("components=buttons")
  );
  if (existing && window.paypal) return;

  [...document.scripts]
    .filter(s => s.src && s.src.includes("paypal.com/sdk/js"))
    .forEach(s => s.parentNode && s.parentNode.removeChild(s));

  const clientId = import.meta.env.VITE_PP_CLIENT_ID;
  if (!clientId) throw new Error("缺少 .env 的 VITE_PP_CLIENT_ID（PayPal Sandbox client-id）");

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "paypal-sdk-twd";
    script.src =
      "https://www.paypal.com/sdk/js?" +
      `client-id=${encodeURIComponent(clientId)}` +
      `&currency=TWD&components=buttons`;
    script.onload = resolve;
    script.onerror = () => reject(new Error("PayPal SDK 載入失敗"));
    document.body.appendChild(script);
  });
}

async function renderPaypalButtons() {
  try {
    successText.value = "";
    errorText.value = "";

    await ensureSdkLoadedTWD();

    const host = document.getElementById("paypal-buttons");
    if (!host) throw new Error("找不到 PayPal 按鈕容器 #paypal-buttons");
    host.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },

        async createOrder() {
          successText.value = "";
          errorText.value = "";

          const token = memberStore.token;
          if (!token) throw new Error("未登入或 token 遺失");
          if (!selectedCardId.value) throw new Error("請先選擇你的卡片");

          const amtInt = Math.max(0, Math.round(Number(amount.value || 0)));
          if (amtInt <= 0) throw new Error("金額需為大於 0 的整數");

          try {
            const res = await request({
              url: "/transactionFront/paypal/orders",
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              data: { currency: "TWD", amount: amtInt },
            });
            const orderId = res?.orderId || res?.id;
            if (!orderId) throw new Error("後端回傳缺少 orderId");
            return orderId;
          } catch (e) {
            const msg = e?.response?.data?.message || e?.message || "建單失敗";
            throw new Error(msg);
          }
        },

        async onApprove(data) {
          try {
            const token = memberStore.token;
            if (!selectedCardId.value) throw new Error("請先選擇你的卡片");

            const resp = await request({
              url: "/transactionFront/paypal/capture-and-add",
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              data: {
                orderId: data.orderID,
                cardId: Number(selectedCardId.value), // 只能是已開卡
                merchantType: merchantType.value || "其他",
                description: "PayPal Wallet 交易 - User",
              },
            });

            const hasId =
              resp?.transactionId != null ||
              resp?.transactionCode != null ||
              resp?.id != null;

            if (!hasId) {
              throw new Error("扣款成功但入庫確認失敗（回傳格式不含交易識別資訊）");
            }

            successText.value = `付款成功！交易已入庫（交易碼：${resp.transactionCode ?? resp.transactionId ?? resp.id}）`;
            errorText.value = "";

            fetchTx();
          } catch (e) {
            errorText.value = e?.response?.data?.message || e?.message || "扣款或入庫失敗";
            successText.value = "";
          }
        },

        onError(err) {
          errorText.value = err?.message || "PayPal 付款錯誤";
          successText.value = "";
        },
      })
      .render("#paypal-buttons");
  } catch (e) {
    errorText.value = e?.message || "載入 PayPal 按鈕失敗";
  }
}

/* --------- 共用小工具 --------- */
function maskCard(code) {
  const d = String(code || "").replace(/\D/g, "");
  if (!d) return "••••••••••••••••";
  if (d.length <= 10) return `******${d.slice(-4)}`;
  return `${d.slice(0, 6)}******${d.slice(-4)}`;
}
function fmtMoney(v) {
  const n = Number(v ?? 0);
  const sign = n < 0 ? "-" : "";
  return `${sign}NT$${Math.abs(n).toLocaleString()}`;
}
function amountClass(v) {
  const n = Number(v ?? 0);
  return n < 0 ? "text-error" : "text-primary";
}
function fmtDateTime(v) {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v ?? "");
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return String(v ?? "");
  }
}

onMounted(async () => {
  await fetchMyCards();     // 只保留 active
  await fetchAllTx();
  renderPaypalButtons();
});
</script>

<style scoped>
#paypal-buttons { max-width: 320px; }
:deep(.my-tx-table .my-row) { height: 60px; }
:deep(.my-tx-table .my-row > td) {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  font-size: 15px;
}
:deep(.my-tx-table thead th) {
  padding-top: 16px;
  padding-bottom: 16px;
}
.soft-card {
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
}
:deep(.v-input),
:deep(.v-btn),
:deep(.v-select) { border-radius: 12px !important; }
:deep(.v-input .v-field) { border-radius: 12px !important; }
</style>
