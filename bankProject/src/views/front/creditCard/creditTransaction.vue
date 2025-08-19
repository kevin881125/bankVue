<template>
  <v-container>
    <!-- ============== 我的交易（新加） ============== -->
    <v-card class="pa-4 mb-6">
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
            label="卡片"
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
        class="mt-2"
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

    <!-- ============== 你原本的「PayPal 模擬刷卡」 ============== -->
    <v-card class="pa-4">
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

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="cardId"
              type="number"
              min="1"
              label="卡片 ID（測試）"
              hint="之後可改成載入使用者卡片"
              persistent-hint
              clearable
            />
          </v-col>
        </v-row>

        <!-- PayPal Wallet 按鈕容器 -->
        <div id="paypal-buttons" class="mt-4" />

        <div class="text-caption mt-2">技術支援供應方：<strong>PayPal</strong></div>

        <v-alert v-if="errorText" type="error" class="mt-4">{{ errorText }}</v-alert>
        <v-alert v-if="successText" type="success" class="mt-4">{{ successText }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";

const memberStore = useMemberStore();

/* -------------------- 新加：交易區塊 -------------------- */
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

const txCardOptions = computed(() => {
  const seen = new Map();
  txRows.value.forEach(t => {
    const c = t.cardDetail;
    if (c?.cardId && !seen.has(c.cardId)) {
      seen.set(c.cardId, {
        value: c.cardId,
        label: `${maskCard(c.cardCode)}（#${c.cardId}）`,
      });
    }
  });
  return Array.from(seen.values());
});

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
    // 月份過濾
    if (ym) {
      const d = new Date(t.transactionTime);
      const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (yyyymm !== ym) return false;
    }
    // 關鍵字過濾
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

/* -------------------- 你原本的 PayPal 區塊 -------------------- */
const amount = ref(500);                 // TWD 整數
const merchantType = ref("餐飲");
const merchantTypes = ["餐飲", "加油", "其他"];
const cardId = ref(19);                  // 測試卡片 ID

const successText = ref("");
const errorText   = ref("");

// 只載一次、而且強制 currency=TWD & components=buttons
async function ensureSdkLoadedTWD() {
  const existing = [...document.scripts].find(
    s =>
      s.src &&
      s.src.includes("paypal.com/sdk/js") &&
      s.src.includes("currency=TWD") &&
      s.src.includes("components=buttons")
  );
  if (existing && window.paypal) return;

  // 清掉任何舊 SDK，避免參數不一致
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
    host.innerHTML = ""; // 重新渲染清空

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },

        // 只走「後端建單」
        async createOrder() {
          successText.value = "";
          errorText.value = "";

          const token = memberStore.token;
          if (!token) throw new Error("未登入或 token 遺失");

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
            console.log("[createOrder] backend orderId =", orderId);
            return orderId;
          } catch (e) {
            console.error("[createOrder] 後端建單失敗", e);
            const msg = e?.response?.data?.message || e?.message || "建單失敗";
            throw new Error(msg);
          }
        },

        async onApprove(data) {
          try {
            const token = memberStore.token;
            const resp = await request({
              url: "/transactionFront/paypal/capture-and-add",
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              data: {
                orderId: data.orderID,
                cardId: Number(cardId.value),
                merchantType: merchantType.value || "其他",
                description: "PayPal Wallet 交易 - User",
              },
            });

            const hasId =
              resp?.transactionId != null ||
              resp?.transactionCode != null ||
              resp?.id != null;

            if (!hasId) {
              console.error("[capture-and-add] 後端回傳不含交易識別資訊", resp);
              throw new Error("扣款成功但入庫確認失敗（回傳格式不含交易識別資訊）");
            }

            successText.value = `付款成功！交易已入庫（交易碼：${resp.transactionCode ?? resp.transactionId ?? resp.id}）`;
            errorText.value = "";

            // 付款完成後，順便刷新上面的「我的交易」
            fetchTx();
          } catch (e) {
            console.error("[onApprove] error", e);
            errorText.value =
              e?.response?.data?.message || e?.message || "扣款或入庫失敗";
            successText.value = "";
          }
        },

        onError(err) {
          console.error("[paypal onError]", err);
          errorText.value = err?.message || "PayPal 付款錯誤";
          successText.value = "";
        },
      })
      .render("#paypal-buttons");
  } catch (e) {
    console.error(e);
    errorText.value = e?.message || "載入 PayPal 按鈕失敗";
  }
}

/* -------------------- 共用小工具 -------------------- */
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

onMounted(() => {
  fetchAllTx();          // 先帶入我的交易
  renderPaypalButtons(); // 渲染 PayPal
});
</script>

<style scoped>
#paypal-buttons { max-width: 320px; }
</style>
