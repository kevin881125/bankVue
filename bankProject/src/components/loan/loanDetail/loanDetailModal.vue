<template>
  <div
    class="modal-overlay"
    v-if="show && data && Object.keys(data).length > 0"
    @click="handleOverlayClick"
  >
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <h3>貸款代號：{{ data.loanId }}</h3>
          <div
            class="loan-status-badge"
            :class="getStatusClass(data.approvalStatusName)"
          >
            {{ data.approvalStatusName || "待審核" }}
          </div>
        </div>
        <button class="close-btn" @click="emit('close')">
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
        <!-- 上半部：個人資料與貸款內容 -->
        <div class="top-section">
          <!-- 左欄：個人基本資料 -->
          <div class="left-column">
            <div class="section">
              <div class="section-header">
                <h4>個人基本資料</h4>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-item">
                    <label>申請人</label>
                    <span class="value">{{ data.mname }}</span>
                  </div>
                  <div class="info-item">
                    <label>身份證字號</label>
                    <span class="value">{{ data.midentity }}</span>
                  </div>
                  <div class="info-item">
                    <label>電話</label>
                    <span class="value">{{ data.mphone }}</span>
                  </div>
                  <div class="info-item">
                    <label>Email</label>
                    <span class="value">{{ data.memail }}</span>
                  </div>
                  <div class="info-item">
                    <label>地址</label>
                    <span class="value">{{ data.maddress }}</span>
                  </div>
                  <div class="info-item">
                    <label>工作單位</label>
                    <span class="value">{{ data.employerName }}</span>
                  </div>
                  <div class="info-item">
                    <label>職業類型</label>
                    <span class="value">{{ data.occupationType }}</span>
                  </div>
                  <div class="info-item">
                    <label>年資</label>
                    <span class="value">{{ data.yearsOfService }} 年</span>
                  </div>
                  <div class="info-item">
                    <label>月收入</label>
                    <span class="value amount"
                      >NT$
                      {{ Number(data.monthlyIncome).toLocaleString() }}</span
                    >
                  </div>
                  <div class="info-item">
                    <label>月負債</label>
                    <span class="value amount"
                      >NT$ {{ Number(data.monthlyDebt).toLocaleString() }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右欄：貸款內容 -->
          <div class="right-column">
            <div class="section">
              <div class="section-header">
                <h4>貸款內容</h4>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-item">
                    <label>貸款類型</label>
                    <span class="value">{{ data.loanTypeName }}</span>
                  </div>
                  <div class="info-item">
                    <label>期數類型</label>
                    <span class="value">{{ data.loanTermName }}</span>
                  </div>
                  <div class="info-item">
                    <label>貸款期數</label>
                    <span class="value">{{ data.loanTerm }} 月</span>
                  </div>
                  <div class="info-item">
                    <label>貸款金額</label>
                    <span class="value amount primary"
                      >NT$ {{ Number(data.loanAmount).toLocaleString() }}</span
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
                    <label>還款帳戶</label>
                    <span class="value">{{ data.repayAccountId }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下半部：財力證明與信用評估 -->
        <div class="bottom-section">
          <!-- 財力證明 -->
          <div class="section" v-if="data.proofDocumentUrl">
            <div class="section-header">
              <div class="header-title">
                <h4>財力證明</h4>
              </div>
              <button
                class="download-btn"
                @click="downloadFile"
                title="下載財力證明"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 10.5L5.5 8L6.5 7L7.5 8V3H8.5V8L9.5 7L10.5 8L8 10.5Z"
                    fill="currentColor"
                  />
                  <path d="M3 11H13V12H3V11Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <div class="section-content">
              <div class="document-preview">
                <iframe
                  v-if="isPdf"
                  :src="previewUrl"
                  width="100%"
                  height="180px"
                  frameborder="0"
                  class="pdf-preview"
                ></iframe>
                <img
                  v-else
                  :src="previewUrl"
                  alt="財力證明預覽"
                  class="image-preview"
                />
              </div>
            </div>
          </div>

          <!-- 信用評估 -->
          <div class="section">
            <div class="section-header">
              <div class="header-title">
                <h4>信用評估</h4>
              </div>
              <div class="risk-summary" :class="riskLevel.class">
                <span class="risk-indicator">{{ riskLevel.message }}</span>
              </div>
            </div>
            <div class="section-content">
              <!-- 圖表區域 -->
              <div class="charts">
                <div class="chart-item">
                  <h5>信用分數</h5>
                  <PieChart :score="data.baseCreditScore" label="信用分數" />
                </div>

                <div class="chart-item">
                  <h5>DTI 比率</h5>
                  <DtiChart :dtiRatio="data.dtiRatio" />
                </div>

                <div class="chart-item">
                  <h5>DBR 倍數</h5>
                  <DbrChart :dbrValue="dbrValue" />
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
import PieChart from "@/components/loan/chart/pieChart.vue";
import DtiChart from "@/components/loan/chart/dtiChart.vue";
import DbrChart from "@/components/loan/chart/dbrChart.vue";
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  show: Boolean,
  data: Object,
});

const emit = defineEmits(["close"]);

const handleOverlayClick = (event) => {
  if (event.target.classList.contains("modal-overlay")) {
    emit("close");
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "審核通過":
      return "status-approved";
    case "拒絕":
      return "status-rejected";
    case "補件中":
      return "status-pending-docs";
    case "待審核":
    default:
      return "status-reviewing";
  }
};

// 文件處理
const fileName = computed(() => {
  if (!props.data?.proofDocumentUrl) return "";
  return props.data.proofDocumentUrl.split("/").pop();
});

const previewUrl = computed(() => {
  if (!fileName.value) return "";
  return `http://localhost:8080/bank/uploadImg/loanImg/${fileName.value}`;
});

const fileUrl = computed(() => {
  if (!props.data?.proofDocumentUrl) return "";
  return `http://localhost:8080/bank/download/loanImg/${fileName.value}`;
});

const isPdf = computed(() => {
  return props.data?.proofDocumentUrl?.toLowerCase().endsWith(".pdf");
});

const downloadFile = () => {
  const link = document.createElement("a");
  link.href = fileUrl.value;
  link.download = fileName.value || "proof-file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// DBR 計算
const dbrValue = computed(() => {
  if (!props.data?.loanAmount || !props.data?.monthlyIncome) return 0;
  return props.data.loanAmount / props.data.monthlyIncome;
});

// 風險評估
const riskLevel = computed(() => {
  const score = props.data?.baseCreditScore || 0;
  const dti = props.data?.dtiRatio || 0;
  const dbr = dbrValue.value;

  if (dbr > 22 || dti > 0.4 || score < 650) {
    return { class: "risk-high", message: "❌ 高風險，建議拒絕" };
  }
  if (dbr > 15 || dti > 0.3 || score < 750) {
    return { class: "risk-medium", message: "⚠️ 中度風險，需人工確認" };
  }
  return { class: "risk-low", message: "✅ 低風險，可通過" };
});

const getDtiClass = (dti) => {
  if (dti > 0.4) return "ratio-high";
  if (dti > 0.3) return "ratio-medium";
  return "ratio-good";
};

const getDbrClass = (dbr) => {
  if (dbr > 22) return "ratio-high";
  if (dbr > 15) return "ratio-medium";
  return "ratio-good";
};
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
  max-width: 1200px;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  letter-spacing: -0.5px;
}

.loan-status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: white;
}

.status-approved {
  background-color: #ebb211;
}

.status-rejected {
  background-color: #222626;
}

.status-pending-docs {
  background-color: #ce1465;
}

.status-reviewing {
  background-color: #6b7280;
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
  padding: 16px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

.top-section {
  display: flex;
  gap: 32px;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  gap: 32px;
}

.left-column,
.right-column {
  flex: 1;
}

.section {
  width: 554.5px;
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  height: fit-content;
}

.section-header {
  background: transparent;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
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
  height: 16px;
  background: #ebb211;
  border-radius: 2px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: #ebb211;
  border-color: #ebb211;
  color: white;
}

.section-content {
  padding: 0;
}

.risk-summary {
  background: #f8f9fa;
  border-radius: 8px;
  /* padding: 8px 12px; */
  display: inline-block;
}

.charts {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 20px;
  margin-top: 0;
  flex-wrap: wrap;
}

.chart-item {
  flex: 1;
  min-width: 120px;
  max-width: 150px;
  text-align: center;
}

.chart-item h5 {
  margin: 14px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #222626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.2px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #222626;
  letter-spacing: -0.2px;
  line-height: 1.4;
}

.info-item .value.amount {
  font-weight: 600;
  color: #222626;
}

.info-item .value.amount.primary {
  color: #ebb211;
  font-size: 16px;
  font-weight: 700;
}

.info-item .value.rate {
  color: #ce1465;
  font-weight: 600;
}

.risk-summary {
  background: #f8f9fa;
  padding: 2px 16px;
}

.risk-summary.risk-low {
  background: rgba(5, 150, 105, 0.05);
}

.risk-summary.risk-medium {
  background: rgba(245, 158, 11, 0.05);
}

.risk-summary.risk-high {
  background: rgba(239, 68, 68, 0.05);
}

.risk-indicator {
  font-size: 14px;
  font-weight: 600;
  color: #222626;
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.assessment-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  border-radius: 8px;
  border: 1px solid #f1f3f4;
}

.assessment-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: #ebb211;
}

.score-max {
  font-size: 14px;
  color: #9ca3af;
}

.ratio-display {
  display: flex;
  justify-content: center;
}

.ratio-value {
  font-size: 20px;
  font-weight: 700;
}

.ratio-value.ratio-good {
  color: #059669;
}

.ratio-value.ratio-medium {
  color: #f59e0b;
}

.ratio-value.ratio-high {
  color: #ef4444;
}

.document-preview {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.pdf-preview,
.image-preview {
  width: 100%;
  border-radius: 8px;
}

.image-preview {
  max-height: 270px;
  object-fit: contain;
  display: block;
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

@media (max-width: 1024px) {
  .top-section,
  .bottom-section {
    flex-direction: column;
    gap: 24px;
  }

  .assessment-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-width: 100%;
  }

  .modal-header {
    padding: 20px 24px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .modal-body {
    padding: 24px;
    gap: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .assessment-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .section-content {
    padding: 20px;
  }
}
</style>
