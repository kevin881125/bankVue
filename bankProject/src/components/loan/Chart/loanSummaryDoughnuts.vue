<template>
  <div class="progress-bars-horizontal">
    <div class="progress-summary-wrapper">
      <!-- 標題 -->
      <div class="header-row">
        <h3 class="progress-title">貸款總額及各水門占比</h3>
      </div>

      <!-- 色塊說明 -->
      <div class="legend">
        <span><span class="color-box car"></span> 車貸</span>
        <span><span class="color-box student"></span> 學貸</span>
        <span><span class="color-box house"></span> 房貸</span>
      </div>
    </div>

    <!-- 總貸款進度條（三色堆疊） -->
    <div class="progress-item total">
      <div class="label">總貸款</div>
      <div
        class="progress-bar total-bar"
        :title="`已用: NT$${totalUsed.toLocaleString()} / 門檻: NT$${totalThreshold.toLocaleString()}`"
      >
        <div
          v-for="(loan, i) in loans"
          :key="loan.label"
          class="progress-segment"
          :class="{
            'last-segment': isLastSegment(i) && segmentWidth(loan.amount) > 0,
          }"
          :style="{
            width: segmentWidth(loan.amount) + '%',
            backgroundColor: loanColors[loan.label] || '#ccc',
          }"
        ></div>
      </div>
      <div class="amount-text">
        NT$ {{ totalUsed.toLocaleString() }} /
        {{ totalThreshold.toLocaleString() }}
      </div>
    </div>

    <!-- 各類貸款個別進度條 -->
    <div
      v-for="loan in loans"
      :key="loan.label"
      class="progress-item"
      :title="`${
        loan.label
      } 已用: NT$${loan.amount.toLocaleString()} / 門檻: NT$${loan.threshold.toLocaleString()}`"
    >
      <div class="label">{{ loan.label }}</div>
      <div class="progress-bar">
        <div
          class="progress-segment"
          :class="{
            'single-segment': individualWidth(loan.amount, loan.threshold) > 0,
          }"
          :style="{
            width: individualWidth(loan.amount, loan.threshold) + '%',
            backgroundColor: loanColors[loan.label] || '#ccc',
          }"
        ></div>
        <div
          class="progress-segment remainder"
          :style="{
            width: 100 - individualWidth(loan.amount, loan.threshold) + '%',
          }"
        ></div>
      </div>
      <div class="amount-text">
        NT$ {{ loan.amount.toLocaleString() }} /
        {{ loan.threshold.toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  totalAmount: Number,
  totalThreshold: Number,
  loans: {
    type: Array,
    default: () => [],
  },
});

// 柔和版 CIS 色彩
const loanColors = {
  車貸: "rgba(103, 153, 177, 0.5)", // 琥珀黃（Amber Yellow）
  房貸: "rgba(198, 122, 148, 0.5)", // 鮮玫紅（Muted Rose）
  學貸: "rgba(228, 183, 64, 0.5)", // 柔和藍（Soft Blue）
};

const totalUsed = computed(() =>
  props.loans.reduce((sum, l) => sum + l.amount, 0)
);

const segmentWidth = (amount) => {
  if (!props.totalThreshold || props.totalThreshold === 0) return 0;
  return Math.min((amount / props.totalThreshold) * 100, 100);
};

const individualWidth = (amount, threshold) => {
  if (!threshold || threshold === 0) return 0;
  return Math.min((amount / threshold) * 100, 100);
};

const isLastSegment = (index) => {
  const lastNonZeroIndex = props.loans
    .map((loan, i) => ({ width: segmentWidth(loan.amount), i }))
    .filter((item) => item.width > 0)
    .map((item) => item.i)
    .pop();

  return index === lastNonZeroIndex;
};
</script>

<style scoped>
.progress-bars-horizontal {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  padding: 16px 24px;
  background: rgba(255, 255, 255);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  font-family: "Noto Sans", sans-serif;
  margin-bottom: 24px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  user-select: none;
  max-width: 250px;
  min-width: 140px;
}

.progress-item.total {
  max-width: 280px;
}

.label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  text-align: center;
}

.progress-bar {
  height: 16px;
  border-radius: 16px;
  background-color: #f0f0f0;
  display: flex;
  overflow: hidden;
  position: relative;
}

.total-bar {
  background-color: #f0f0f0;
}

.progress-segment {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 0;
  flex-shrink: 0;
}

.progress-item.total .progress-segment:first-child {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}

.progress-item.total .progress-segment.last-segment {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.progress-item:not(.total) .progress-segment {
  border-radius: 8px;
}

.progress-segment.single-segment {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.progress-segment.remainder {
  background-color: #f0f0f0;
  flex-shrink: 0;
  border-radius: 0;
}

.amount-text {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
}
.progress-summary-wrapper {
  justify-items: left;
  width: 20%;
  padding: 2px 24px;
  margin-bottom: -12px;
  border-radius: 12px;
  font-family: "Noto Sans", sans-serif;
}

.header-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.progress-title {
  font-size: 18px;
  font-weight: 700;
  color: #222626; /* 夜幕灰 */
  margin: 0;
  user-select: none;
}

/* 色塊說明，水平置中排列 */
.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #444;
  user-select: none;
}

.color-box {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  border-radius: 4px;
}

.color-box.car {
  background-color: rgba(228, 183, 64, 0.7); /* 琥珀黃淡 */
}
.color-box.house {
  background-color: rgba(198, 122, 148, 0.7); /* 鮮玫紅淡 */
}
.color-box.student {
  background-color: rgba(103, 153, 177, 0.7); /* 柔和藍 */
}

/* 你的進度條區塊，四個等分保持水平排列 */
.progress-bars-horizontal {
  display: flex;
  gap: 120px;
  justify-content: center;
  flex-wrap: nowrap;
  padding: 16px 48px 16px 0;
}
</style>
