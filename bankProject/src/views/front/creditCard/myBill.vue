<template>
  <v-container>
    <v-card class="pa-4 mb-4">
      <v-card-title>我的信用卡帳單</v-card-title>

      <v-data-table
        :headers="headers"
        :items="bills"
        :loading="loading"
        item-key="creditBillId"
        density="compact"
        class="elevation-1"
      >
        <template #item.cardMasked="{ item }">
          {{ maskCardMiddle(item?.cardDetail?.cardCode) }}
        </template>
        <template #item.billingDate="{ item }">
          {{ fmtDate(item.billingDate) }}
        </template>
        <template #item.dueDate="{ item }">
          {{ fmtDate(item.dueDate) }}
        </template>
        <template #item.totalAmount="{ item }">
          {{ fmtMoney(item.totalAmount) }}
        </template>
        <template #item.paidAmount="{ item }">
          {{ fmtMoney(item.paidAmount) }}
        </template>
        <template #item.minimumPayment="{ item }">
          {{ fmtMoney(item.minimumPayment) }}
        </template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="flat">
            {{ item.status || '未繳' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            :disabled="outstandingOf(item) <= 0 || item.status === '已繳清' || item.status === '本期無須繳款'"
            @click="openPay(item)"
          >
            去繳費
          </v-btn>
        </template>

        <template #bottom>
          <div class="pa-3 d-flex align-center justify-end">
            <v-btn size="small" variant="tonal" @click="fetchBills">重新整理</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 繳費對話框 -->
    <v-dialog v-model="payDialog" max-width="520">
      <v-card>
        <v-card-title class="pb-0">
          繳費
          <div class="text-body-2 text-grey-darken-1 mt-1">
            卡號：{{ selectedBill ? maskCardMiddle(selectedBill.cardDetail?.cardCode) : '' }}
          </div>
        </v-card-title>

        <v-card-text>
          <div class="text-caption text-grey-darken-1 mb-3">
            帳單日期：{{ selectedBill ? fmtDate(selectedBill.billingDate) : '' }}，
            到期日：{{ selectedBill ? fmtDate(selectedBill.dueDate) : '' }}
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="payForm.accountId"
                label="付款帳號（你的活存/扣款帳號）"
                placeholder="例如：001234567890"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-caption text-grey-darken-1">
                  未繳：{{ money(outstandingOf(selectedBill)) }}　
                  最低應繳：{{ money(selectedBill?.minimumPayment || 0) }}
                </div>

                <!-- 用 v-btn-toggle，避免 v-segmented-button 錯誤 -->
                <v-btn-toggle v-model="quick" density="comfortable" mandatory divided class="rounded">
                  <v-btn value="min">最低</v-btn>
                  <v-btn value="full">全額</v-btn>
                  <v-btn value="custom">自訂</v-btn>
                </v-btn-toggle>
              </div>

              <v-text-field
                v-model.number="payForm.amount"
                type="number"
                min="0"
                label="付款金額 (TWD)"
                hint="TWD 為整數金額"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-alert v-if="payError" type="error" class="mt-2">{{ payError }}</v-alert>
          <v-alert v-if="paySuccess" type="success" class="mt-2">{{ paySuccess }}</v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="payDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="paying" @click="submitPay">確認繳費</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";

const memberStore = useMemberStore();

const headers = [
  { title: "卡號", key: "cardMasked" },
  { title: "帳單日期", key: "billingDate" },
  { title: "到期日", key: "dueDate" },
  { title: "總金額", key: "totalAmount" },
  { title: "已繳金額", key: "paidAmount" },
  { title: "最低應繳", key: "minimumPayment" },
  { title: "狀態", key: "status" },
  { title: "操作", key: "actions", sortable: false },
];

const bills = ref([]);
const loading = ref(false);

// pay dialog 狀態
const payDialog = ref(false);
const selectedBill = ref(null);
const paying = ref(false);
const payError = ref("");
const paySuccess = ref("");
const quick = ref("min");
const payForm = ref({ accountId: "", amount: null });

// 取得我的帳單
async function fetchBills() {
  loading.value = true;
  try {
    const res = await request({
      url: "/creditBillFront/myBills",
      method: "GET",
      headers: { Authorization: `Bearer ${memberStore.token}` },
    });
    bills.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error(e);
    bills.value = [];
  } finally {
    loading.value = false;
  }
}

function openPay(bill) {
  selectedBill.value = bill;
  payError.value = "";
  paySuccess.value = "";
  quick.value = "min";
  payForm.value.amount = Number(bill?.minimumPayment || 0);
  payDialog.value = true;
}

// 送出繳費（@RequestParam → x-www-form-urlencoded）
async function submitPay() {
  payError.value = "";
  paySuccess.value = "";
  if (!selectedBill.value) return;

  if (!payForm.value.accountId) {
    payError.value = "請輸入付款帳號";
    return;
  }
  const amt = Math.max(0, Math.round(Number(payForm.value.amount) || 0));
  if (amt <= 0) {
    payError.value = "付款金額需大於 0";
    return;
  }

  try {
    paying.value = true;

    const body = new URLSearchParams();
    body.append("creditBillId", String(selectedBill.value.creditBillId));
    body.append("cardId", String(selectedBill.value.cardDetail?.cardId));
    body.append("accountId", payForm.value.accountId);
    body.append("amount", String(amt));

    const resp = await request({
      url: "/cardPaymentFront/pay",
      method: "POST",
      headers: {
        Authorization: `Bearer ${memberStore.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: body,
    });

    if (!resp || !resp.status) throw new Error("繳費失敗或無回應");
    if (resp.status !== "COMPLETED") throw new Error(`繳費狀態：${resp.status}`);

    paySuccess.value = "繳款成功！帳單已更新。";
    await fetchBills();
  } catch (e) {
    console.error(e);
    payError.value = e?.response?.data?.message || e?.message || "繳費發生錯誤，請稍後重試";
  } finally {
    paying.value = false;
  }
}

// 快速金額切換
watch(quick, () => {
  if (!selectedBill.value) return;
  const due = outstandingOf(selectedBill.value);
  if (quick.value === "min") {
    payForm.value.amount = Number(selectedBill.value.minimumPayment || 0);
  } else if (quick.value === "full") {
    payForm.value.amount = Number(due);
  }
});

// 工具
function outstandingOf(bill) {
  if (!bill) return 0;
  const total = toNum(bill.totalAmount);
  const paid = toNum(bill.paidAmount);
  return Math.max(0, total - paid);
}
function statusColor(s) {
  if (s === "已繳清") return "green";
  if (s === "已繳最低") return "amber";
  if (s === "本期無須繳款") return "grey";
  return "red";
}
function maskCardMiddle(code) {
  const d = String(code || "").replace(/\D/g, "");
  if (!d) return "••••••••••••••••";
  if (d.length <= 10) return `******${d.slice(-4)}`;
  return `${d.slice(0, 6)}******${d.slice(-4)}`;
}
function fmtMoney(v) {
  const n = Number(v ?? 0);
  return `NT$${n.toLocaleString()}`;
}
function money(n) { return `NT$${Number(n ?? 0).toLocaleString()}`; }
function fmtDate(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}
function toNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

onMounted(fetchBills);
</script>
