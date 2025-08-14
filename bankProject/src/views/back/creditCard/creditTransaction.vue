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
      item-key="transactionId"
      show-header
    >
      <!-- 表頭 slot -->
      <template #header.transactionId>
        <span class="text-center">交易ID</span>
      </template>
      <template #header.transactionCode>
        <span class="text-center">交易碼</span>
      </template>
      <template #header.cardId>
        <span class="text-center">卡片ID</span>
      </template>
      <template #header.memberName>
        <span class="text-center">會員姓名</span>
      </template>
      <template #header.amount>
        <span class="text-center">消費金額</span>
      </template>
      <template #header.cashback>
        <span class="text-center">回饋金額</span>
      </template>
      <template #header.transactionTime>
        <span class="text-center">交易時間</span>
      </template>
      <template #header.merchantType>
        <span class="text-center">消費類別</span>
      </template>
      <template #header.description>
        <span class="text-center">描述</span>
      </template>
      <template #header.actions>
        <span class="text-center">操作</span>
      </template>

      <!-- 內容 slot -->
      <template #item.transactionId="{ item }">
        {{ item.transactionId }}
      </template>

      <template #item.transactionCode="{ item }">
        {{ item.transactionCode }}
      </template>

      <template #item.cardId="{ item }">
        {{ item.cardDetail?.cardId || "" }}
      </template>

      <template #item.memberName="{ item }">
        {{ item.member?.mName || "" }}
      </template>

      <template #item.amount="{ item }">
        {{ formatCurrency(item.amount) }}
      </template>

      <template #item.cashback="{ item }">
        {{ formatCurrency(item.cashback) }}
      </template>

      <template #item.transactionTime="{ item }">
        {{ formatDateTime(item.transactionTime) }}
      </template>

      <template #item.merchantType="{ item }">
        {{ item.merchantType }}
      </template>

      <template #item.description="{ item }">
        {{ item.description }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          color="red"
          small
          v-if="item.amount >= 0 && (!item.description || !item.description.includes('（已退款）'))"
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
