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
    <td>{{ loan.approvalStatus }}</td>
    <td>{{ loan.createdAt }}</td>
    <td>
      <button class="look" @click="onOpenDetail">
        <span class="mdi mdi-eye"></span>
      </button>
      <button class="edit" @click="onEditReview">
        <span class="mdi mdi-lead-pencil"></span>
      </button>
    </td>
  </tr>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

// 定義傳入的 loan 物件
const props = defineProps({
  loan: {
    type: Object,
    required: true,
  },
});

// 定義可觸發的事件
const emit = defineEmits(["open-detail", "edit-review"]);

// 查看詳情
function onOpenDetail() {
  emit("open-detail", props.loan.loanId);
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
button.edit {
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
</style>
