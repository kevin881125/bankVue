<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="message">
          <span class="mdi mdi-check-circle-outline alert-icon"></span>
          <span class="text-message">{{ successMessage }}</span>
        </div>
        <div class="buttons">
          <button @click="close">關閉</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: Boolean,
  successMessage: {
    type: String,
    default: "操作成功",
  },
});

const emit = defineEmits(["cancel"]);

function close() {
  emit("cancel");
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
  z-index: 3000;
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
  background-color: #ec3629;
  color: white;
}

.alert-icon {
  font-size: 64px;
  color: #ec3629;
}
.text-message {
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-content: center;
  color: #222626;
}
</style>
