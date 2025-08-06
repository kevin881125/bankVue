<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3>請確認</h3>
      <p>{{ message }}</p>
      <div class="buttons">
        <button @click="confirm">確定</button>
        <button @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: Boolean,
  message: {
    type: String,
    default: "你確定要儲存嗎？",
  },
});

const emit = defineEmits(["confirm", "cancel"]);

function close() {
  emit("cancel");
}

function confirm() {
  emit("confirm");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  text-align: center;
}
.buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
button {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  opacity: 0.8;
}
button:first-child {
  background-color: #ebb211;
  color: white;
}
button:last-child {
  background-color: #ccc;
  color: #333;
}
</style>
