<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h3>貸款詳細資訊</h3>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- 貸款概況 -->
        <div class="section">
          <div class="section-header">
            <h4>貸款概況</h4>
            <div class="loan-status-badge" :class="statusClass">
              {{ data.approvalStatusName }}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>貸款代號</label>
              <span class="value">{{ data.loanId }}</span>
            </div>
            <div class="info-item">
              <label>貸款類型</label>
              <span class="value">{{ data.loanTypeName }}</span>
            </div>
            <div class="info-item">
              <label>貸款金額</label>
              <span class="value amount"
                >NT$ {{ Number(data.loanAmount).toLocaleString() }}</span
              >
            </div>
            <div class="info-item">
              <label>貸款期數</label>
              <span class="value"
                >{{ currentPeriod }} / {{ data.loanTerm }} 期</span
              >
            </div>
            <div class="info-item">
              <label>利率</label>
              <span class="value rate"
                >{{ (data.interestRate * 100).toFixed(2) }}%</span
              >
            </div>
            <div class="info-item">
              <label>申請日期</label>
              <span class="value">{{ data.createdAt }}</span>
            </div>
            <div class="info-item">
              <label>開始日期</label>
              <span class="value">{{ data.loanstartDate || "尚未開始" }}</span>
            </div>
            <div class="info-item">
              <label>到期日期</label>
              <span class="value">{{ loanEndDate }}</span>
            </div>
          </div>
        </div>

        <!-- 還款資訊 -->
        <div class="section">
          <div class="section-header">
            <h4>還款資訊</h4>
          </div>

          <div class="repayment-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <label>每月應繳金額</label>
                <span class="value amount primary"
                  >NT$ {{ monthlyPayment.toLocaleString() }}</span
                >
              </div>
              <div class="summary-item">
                <label>總還款金額</label>
                <span class="value amount"
                  >NT$ {{ totalPayment.toLocaleString() }}</span
                >
              </div>
              <div class="summary-item">
                <label>總利息</label>
                <span class="value amount"
                  >NT$ {{ totalInterest.toLocaleString() }}</span
                >
              </div>
            </div>
            <div class="summary-secondary">
              <div class="summary-item">
                <label>下次繳費日期</label>
                <span class="value next-payment">{{ nextPaymentDate }}</span>
              </div>
              <div class="summary-item">
                <label>還款帳戶</label>
                <span class="value">{{ data.repayAccountId }}</span>
              </div>
            </div>
          </div>

          <!-- 還款進度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-title">還款進度</span>
              <span class="progress-percentage"
                >{{ (data.progress || 0).toFixed(1) }}%</span
              >
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: animatedProgress + '%' }"
              ></div>
            </div>

            <div class="progress-details">
              <div class="progress-item">
                <span class="label">已還款</span>
                <span class="amount paid"
                  >NT$ {{ paidAmount.toLocaleString() }}</span
                >
              </div>
              <div class="progress-item">
                <span class="label">剩餘金額</span>
                <span class="amount remaining"
                  >NT$ {{ remainingAmount.toLocaleString() }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from "vue";

const props = defineProps({
  visible: { type: Boolean, required: true },
  data: { type: Object, required: true },
});

const emit = defineEmits(["close"]);
const close = () => emit("close");

// 狀態顏色 map
const statusMap = {
  approved: "status-approved",
  rejected: "status-rejected",
  pending: "status-pending",
  reviewing: "status-reviewing",
};

// 依據狀態更換顏色
const statusClass = computed(() => {
  const status = (props.data?.status || "").trim().toLowerCase();
  return statusMap[status] || "";
});

// 進度條動畫用 - 修復 bug
const animatedProgress = ref(0);
watch(
  () => props.visible,
  async (val) => {
    if (val && props.data?.progress !== undefined) {
      animatedProgress.value = 0;
      await nextTick();
      requestAnimationFrame(() => {
        setTimeout(() => {
          animatedProgress.value = props.data.progress;
        }, 100);
      });
    }
  },
  { immediate: true }
);

const currentPeriod = computed(() => {
  if (!props.data?.loanTerm || !props.data?.progress) return 0;
  const period = Math.floor((props.data.progress / 100) * props.data.loanTerm);
  return period > 0 ? period : 1;
});

const monthlyPayment = computed(() => {
  if (!props.data?.loanAmount || !props.data?.loanTerm) return 0;
  return Math.round(props.data.loanAmount / props.data.loanTerm);
});

const totalInterest = computed(() => {
  if (
    !props.data?.loanAmount ||
    !props.data?.interestRate ||
    !props.data?.loanTerm
  )
    return 0;
  const years = props.data.loanTerm / 12;
  return Math.round(props.data.loanAmount * props.data.interestRate * years);
});

const totalPayment = computed(() => {
  if (!props.data?.loanAmount) return 0;
  return Number(props.data.loanAmount) + totalInterest.value;
});

const paidAmount = computed(() => {
  return Math.round((totalPayment.value * (props.data?.progress || 0)) / 100);
});

const remainingAmount = computed(() => {
  return totalPayment.value - paidAmount.value;
});

const loanEndDate = computed(() => {
  if (!props.data?.loanstartDate || !props.data?.loanTerm) return "";
  const start = new Date(props.data.loanstartDate);
  start.setMonth(start.getMonth() + props.data.loanTerm);
  return start.toISOString().split("T")[0];
});

const nextPaymentDate = computed(() => {
  if (!props.data?.loanstartDate || !props.data?.progress) return "尚未開始";

  const startDate = new Date(props.data.loanstartDate);
  const periodsCompleted = Math.floor(
    (props.data.progress / 100) * props.data.loanTerm
  );
  const nextPeriod = periodsCompleted + 1;

  if (nextPeriod > props.data.loanTerm) return "已完成";

  const nextDate = new Date(startDate);
  nextDate.setMonth(nextDate.getMonth() + nextPeriod);

  return nextDate.toISOString().split("T")[0];
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 38, 38, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(34, 38, 38, 0.15);
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f3f4;
  background: #fafbfc;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  letter-spacing: -0.5px;
}

.close-btn {
  border: none;
  background: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #222626;
}

.modal-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222626;
  position: relative;
  padding-left: 12px;
}

.section-header h4::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: #ebb211;
  border-radius: 2px;
}

.loan-status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

.loan-status-badge.status-approved {
  background: rgba(235, 178, 17, 0.1);
  border-color: rgba(235, 178, 17, 0.3);
  color: #ebb211;
}

.loan-status-badge.status-rejected {
  background: rgba(34, 38, 38, 0.1);
  border-color: rgba(34, 38, 38, 0.3);
  color: #222626;
}

.loan-status-badge.status-pending {
  background: rgba(206, 20, 101, 0.1);
  border-color: rgba(206, 20, 101, 0.3);
  color: #ce1465;
}

.loan-status-badge.status-reviewing {
  background: rgba(107, 114, 128, 0.1);
  border-color: rgba(107, 114, 128, 0.3);
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.2px;
}

.info-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #222626;
  letter-spacing: -0.2px;
}

.info-item .value.amount {
  font-weight: 600;
  font-size: 18px;
}

.info-item .value.rate {
  color: #ce1465;
  font-weight: 600;
}

.repayment-summary {
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f1f3f4;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.summary-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f3f4;
}

.summary-secondary .summary-item.align-center {
  grid-column: 2;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.summary-item .value.amount.primary {
  color: #ebb211;
  font-size: 20px;
  font-weight: 700;
}

.summary-item .value.amount {
  font-size: 18px;
  font-weight: 600;
  color: #222626;
}

.summary-item .value.next-payment {
  color: #ce1465;
  font-weight: 600;
}

.progress-section {
  background: #ffffff;
  border: 1px solid #f1f3f4;
  border-radius: 12px;
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #222626;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #ebb211;
}

.progress-bar {
  height: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ebb211 0%, #fbbf24 100%);
  border-radius: 6px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-item .label {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-item .amount.paid {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
}

.progress-item .amount.remaining {
  font-size: 16px;
  font-weight: 600;
  color: #ce1465;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .modal-body {
    padding: 24px;
    gap: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .summary-secondary {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 16px;
  }

  .summary-secondary .summary-item.align-center {
    grid-column: 1;
  }

  .progress-details {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
