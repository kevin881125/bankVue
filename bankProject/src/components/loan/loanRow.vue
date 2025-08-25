<template>
  <tr>
    <td>{{ loan.loanId }}</td>
    <td>{{ loan.mname }}</td>
    <td>{{ loan.loanTypeName }}</td>
    <td>{{ loan.loanTerm }}<span class="unit">/月</span></td>
    <td><span class="unit">NT$</span>{{ loan.loanAmount.toLocaleString() }}</td>
    <td>
      {{ (loan.interestRate * 100).toFixed(2) }}<span class="unit">%</span>
    </td>
    <td :class="['status-cell', getStatusClass(loan.approvalStatus)]">
      {{ translateStatus(loan.approvalStatus) }}
    </td>
    <td>{{ loan.createdAt }}</td>
    <td>
      <!-- 查看詳細資料 -->
      <button class="look" @click="onOpenDetail">
        <span class="mdi mdi-eye"></span>
      </button>

      <!-- 如果已通過 → 顯示「查看繳款」，否則顯示「審核貸款」 -->
      <button
        v-if="loan.approvalStatus === 'approved'"
        class="payment"
        @click="onOpenRepayment"
      >
        <span class="mdi mdi-cash"></span>
      </button>
      <button v-else class="edit" @click="onEditReview">
        <span class="mdi mdi-lead-pencil"></span>
      </button>

      <!-- 合約下載按鈕（審核通過才會有） -->
      <button
        v-if="loan.approvalStatus === 'approved' && loan.contractPath"
        class="download"
        @click="onDownloadContract"
      >
        <span class="mdi mdi-download"></span>
      </button>
    </td>
  </tr>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { translateStatus } from "@/components/loan/utils/statusHelper";

// 定義傳入的 loan 物件
const props = defineProps({
  loan: {
    type: Object,
    required: true,
  },
});

function getStatusClass(status) {
  switch (status) {
    case "approved":
      return "status-approved";
    case "rejected":
      return "status-rejected";
    case "supplement":
      return "status-pending-docs";
    case "pending":
      return "status-reviewing";
    default:
      return "";
  }
}

function onDownloadContract() {
  // contractPath 是類似 "/uploadImg/contract/loanId_timestamp.ext"
  // 可根據實際的路徑組合完整下載 URL

  const baseUrl = "http://localhost:8080"; // 你的後端網址或環境變數
  const url = baseUrl + loan.contractPath;

  // 新分頁開啟下載連結
  window.open(url, "_blank");
}

// 定義可觸發的事件
const emit = defineEmits(["open-detail", "edit-review", "open-repayment"]);

// 查看詳情
function onOpenDetail() {
  emit("open-detail", props.loan.loanId);
}

// 開啟繳款明細
function onOpenRepayment() {
  emit("open-repayment", props.loan.loanId);
}

// loanRow.vue - 按下編輯按鈕時 emit loanId（不是整筆 loan）：
function onEditReview() {
  emit("edit-review", props.loan.loanId);
}
</script>

<style scoped>
.unit {
  font-size: 10px;
  margin-left: 2px;
}

td {
  padding: 12px 10px;
  text-align: center;
  background-color: #ffffff;
  color: #666a6a;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 資料列 hover 效果 */
tr:hover td {
  background-color: #f9f9f9;
}

/* 操作按鈕樣式統一 */
button.look,
button.edit,
button.payment,
button.download {
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 18px;
}

/* hover 效果區分行為 */
button.look:hover {
  background-color: #faedcd; /* 淡琥珀黃 */
}

button.edit:hover {
  background-color: #f8d6e3; /* 淡玫紅 */
}

button.download:hover {
  background-color: #cce5ff; /* 淡藍色 */
}

button.payment:hover {
  background-color: #ccffdd; /* 淡藍綠色 */
}

.status-cell {
  text-align: left;
  position: relative;
  padding-left: 24px;
  font-weight: 600;
  color: #666a6a;
  transform: translateX(38px); /* 往右移 20px */
}

.status-cell::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-approved::before {
  background-color: #ebb211;
}

.status-rejected::before {
  background-color: #222626;
}

.status-pending-docs::before {
  background-color: #ce1465;
}

.status-reviewing::before {
  background-color: #444b4b;
}
</style>
