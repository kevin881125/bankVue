<template>
  <v-container>
    <v-row align="center" class="mb-4" justify="start" dense>
      <v-col cols="12" md="4" sm="6">
        <v-text-field
          v-model="searchName"
          label="會員姓名（模糊搜尋）"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>

      <v-col cols="6" md="2" sm="3">
        <v-select
          v-model="selectedYear"
          :items="years"
          label="選擇年份"
          dense
          outlined
          clearable
        />
      </v-col>

      <v-col cols="6" md="2" sm="3">
        <v-select
          v-model="selectedMonth"
          :items="months"
          label="選擇月份"
          dense
          outlined
          clearable
        />
      </v-col>

      <v-col cols="12" md="2" sm="6">
        <v-btn color="primary" @click="searchTransactions" block>查詢</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="transactions"
      :loading="loading"
      class="elevation-1"
      dense
      disable-sort
      item-key="transactionId"
    >
      <!-- 交易ID -->
      <template #item.transactionId="{ item }">
        {{ item.transactionId }}
      </template>

      <!-- 交易碼 -->
      <template #item.transactionCode="{ item }">
        {{ item.transactionCode }}
      </template>

      <!-- 卡片ID -->
      <template #item.cardId="{ item }">
        {{ item.cardDetail?.cardId || '' }}
      </template>

      <!-- 會員姓名 -->
      <template #item.memberName="{ item }">
        {{ item.member?.mName || '' }}
      </template>

      <!-- 消費金額 -->
      <template #item.amount="{ item }">
        {{ formatCurrency(item.amount) }}
      </template>

      <!-- 回饋金額 -->
      <template #item.cashback="{ item }">
        {{ formatCurrency(item.cashback) }}
      </template>

      <!-- 交易時間 -->
      <template #item.transactionTime="{ item }">
        {{ formatDateTime(item.transactionTime) }}
      </template>

      <!-- 消費類別 -->
      <template #item.merchantType="{ item }">
        {{ item.merchantType }}
      </template>

      <!-- 描述 -->
      <template #item.description="{ item }">
        {{ item.description }}
      </template>

      <!-- 操作 -->
      <template #item.actions="{ item }">
        <v-btn
          color="red"
          small
          v-if="item.amount >= 0"
          @click="refundTransaction(item.transactionId)"
        >
          退款
        </v-btn>
      </template>
    </v-data-table>

    <v-alert
      v-if="!loading && transactions.length === 0"
      type="info"
      class="mt-4"
    >
      查無資料
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { request } from "@/utils/BackAxiosUtil";

const searchName = ref("");
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const years = [];
for (let y = currentYear - 10; y <= currentYear + 1; y++) {
  years.push(String(y));
}
const months = [];
for (let m = 1; m <= 12; m++) {
  months.push(m < 10 ? "0" + m : String(m));
}

const selectedYear = ref(String(currentYear));
const selectedMonth = ref(currentMonth < 10 ? "0" + currentMonth : String(currentMonth));
const loading = ref(false);
const transactions = ref([]);

const headers = [
  { text: "交易ID", value: "transactionId", align: "center" },
  { text: "交易碼", value: "transactionCode", align: "center" },
  { text: "卡片ID", value: "cardId", align: "center" },
  { text: "會員姓名", value: "memberName", align: "center" },
  { text: "消費金額", value: "amount", align: "center" },
  { text: "回饋金額", value: "cashback", align: "center" },
  { text: "交易時間", value: "transactionTime", align: "center" },
  { text: "消費類別", value: "merchantType", align: "center" },
  { text: "描述", value: "description", align: "center" },
  { text: "操作", value: "actions", align: "center", sortable: false },
];

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const dt = new Date(dateTimeStr);
  return dt.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  if (amount == null) return "";
  return Number(amount).toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function searchTransactions() {
  if (!searchName.value.trim()) {
    alert("請輸入會員姓名進行搜尋");
    return;
  }
  if (!selectedYear.value || !selectedMonth.value) {
    alert("請選擇年份與月份");
    return;
  }

  loading.value = true;
  try {
    const yearMonth = selectedYear.value + selectedMonth.value;
    // 這裡不要在前端加 % ，讓後端自己處理模糊查詢
    const res = await request({
      url: "/transactionBack/searchByNameAndMonth",
      method: "GET",
      params: {
        memberName: searchName.value.trim(),
        yearMonth: yearMonth,
      },
    });
    transactions.value = res;
  } catch (error) {
    console.error("查詢失敗", error);
    alert("查詢失敗，請稍後再試");
  } finally {
    loading.value = false;
  }
}

async function refundTransaction(transactionId) {
  if (!confirm("確定要退款此筆交易嗎？")) return;

  try {
    await request({
      url: "/transactionBack/refund",
      method: "POST",
      params: { transactionId },
    });
    alert("退款成功");
    await searchTransactions();
  } catch (error) {
    console.error("退款失敗", error);
    alert("退款失敗，請稍後再試");
  }
}
</script>

<style scoped></style>
