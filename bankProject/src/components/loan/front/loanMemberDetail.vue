<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h3>貸款詳細資訊</h3>
        <button class="close-btn" @click="close">✖</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- 上方區塊：貸款概況 -->
        <div class="section-header">
          <h4>貸款概況</h4>
          <div class="loan-status-box" :class="statusClass">
            {{ data.approvalStatusName }}
          </div>
        </div>
        <div class="section-block">
          <div class="section-content">
            <!-- 左欄 -->
            <div class="col">
              <p><strong>貸款代號：</strong>{{ data.loanId }}</p>
              <p><strong>貸款類型：</strong>{{ data.loanTypeName }}</p>
              <p>
                <strong>貸款金額：</strong>NT$
                {{ Number(data.loanAmount).toLocaleString() }}
              </p>
              <p>
                <strong>貸款期數：</strong>{{ currentPeriod }} /
                {{ data.loanTerm }} 期
              </p>
            </div>
            <!-- 右欄 -->
            <div class="col">
              <p>
                <strong>利率：</strong
                >{{ (data.interestRate * 100).toFixed(2) }}%
              </p>
              <p><strong>申請日期：</strong>{{ data.createdAt }}</p>
              <p>
                <strong>開始日期：</strong
                >{{ data.loanstartDate || "尚未開始" }}
              </p>
              <p><strong>到期日期：</strong>{{ loanEndDate }}</p>
            </div>
          </div>
        </div>

        <!-- 下方區塊：還款資訊 -->
        <div class="section-header">
          <h4>還款資訊</h4>
        </div>
        <div class="section-block">
          <div class="section-content">
            <!-- 左欄 -->
            <div class="col">
              <p>
                <strong>每月應繳金額：</strong>NT$
                {{ monthlyPayment.toLocaleString() }}
              </p>
              <p>
                <strong>總利息：</strong>NT$
                {{ totalInterest.toLocaleString() }}
              </p>
              <p><strong>還款帳戶：</strong>{{ data.repayAccountId }}</p>
            </div>
            <!-- 右欄 -->
            <div class="col">
              <p>
                <strong>總還款金額：</strong>NT$
                {{ totalPayment.toLocaleString() }}
              </p>

              <!-- 還款進度條 -->
              <div class="progress-item">
                <div class="progress-label">
                  <strong>還款進度：</strong
                  >{{ (data.progress || 0).toFixed(2) }}%
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: animatedProgress + '%' }"
                    ></div>
                  </div>
                  <div class="progress-text">
                    <strong>已還：NT$ {{ paidAmount.toLocaleString() }}</strong>
                    <strong
                      >剩餘：NT$ {{ remainingAmount.toLocaleString() }}</strong
                    >
                  </div>
                </div>
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

// ✅ 進度條動畫用
const animatedProgress = ref(0);
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      animatedProgress.value = 0; // 先歸零
      await nextTick();
      setTimeout(() => {
        animatedProgress.value = props.data?.progress || 0;
      }, 50); // 小延遲讓 CSS transition 生效
    }
  }
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background: #fff;
  border-radius: 12px;
  width: 80%;
  max-width: 900px;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
  font-size: 30px;
  font-weight: bold;
  letter-spacing: 1px;
  line-height: 32px;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 30px;
}

.section-header h4 {
  margin: 0;
  color: #1a1a1a;
  border-bottom: 2px solid #ebb211;
  padding-bottom: 4px;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: 1px;
}

.loan-status-box {
  border: 0.5px solid #949494;
  color: #949494;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: bold;
}

.loan-status-box.status-approved {
  border-color: #ebb211;
  color: #ebb211;
}
.loan-status-box.status-rejected {
  border-color: #222626;
  color: #222626;
}
.loan-status-box.status-pending {
  border-color: #ce1465;
  color: #ce1465;
}
.loan-status-box.status-reviewing {
  border-color: #444b4b;
  color: #444b4b;
}

.section-block {
  background: #f8f8f8;
  border-radius: 10px;
  padding: 18px 30px;
  margin-top: -12px;
}

.section-content {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.col {
  flex: 1;
  min-width: 240px;
}
.col strong {
  font-weight: 600;
  color: #333;
}
.col p {
  margin: 8px 0;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: gray;
}

.progress-item {
  margin: 8px 0;
}
.progress-label {
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  font-weight: 400;
  color: gray;
}
.progress-label strong {
  font-weight: 600;
  color: #333;
}

.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.progress-bar {
  height: 16px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #6dee6da4;
  border-radius: 8px;
  transition: width 1s ease; /* ✅ 平滑動畫 */
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: 0.5px;
  color: gray;
}
.progress-text strong {
  font-weight: 400;
  color: #818181;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .section-content {
    flex-direction: column;
  }
  .col {
    min-width: auto;
  }
  .progress-text {
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }
}
</style>
