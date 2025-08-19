<template>
  <v-container>
    <!-- 搜尋/查詢付款紀錄 -->
    <v-row class="mb-2">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="searchCardId"
          label="卡片ID"
          type="number"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="2">
        <v-btn color="primary" @click="fetchPayments" :loading="loading" block>
          查詢付款紀錄
        </v-btn>
      </v-col>
    </v-row>

    <!-- 累積金額顯示 -->
    <v-alert v-if="totalPaid !== null" type="info" class="mt-2">
      卡片 {{ searchCardId }} 的累積繳費金額：<strong>{{ formatCurrency(totalPaid) }}</strong>
    </v-alert>

    <!-- 成功/錯誤提示 -->
    <v-alert v-if="errorText" type="error" class="mt-2">{{ errorText }}</v-alert>
    <v-alert v-if="successText" type="success" class="mt-2">{{ successText }}</v-alert>

    <!-- 付款紀錄表格 -->
    <v-data-table
      :headers="headers"
      :items="filteredPayments"
      :loading="loading"
      item-key="paymentId"
      dense
      class="elevation-1"
    >
      <!-- 表頭 -->
      <template #header.paymentId>付款ID</template>
      <template #header.cardId>卡片ID</template>
      <template #header.memberId>會員ID</template>
      <template #header.paymentDate>付款日期</template>
      <template #header.amount>金額</template>
      <template #header.paymentMethod>付款方式</template>
      <template #header.status>狀態</template>
      <template #header.actions>操作</template>

      <!-- item slot 保留原本 -->
      <template #item.amount="{ item }">{{ formatCurrency(item.amount) }}</template>
      <template #item.paymentDate="{ item }">{{ formatDate(item.paymentDate) }}</template>
      <template #item.status="{ item }">
        <v-chip
          :color="item.status === 'FAILED' ? 'red' : (item.status === 'PROCESSING' ? 'orange' : 'green')"
          dark
          small
        >
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn small color="primary" @click="openUpdateDialog(item)">更新狀態</v-btn>
      </template>
    </v-data-table>

    <v-alert v-if="!loading && filteredPayments.length === 0" type="info" class="mt-2">
      查無資料
    </v-alert>

    <!-- 更新狀態 Dialog -->
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>更新付款狀態</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStatus"
            :items="['COMPLETED', 'FAILED']"
            label="選擇新狀態"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">取消</v-btn>
          <v-btn color="primary" @click="updateStatus">確認</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { request } from "@/utils/BackAxiosUtil";

const searchCardId = ref("");
const payments = ref([]);
const loading = ref(false);
const successText = ref("");
const errorText = ref("");
const totalPaid = ref(null);

const dialog = ref(false);
const selectedPaymentId = ref(null);
const selectedStatus = ref("");

// 表頭（保留原本 headers 參數）
const headers = [
  { text: "付款ID", value: "paymentId", align: "center" },
  { text: "卡片ID", value: "cardId", align: "center" },
  { text: "會員ID", value: "memberId", align: "center" },
  { text: "付款日期", value: "paymentDate", align: "center" },
  { text: "金額", value: "amount", align: "center" },
  { text: "付款方式", value: "paymentMethod", align: "center" },
  { text: "狀態", value: "status", align: "center" },
  { text: "操作", value: "actions", align: "center", sortable: false },
];

// 取得付款紀錄
async function fetchPayments() {
  loading.value = true;
  errorText.value = "";
  totalPaid.value = null;
  try {
    if (!searchCardId.value) {
      errorText.value = "請輸入卡片ID";
      payments.value = [];
      return;
    }
    const res = await request({
      url: "/cardPaymentBack/getPaymentByCard",
      method: "GET",
      params: { cardId: searchCardId.value },
    });
    payments.value = Array.isArray(res) ? res : [];
    successText.value = "查詢成功";

    // 查詢累積金額
    const total = await request({
      url: "/cardPaymentBack/totalPaid",
      method: "GET",
      params: { cardId: searchCardId.value },
    });
    totalPaid.value = total;
  } catch (err) {
    payments.value = [];
    errorText.value = err?.message || "查詢付款紀錄失敗";
  } finally {
    loading.value = false;
  }
}

// 更新狀態
function openUpdateDialog(item) {
  selectedPaymentId.value = item.paymentId;
  selectedStatus.value = item.status;
  dialog.value = true;
}
async function updateStatus() {
  try {
    await request({
      url: "/cardPaymentBack/updateStatus",
      method: "POST",
      params: {
        paymentId: selectedPaymentId.value,
        status: selectedStatus.value,
      },
    });
    successText.value = "狀態更新成功";
    dialog.value = false;
    await fetchPayments(); // 更新表格 + 累積金額
  } catch (err) {
    errorText.value = err?.message || "更新狀態失敗";
  }
}

// 過濾付款紀錄
const filteredPayments = computed(() => {
  return payments.value;
});

function formatCurrency(value) {
  if (value == null) return "NT$0";
  const num = Number(value);
  return `NT$${num.toLocaleString()}`;
}

function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
