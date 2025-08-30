<template>
  <teleport to="body">
    <transition name="fade-scale">
      <div
        v-if="modelValue"
        class="success-wrap"
        role="status"
        aria-live="polite"
      >
        <div class="success-card">
          <svg class="checkmark" viewBox="0 0 52 52" aria-hidden="true">
            <circle
              class="checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path class="checkmark-check" fill="none" d="M14 27 l8 8 l16 -16" />
          </svg>
          <p class="msg">{{ message }}</p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { onMounted, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model
  message: { type: String, default: "修改成功" },
  duration: { type: Number, default: 1400 }, // 毫秒：多久自動關閉
});
const emit = defineEmits(["update:modelValue", "closed"]);

let timer;

const startAutoClose = () => {
  clearTimeout(timer);
  if (!props.modelValue) return;
  timer = setTimeout(() => {
    emit("update:modelValue", false);
    emit("closed");
  }, props.duration);
};

onMounted(startAutoClose);
watch(
  () => props.modelValue,
  async (v) => {
    clearTimeout(timer);
    if (v) {
      // 重新觸發 SVG 動畫
      await nextTick();
      const svg = document.querySelector(".checkmark");
      if (svg) {
        svg.style.animation = "none";
        // 強制重排以重啟動畫
        // eslint-disable-next-line no-unused-expressions
        svg.offsetHeight;
        svg.style.animation = "";
      }
      startAutoClose();
    }
  }
);
</script>

<style scoped>
.success-wrap {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none; /* 不擋點擊 */
  z-index: 9999;
}

.success-card {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  width: 200px;   /* ✅ 固定卡片寬 */
  height: 200px;  /* ✅ 固定卡片高 */
  padding: 20px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
  display: grid;
  justify-items: center;
  align-content: center; /* 垂直置中 */
  gap: 16px;
  transform: translateZ(0);
}

/* 進出場 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.22s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* SVG 尺寸 (維持原本 64x64) */
.checkmark {
  width: 64px;
  height: 64px;
}

/* 畫圓動畫 */
.checkmark-circle {
  stroke: #22c55e; /* 綠色 */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: circle-draw 0.5s ease-out forwards;
}

/* 打勾動畫 */
.checkmark-check {
  stroke: #22c55e;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: check-draw 0.35s 0.35s ease-out forwards;
}

/* 彈跳縮放 */
.checkmark {
  animation: pop 0.4s 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

/* 文字 (放大) */
.msg {
  margin: 0;
  font-size: 20px; /* ✅ 放大文字 */
  color: #0a0a0a;
  text-align: center;
}

/* Keyframes */
@keyframes circle-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
</style>
