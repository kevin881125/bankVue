<template>
  <div class="modal" v-if="show" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3>繳款明細</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>期數</th>
              <th>實際繳款</th>
              <th>繳款日期</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in payments" :key="index">
              <td>{{ index + 1 }}</td>
              <td>NT$ {{ Number(p.amountPaid || 0).toLocaleString() }}</td>
              <td>{{ p.paymentDate || "-" }}</td>
              <td>{{ p.paymentMethod || "-" }}</td>
            </tr>
            <tr v-if="payments.length === 0">
              <td colspan="5" class="no-data">尚無繳款紀錄</td>
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
  payments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);

const handleOverlayClick = (e) => {
  if (e.target.classList.contains("modal")) {
    emit("close");
  }
};
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

.no-data {
  text-align: center;
  font-size: 14px;
  color: #888;
  padding: 12px 0;
}
</style>
