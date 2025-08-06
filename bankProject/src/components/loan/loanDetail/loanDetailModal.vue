<template>
  <div
    class="modal"
    v-if="show && data && Object.keys(data).length > 0"
    @click="handleOverlayClick"
  >
    <div class="loan-card" @click.stop>
      <!-- 審核狀態與關閉按鈕 -->
      <div class="loan-header">
        <div class="loan-header-left">
          <span
            class="loan-status"
            :class="getStatusClass(data.approvalStatusName)"
          >
            {{ data.approvalStatusName || "待審核" }}
          </span>
          <h3>貸款代號：{{ data.loanId }}</h3>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <!-- 左右區塊 -->
      <div class="split-layout">
        <!-- 左欄：個人資料 + 財力證明 -->
        <div class="left-cols">
          <div class="info-group">
            <h4>個人基本資料</h4>
            <hr />
            <div class="personal-two-cols">
              <div class="personal-left">
                <p><strong>申請人：</strong>{{ data.mname }}</p>
                <p><strong>身份證字號：</strong>{{ data.midentity }}</p>
                <p><strong>電話：</strong>{{ data.mphone }}</p>
                <p><strong>Email：</strong>{{ data.memail }}</p>
                <p><strong>地址：</strong>{{ data.maddress }}</p>
              </div>
              <div class="personal-right">
                <p><strong>工作單位：</strong>{{ data.employerName }}</p>
                <p><strong>職業類型：</strong>{{ data.occupationType }}</p>
                <p><strong>年資：</strong>{{ data.yearsOfService }} 年</p>
                <p>
                  <strong>月收入：</strong>NT$
                  {{ Number(data.monthlyIncome).toLocaleString() }}
                </p>
                <p>
                  <strong>月負債：</strong>NT$
                  {{ Number(data.monthlyDebt).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <!-- 財力證明預覽 -->
          <div class="info-group" v-if="data.proofDocumentUrl">
            <div class="title-with-icon">
              <h4>財力證明</h4>
              <button
                class="icon-button"
                @click="downloadFile"
                aria-label="下載財力證明"
                title="下載財力證明"
              >
                <v-icon size="20">mdi-download</v-icon>
              </button>
            </div>

            <iframe
              v-if="isPdf"
              :src="previewUrl"
              width="100%"
              height="300px"
              frameborder="0"
            ></iframe>
            <img
              v-else
              :src="previewUrl"
              alt="預覽圖片"
              style="max-width: 100%; max-height: 400px; object-fit: contain"
            />
          </div>
        </div>

        <!-- 右欄：貸款內容 + 信用評估 -->
        <div class="right-col">
          <div class="info-group">
            <h4>貸款內容</h4>
            <hr />
            <p><strong>貸款類型：</strong>{{ data.loanTypeName }}</p>
            <p><strong>期數：</strong>{{ data.loanTermName }}</p>
            <p><strong>貸款期數：</strong>{{ data.loanTerm }} 月</p>
            <p>
              <strong>貸款金額：</strong>NT$
              {{ Number(data.loanAmount).toLocaleString() }}
            </p>
            <p>
              <strong>利率：</strong>{{ (data.interestRate * 100).toFixed(2) }}%
            </p>
            <p><strong>開始日期：</strong>{{ data.loanstartDate }}</p>
            <p><strong>還款帳戶：</strong>{{ data.repayAccountId }}</p>
          </div>

          <div class="info-group">
            <h4>信用分數評估</h4>
            <hr />
            <p>
              <strong>審核人員 ID：</strong
              >{{ data.reviewerId || "（尚未審核）" }}
            </p>
            <p>
              <strong>審核時間：</strong>{{ data.reviewTime || "（尚未審核）" }}
            </p>
            <p>
              <strong>審核信用評分：</strong
              >{{ data.reviewedCreditScore ?? "（尚未評分）" }}
            </p>
            <p>
              <strong>審核狀態：</strong>{{ translateStatus(data.decision) }}
            </p>
            <p><strong>備註：</strong>{{ data.notes }}</p>
            <hr />
            <div class="side-by-side">
              <div class="vertical-group">
                <p>
                  <strong>DTI 比率：</strong
                  >{{ (data.dtiRatio * 100).toFixed(2) }}%
                </p>
                <DtiChart :dtiRatio="data.dtiRatio" />
              </div>
              <div class="vertical-group">
                <p><strong>原始信用評分：</strong>{{ data.baseCreditScore }}</p>
                <PieChart :score="data.baseCreditScore" label="信用評分" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PieChart from "@/components/loan/Chart/pieChart.vue";
import DtiChart from "@/components/loan/Chart/dtiChart.vue";
import { translateStatus } from "@/components/loan/utils/statusHelper";
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  show: Boolean,
  data: Object,
});

const emit = defineEmits(["close"]);

const handleOverlayClick = (event) => {
  if (event.target.classList.contains("modal")) {
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

const previewUrl = computed(() => {
  if (!props.data?.proofDocumentUrl) return "";
  return `http://localhost:8080/bank${props.data.proofDocumentUrl}`;
});

const fileName = computed(() => {
  if (!props.data?.proofDocumentUrl) return "";
  return props.data.proofDocumentUrl.split("/").pop();
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

  // 指定下載檔名
  link.download = fileName.value || "proof-file";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

.loan-card {
  width: 75vw;
  max-width: 95%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: "Noto Sans TC", sans-serif;
  line-height: 2;
  padding: 24px 32px;
  box-sizing: border-box;
}

.loan-status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 12px;
  display: inline-block;
  color: white;
  margin-top: 10px;
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
  background-color: #444b4b;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.loan-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.loan-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 30px;
}

.loan-card p {
  margin: 10px;
  line-height: 1.2;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #000;
}

.split-layout {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.left-cols {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-group {
  padding: 0px 20px;
  font-size: 15px;
  color: #333;
  word-break: break-word;
}
.info-group h4 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #444;
}

.side-by-side {
  display: flex;
  gap: 48px;
  align-items: center;
  flex-wrap: wrap;
}

.personal-two-cols {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.personal-left,
.personal-right {
  flex: 1;
  min-width: 220px;
}

.vertical-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-with-icon h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #444;
}

.icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  color: #7f7f7f;
  border-radius: 6px;
  margin-top: 6px;
}

.icon-button:hover {
  color: #d6a70f;
}
</style>
