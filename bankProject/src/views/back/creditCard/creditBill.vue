<template>
  <v-container>
    <!-- 產生帳單 -->
    <v-card class="mb-6" outlined>
      <v-card-title>產生新帳單</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onGenerate">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.cardId"
                label="卡片 ID"
                type="number"
                required
                clearable
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.billingYearMonth"
                label="帳單年月 (yyyyMM)"
                placeholder="202508"
                required
                clearable
                hint="例如：202508"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="4" class="d-flex align-center">
              <v-btn color="primary" large type="submit" :loading="submitting" block>
                產生帳單
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-alert
          v-if="errorText"
          type="error"
          class="mt-4"
          dense
          border="start"
        >{{ errorText }}</v-alert>

        <v-alert
          v-if="successText"
          type="success"
          class="mt-4"
          dense
          border="start"
        >{{ successText }}</v-alert>
      </v-card-text>
    </v-card>

    <!-- 搜尋 -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="search"
          label="搜尋（卡號/卡種/狀態/金額/日期）"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>
      <v-col cols="12" sm="2">
        <v-btn color="primary" @click="fetchBills" :loading="loading" block>重新整理</v-btn>
      </v-col>
    </v-row>

    <!-- 帳單表格 -->
    <v-data-table
      :headers="headers"
      :items="filteredBills"
      :loading="loading"
      item-key="creditBillId"
      show-header
      dense
    >
      <!-- 表頭 -->
      <template #header.creditBillId>帳單ID</template>
      <template #header.cardId>卡片ID</template>
      <template #header.cardNumber>卡號</template>
      <template #header.cardType>卡種</template>
      <template #header.creditLimit>額度</template>
      <template #header.currentBalance>剩餘額度</template>
      <template #header.billingDate>帳單日期</template>
      <template #header.dueDate>繳款截止日</template>
      <template #header.totalAmount>總金額</template>
      <template #header.minimumPayment>最低應繳</template>
      <template #header.paidAmount>已繳金額</template>
      <template #header.status>狀態</template>

      <!-- 內容 -->
      <template #item.cardId="{ item }">{{ item.cardDetail?.cardId ?? "-" }}</template>
      <template #item.cardNumber="{ item }">{{ maskCardNumber(item.cardDetail?.cardCode) }}</template>
      <template #item.cardType="{ item }">{{ item.cardDetail?.cardType?.typeName ?? "-" }}</template>
      <template #item.creditLimit="{ item }">{{ formatCurrency(item.cardDetail?.cardType?.defaultLimit) }}</template>
      <template #item.currentBalance="{ item }">{{ formatCurrency(item.cardDetail?.currentBalance) }}</template>
      <template #item.billingDate="{ item }">{{ formatDate(item.billingDate) }}</template>
      <template #item.dueDate="{ item }">{{ formatDate(item.dueDate) }}</template>
      <template #item.totalAmount="{ item }">{{ formatCurrency(item.totalAmount) }}</template>
      <template #item.minimumPayment="{ item }">{{ formatCurrency(item.minimumPayment) }}</template>
      <template #item.paidAmount="{ item }">{{ formatCurrency(item.paidAmount) }}</template>
      <template #item.status="{ item }">
        <v-chip :color="item.status === '未繳' ? 'red' : 'green'" dark small>
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>

    <v-alert v-if="!loading && filteredBills.length === 0" type="info" class="mt-4">
      查無資料
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { request } from "@/utils/BackAxiosUtil";

const form = ref({ cardId: "", billingYearMonth: "" });
const bills = ref([]);
const loading = ref(false);
const submitting = ref(false);
const search = ref("");
const successText = ref("");
const errorText = ref("");

const headers = [
  { text: "帳單ID", value: "creditBillId", align: "center" },
  { text: "卡片ID", value: "cardId", align: "center" },
  { text: "卡號", value: "cardNumber", align: "center" },
  { text: "卡種", value: "cardType", align: "center" },
  { text: "額度", value: "creditLimit", align: "center" },
  { text: "剩餘額度", value: "currentBalance", align: "center" },
  { text: "帳單日期", value: "billingDate", align: "center" },
  { text: "繳款截止日", value: "dueDate", align: "center" },
  { text: "總金額", value: "totalAmount", align: "center" },
  { text: "最低應繳", value: "minimumPayment", align: "center" },
  { text: "已繳金額", value: "paidAmount", align: "center" },
  { text: "狀態", value: "status", align: "center" },
];

async function fetchBills() {
  loading.value = true;
  errorText.value = "";
  try {
    const res = await request({ url: "/creditBillBack/getAllBills", method: "GET" });
    bills.value = Array.isArray(res) ? res : [];
    console.log("取得帳單資料:", res);
  } catch (err) {
    bills.value = [];
    errorText.value = err?.message || "取得帳單失敗";
    console.error("[getAllBills] error:", err);
  } finally {
    loading.value = false;
  }
}

async function onGenerate() {
  successText.value = "";
  errorText.value = "";

  const cardIdStr = String(form.value.cardId || "").trim();
  const ym = String(form.value.billingYearMonth || "").trim();
  if (!cardIdStr || !/^\d+$/.test(cardIdStr) || !/^\d{6}$/.test(ym)) {
    errorText.value = "請輸入有效的卡片 ID 與帳單年月（yyyyMM）";
    return;
  }

  submitting.value = true;
  try {
    const body = new URLSearchParams();
    body.append("cardId", cardIdStr);
    body.append("billingYearMonth", ym);

    await request({
      url: "/creditBillBack/generateBill",
      method: "POST",
      data: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    successText.value = "帳單產生成功";
    form.value.cardId = "";
    form.value.billingYearMonth = "";
    await fetchBills();
  } catch (err) {
    errorText.value = err?.message || "產生帳單失敗";
    console.error("[generateBill] error:", err);
  } finally {
    submitting.value = false;
  }
}

const filteredBills = computed(() => {
  const q = (search.value || "").trim().toLowerCase();
  if (!q) return bills.value;
  return bills.value.filter((b) => {
    const fields = [
      b.creditBillId,
      b.cardDetail?.cardId,
      b.cardDetail?.cardCode,
      b.cardDetail?.cardType?.typeName,
      b.cardDetail?.cardType?.defaultLimit,
      b.cardDetail?.currentBalance,
      b.billingDate,
      b.dueDate,
      b.totalAmount,
      b.minimumPayment,
      b.paidAmount,
      b.status,
    ]
      .map((v) => (v == null ? "" : String(v)))
      .join(" ")
      .toLowerCase();
    return fields.includes(q);
  });
});

function formatCurrency(value) {
  if (value == null || value === "") return "NT$0";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `NT$${num.toLocaleString()}`;
}

function formatDate(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return String(v);
  }
}

function maskCardNumber(cardCode) {
  if (!cardCode) return "-";
  return cardCode.slice(0, 6) + "******" + cardCode.slice(-4);
}

onMounted(() => {
  fetchBills();
});
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
