<template>
  <aside class="steps">
    <ol class="step-list">
      <li class="step" :class="{ active: cur === 1, completed: cur > 1 }">
        <div class="icon">
          <span class="mdi mdi-cellphone-check step-icon"></span>
        </div>
        <div class="text">
          <div class="title">嗨，第一次見面</div>
          <div class="bold">1. 綁定手機號碼</div>
        </div>
      </li>
      <li class="step" :class="{ active: cur === 2, completed: cur > 2 }">
        <div class="icon">
          <span class="mdi mdi-image-multiple step-icon"></span>
        </div>
        <div class="text">
          <div class="muted">準備好，亮出證件</div>
          <div class="bold">2. 填寫開戶資料</div>
        </div>
      </li>
      <li class="step" :class="{ active: cur === 3, completed: cur > 3 }">
        <div class="icon">
          <span
            class="mdi mdi-file-document-arrow-right-outline step-icon"
          ></span>
        </div>
        <div class="text">
          <div class="muted">送出審核申請</div>
          <div class="bold">3. 完成開戶申請</div>
        </div>
      </li>
    </ol>
  </aside>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // 父層傳進來：目前第幾步（1~3）
  activeStep: {
    type: Number,
    default: 1,
  },
});

// 做個保險，限制在 1~3
const cur = computed(() => Math.min(Math.max(props.activeStep, 1), 3));
</script>

<style scoped>
/* 左側步驟 */
.step-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.step {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding-bottom: 28px; /* 下一顆 icon 的間距 */
  --seg-progress: 0; /* 預設 0（未開始） */
}
/* 灰底全長線（到下一顆 icon 頂端） */
.step:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 20px; /* icon 正中 */
  top: 40px; /* 從圓圈底部開始 */
  width: 2px;
  height: calc(100% - 40px);
  background: var(--line);
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

/* 彩色進度線：先畫滿，再用 scaleY 按比例縮放（0~1）*/
.step:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 40px;
  width: 2px;
  height: calc(100% - 40px);
  background: var(--brand);
  transform-origin: top;
  transform: scaleY(var(--seg-progress));
  z-index: 1; /* 疊在灰線上 */
  pointer-events: none;
}

/* 狀態：完成＝全亮、目前＝亮一半 */
.step.completed {
  --seg-progress: 1;
}
.step.active {
  --seg-progress: 0.3;
}

/* 預設（未開始） */
.icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--line);
  border-color: var(--brand);
  background: var(--brand);
  opacity: 0.75;
}
.step-icon {
  font-size: 24px;
  color: var(--line);
  transition: color 0.3s;
}
/* 當前步驟 */
.step.active .icon {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--ink);
  opacity: 1;
}
.step.active .step-icon {
  font-size: 24px;
}

.step.active .text .title,
.step.active .text .bold,
.step.active .text .muted {
  opacity: 1;
}

.text .title,
.text .bold,
.text .muted {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.text .title {
  font-size: 14px;
  margin-bottom: 4px;
}
.text .bold {
  font-weight: 500;
  font-size: 20px;
  color: var(--line);
}
.text .muted {
  color: var(--line);
}
</style>
