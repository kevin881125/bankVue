<template>
  <div class="modal" v-if="show" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3>審核紀錄清單</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>審核時間</th>
              <th>貸款帳號</th>
              <th>審核人員ID</th>
              <th>決策</th>
              <th>備註</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.reviewId">
              <td>{{ record.reviewTime || "無資料" }}</td>
              <td>{{ record.loanId || "無資料" }}</td>
              <td>{{ record.reviewerId || "申貸人補件" }}</td>
              <td :class="getDecisionClass(record.decision)">
                {{ translateDecision(record.decision) }}
              </td>
              <td>{{ record.notes || "-" }}</td>
            </tr>
            <tr v-if="records.length === 0">
              <td colspan="4" class="no-data">尚無審核紀錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  show: Boolean,
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);

// 點背景遮罩關閉
const handleOverlayClick = (e) => {
  if (e.target.classList.contains("modal")) {
    emit("close");
  }
};

function translateDecision(decision) {
  switch (decision) {
    case "approved":
      return "審核通過";
    case "rejected":
      return "拒絕";
    case "pending":
      return "待審核";
    case "supplement":
      return "補件中";
    default:
      return "未知狀態";
  }
}

function getDecisionClass(decision) {
  switch (decision) {
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
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 60vw;
  max-width: 800px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  padding: 24px 32px;
  font-family: "Noto Sans TC", sans-serif;
  color: #333;
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 24px;
  color: #444;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;
  line-height: 1;
  padding: 0;
}
.close-btn:hover {
  color: #000;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  background-color: #fff;
  color: #444;
  font-weight: 600;
  padding: 12px 10px;
  text-align: center;
  border-bottom: 2px solid #ddd;
  font-size: 16px;
}

tbody td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

/* 移除文字顏色設定 */
.status-approved::before,
.status-rejected::before,
.status-pending-docs::before,
.status-reviewing::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
  vertical-align: middle;
}

/* 根據狀態給不同顏色 */
.status-approved::before {
  background-color: #ebb211; /* 黃色 */
}

.status-rejected::before {
  background-color: #222626; /* 深灰/黑 */
}

.status-pending-docs::before {
  background-color: #ce1465; /* 粉紅/桃紅 */
}

.status-reviewing::before {
  background-color: #444b4b; /* 灰色 */
}

/* 文字顏色還原為預設 */
.status-approved,
.status-rejected,
.status-pending-docs,
.status-reviewing {
  color: inherit;
  font-weight: 600;

  text-align: left;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
