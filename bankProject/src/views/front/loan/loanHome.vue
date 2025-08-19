<template>
  <div class="loan-container">
    <!-- 個人貸款資訊 -->
    <section class="loan-status-carousel">
      <div class="loan-status-wrapper">
        <!-- 左箭頭 -->
        <v-btn
          icon
          variant="text"
          class="arrow-btn left"
          @click="prevLoan"
          :disabled="loans.length === 0"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <!-- 卡片 -->
        <div v-if="loans.length > 0" class="loan-status-card">
          <div class="status-header">
            <h2>
              申貸帳戶:{{ currentLoan.loanId }} - {{ currentLoan.typeName }}
              <button class="look" @click="onOpenDetail">
                <span class="mdi mdi-eye"></span>
              </button>
            </h2>
            <div class="review-status" :class="statusClass(currentLoan.status)">
              <!-- 按鈕在右側 -->
              <div class="loan-action-buttons">
                <button
                  v-if="currentLoan.status === 'supplement'"
                  class="action-btn upload-btn"
                  @click="onUploadSupplement"
                >
                  <v-icon size="20">mdi-upload</v-icon>
                </button>

                <button
                  v-else-if="currentLoan.status === 'approved'"
                  class="action-btn download-btn"
                  @click="onDownloadContract"
                >
                  <v-icon size="20">mdi-download</v-icon>
                </button>
              </div>
              <span class="status-text">{{
                translateStatus(currentLoan.status)
              }}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="status-content">
            <div class="chart-box">
              <canvas ref="activeChart"></canvas>
              <div class="chart-legend">
                <span class="legend-item">
                  <span
                    class="color-box"
                    style="background-color: #e0e0e0"
                  ></span
                  >剩餘
                </span>
                <span class="legend-item">
                  <span
                    class="color-box"
                    style="background-color: #ebb211"
                  ></span
                  >已還款
                </span>
              </div>
            </div>

            <pay-modal
              v-model="showPayModal"
              :loan-id="selectedLoanId"
              @success="fetchMemberPayments"
            />

            <div class="info-box">
              <div class="row">
                <div class="label">貸款金額 :</div>
                <div class="value">
                  NT$ {{ currentLoan.amount.toLocaleString() }}
                </div>
              </div>

              <div class="row">
                <div class="label">貸款利率 :</div>
                <div class="value">{{ formatRate(currentLoan.rate) }}</div>
                <div class="label">還款期數 :</div>
                <div class="value">
                  第 {{ currentPeriod }} / {{ currentLoan.months }} 期
                </div>
              </div>
              <hr />
              <div class="progress-info">
                <strong>還款進度 : </strong>
                NT$ {{ currentLoan.paid.toLocaleString() }}
                <span
                  >/ NT$ {{ currentLoan.amount.toLocaleString() }} (已還
                  {{ currentLoan.progress }}%)</span
                >
                <button
                  class="pay"
                  color="primary"
                  size="small"
                  @click="openPayModal(currentLoan.loanId)"
                >
                  立即繳費
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="loan-status-card empty">
          <p>目前沒有貸款資料</p>
        </div>

        <!-- 右箭頭 -->
        <v-btn
          icon
          variant="text"
          class="arrow-btn right"
          @click="nextLoan"
          :disabled="loans.length === 0"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </section>

    <!-- 單筆貸款詳細資訊 -->
    <loanMemberDetail
      v-if="selectedLoan"
      :visible="showModal"
      :data="selectedLoan"
      @close="showModal = false"
    />

    <!-- 第二區：繳納明細 -->
    <section class="loan-records">
      <div class="records-header">
        <h2>還款紀錄</h2>
      </div>

      <div class="table">
        <table>
          <thead>
            <tr>
              <th>貸款帳戶</th>
              <th>日期</th>
              <th>扣款金額</th>
              <th>扣款方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="index">
              <td>{{ record.loanAccount }}</td>
              <td>{{ record.date }}</td>
              <td>NT$ {{ record.amount.toLocaleString() }}</td>
              <td>{{ record.paymentMethod }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 第三區：貸款試算 -->
    <section class="loan-calculator">
      <div class="calc-left">
        <label
          >貸款金額
          <input
            type="number"
            placeholder="請輸入金額（NT$）"
            v-model.number="form.loanAmount"
          />
        </label>

        <label
          >貸款類型
          <select v-model="form.loanTypeId">
            <option value="">選擇貸款類型</option>
            <option value="LT001">車貸</option>
            <option value="LT002">房貸</option>
            <option value="LT003">學生貸款</option>
          </select>
        </label>

        <label
          >貸款期數（月）
          <select v-model.number="form.loanMonths">
            <option value="">選擇月份</option>
            <option v-for="m in monthOptions" :key="m" :value="m">
              {{ m }} 個月
            </option>
          </select>
        </label>

        <p>* 實際利率請以最終審核合約為準</p>
      </div>

      <div class="calc-right">
        <img src="../../../image/background.png" alt="背景圖" />
        <div class="calc-result">
          <h3>利率試算</h3>
          <p>
            每月只需還
            <span class="cash"
              >NT$<span class="highlight">
                {{
                  calcResult.monthlyPayment != null
                    ? Math.round(calcResult.monthlyPayment).toLocaleString()
                    : 0
                }}
              </span>
              元</span
            >
          </p>
          <small>最低年利率：{{ formatRate(interestRateDisplay) }}</small
          ><br />
          <button @click="applyLoan">立即申請</button>
        </div>
      </div>
    </section>

    <!-- 第四區：貸款申請流程 -->
    <section class="loan-section">
      <h1 class="title">貸款申請，隨借隨用</h1>
      <div class="steps">
        <div class="step">
          <v-icon size="40">mdi-book-check</v-icon>
          <h3>填寫資料</h3>
          <p>線上填寫申請資料</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-card-account-details</v-icon>
          <h3>進行驗證</h3>
          <p>準備身分證進行驗證</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-file-search</v-icon>
          <h3>案件審核</h3>
          <p style="text-align: center">送出申請後<br />隨時可追蹤案件狀態</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-cash-multiple</v-icon>
          <h3>取得額度</h3>
          <p>最快 20 分鐘完成審核</p>
        </div>
      </div>
      <router-link
        to="/yuzubank/loanHome/loanApplicationForm"
        class="apply-button"
        >立即申請</router-link
      >
    </section>

    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import Chart from "chart.js/auto";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import { translateStatus } from "@/components/loan/utils/statusHelper";
import loanMemberDetail from "@/components/loan/front/loanMemberDetail.vue";
import payModal from "@/components/loan/front/payModal.vue";

const memberStore = useMemberStore();
const memberId = memberStore.mId;
const showPayModal = ref(false);
const selectedLoanId = ref(null);

const openPayModal = (loanId) => {
  selectedLoanId.value = loanId;
  showPayModal.value = true;
};

const loans = ref([]);
const currentIndex = ref(0);
const activeChart = ref(null);
let chartInstance = null;

const currentLoan = computed(() => loans.value[currentIndex.value] || {});

// 取得會員貸款資料
const fetchMemberLoans = async () => {
  if (!memberStore.isLoggedIn) return;

  try {
    const res = await request({
      url: `/loans/member/${memberId}`,
      method: "get",
    });

    // 判斷回傳資料格式
    let data = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray(res.data)) {
      data = res.data;
    } else if (res && typeof res === "object") {
      // 單筆物件
      data = [res];
    }
    loans.value = data.map((loan) => ({
      loanId: loan.loanId,
      account: loan.repayAccountId || "",
      typeName: loan.loanTypeName || "",
      amount: loan.loanAmount || 0,
      paid: loan.paidAmount || 0,
      progress: loan.progress || 0,
      rate: loan.interestRate || 0,
      months: loan.loanTerm || 0,
      createdAt: loan.createdAt || "",
      loanstartDate: loan.updatedAt || "",
      status: loan.approvalStatus || "未知",
    }));

    currentIndex.value = 0;
    await nextTick();
    renderChart();
  } catch (err) {
    console.error("取得會員貸款資料失敗:", err);
    loans.value = [];
  }
};

// 單筆貸款詳細資訊
const showModal = ref(false);
const selectedLoan = ref(null);

const onOpenDetail = () => {
  if (!currentLoan.value) return;

  selectedLoan.value = {
    loanId: currentLoan.value.loanId || "",
    loanTypeName: currentLoan.value.typeName || "",
    loanAmount: currentLoan.value.amount || 0,
    loanTerm: currentLoan.value.term || 0,
    interestRate: currentLoan.value.rate || 0,
    loanTerm: currentLoan.value.months || "",
    createdAt: currentLoan.value.createdAt || "",
    loanstartDate: currentLoan.value.loanstartDate || "",
    repayAccountId: currentLoan.value.account || "",
    ㄋtatus: currentLoan.value.status,
    approvalStatusName: translateStatus(currentLoan.value.status),
    progress: currentLoan.value.progress || 0,
  };

  showModal.value = true;
};

// 狀態顏色變換
const statusClass = (status) => {
  switch (status) {
    case "approved":
      return "status-approved";
    case "rejected":
      return "status-rejected";
    case "pending":
      return "status-pending";
    case "reviewing":
      return "status-reviewing";
    default:
      return "";
  }
};

// 上傳補件檔案
const onUploadSupplement = async () => {
  const loanId = currentLoan.value.loanId;
  if (!loanId) {
    alert("找不到貸款資料");
    return;
  }

  // 建立 input 元素讓使用者選檔
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.jpg,.png"; // 限制檔案類型，可依需求調整
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await request({
        url: `/loans/${loanId}/upload-proof`,
        method: "post",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("補件上傳成功");
      // 可重新抓一次貸款資料更新前端
      await fetchMemberLoans();
    } catch (err) {
      console.error("上傳失敗:", err);
      alert("補件上傳失敗，請稍後再試");
    }
  };

  fileInput.click();
};

// 下載合約
const onDownloadContract = async () => {
  const contractPath = currentLoan.value.contractPath;
  if (!contractPath) {
    alert("尚無合約檔案");
    return;
  }

  const filename = contractPath.split("/").pop();

  try {
    const response = await request({
      url: `/download/contract/${filename}`,
      method: "get",
      responseType: "blob",
    });

    // 建立 blob URL
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // 釋放 URL
  } catch (err) {
    console.error("下載失敗:", err);
    alert("下載失敗，請稍後再試");
  }
};

// 還款期數 動態計算目前是第幾期
const currentPeriod = computed(() => {
  if (!currentLoan.value || !currentLoan.value.months) return 0;

  const period = Math.floor(
    (currentLoan.value.progress / 100) * currentLoan.value.months
  );

  // 避免顯示成第 0 期，至少要從 1 開始
  return period > 0 ? period : 1;
});

// Carousel 左右切換
const prevLoan = async () => {
  if (currentIndex.value === 0) currentIndex.value = loans.value.length - 1;
  else currentIndex.value--;
  await nextTick();
  renderChart();
};

const nextLoan = async () => {
  if (currentIndex.value === loans.value.length - 1) currentIndex.value = 0;
  else currentIndex.value++;
  await nextTick();
  renderChart();
};

// 更新 donut 圖表
const renderChart = () => {
  if (!currentLoan.value || !activeChart.value) return;
  if (chartInstance) chartInstance.destroy();

  // 確保 progress 是 0~100 之間
  const progress = Math.min(Math.max(currentLoan.value.progress || 0, 0), 100);

  chartInstance = new Chart(activeChart.value, {
    type: "doughnut",
    data: {
      labels: ["已還款", "剩餘"],
      datasets: [
        {
          data: [progress, 100 - progress], // progress 直接當百分比用
          backgroundColor: ["#EBB211", "#E0E0E0"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });
};

// Chart 隨 currentIndex 變動更新
watch(currentIndex, renderChart);

const formatRate = (rate) =>
  rate != null ? Number(rate * 100).toFixed(1) + "%" : "載入中...";

onMounted(fetchMemberLoans);

const records = ref([]);

const fetchMemberPayments = async () => {
  if (!memberStore.isLoggedIn) return;

  try {
    const res = await request({
      url: `/loans/member/${memberId}/payments`,
      method: "get",
    });

    // 判斷回傳資料格式
    let data = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray(res.data)) {
      data = res.data;
    } else if (res && typeof res === "object") {
      data = [res];
    }

    // 轉換成前端顯示格式
    records.value = data.map((item) => ({
      loanAccount: item.loanId || "",
      date: item.paymentDate
        ? new Date(item.paymentDate).toLocaleDateString()
        : "",
      amount: item.amountPaid ? Number(item.amountPaid) : 0,
      paymentMethod: item.paymentMethod || "",
    }));
  } catch (err) {
    console.error("取得還款紀錄失敗:", err);
    records.value = [];
  }
};

onMounted(() => {
  fetchMemberLoans();
  fetchLoanCalculation();
  fetchMemberPayments(); // 新增這行
});

const form = ref({
  loanAmount: 100000,
  loanTypeId: "LT001",
  loanMonths: 16,
});

const monthOptions = [6, 10, 12, 16, 24, 36, 40, 48, 56, 60];

const interestRateDisplay = ref(null); // 初始為 null
const calcResult = ref({
  monthlyPayment: 0,
  totalInterest: 0,
  totalPayment: 0,
});

// 格式化函數
const formatMoney = (amount) =>
  amount != null ? Math.round(amount).toLocaleString() : "0";

// 將月份對應到 Term ID
const monthToTermId = (months) => {
  if (months >= 6 && months <= 12) return "TERM001"; // short: 6-12個月
  if (months >= 13 && months <= 36) return "TERM002"; // mid: 13-36個月
  if (months >= 37 && months <= 60) return "TERM003"; // long: 37-60個月
  return null;
};

const fetchLoanCalculation = async () => {
  // 檢查必要參數
  if (!form.value.loanTypeId || !form.value.loanMonths) {
    console.log("缺少必要參數，跳過計算");
    interestRateDisplay.value = null;
    calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
    return;
  }

  const termId = monthToTermId(form.value.loanMonths);

  console.log("開始計算，參數:", {
    loanTypeId: form.value.loanTypeId,
    loanTermId: termId,
    loanMonths: form.value.loanMonths,
    amount: form.value.loanAmount,
  });

  // 取得利率
  try {
    const rateResponse = await request({
      url: "/loans/calc/rate",
      method: "get",
      params: {
        loanTypeId: form.value.loanTypeId,
        loanTermId: termId,
      },
    });

    console.log("利率 API 原始回應:", rateResponse);

    // 處理不同的回應格式
    let rateValue = null;

    // 如果有 error 屬性，表示是錯誤回應
    if (rateResponse && rateResponse.error) {
      console.error("利率 API 錯誤:", rateResponse.error);
      interestRateDisplay.value = null;
    } else {
      // 嘗試不同的回應格式
      if (typeof rateResponse === "number") {
        rateValue = rateResponse;
      } else if (rateResponse && typeof rateResponse.data === "number") {
        rateValue = rateResponse.data;
      } else if (rateResponse && !isNaN(parseFloat(rateResponse))) {
        rateValue = parseFloat(rateResponse);
      } else if (
        rateResponse &&
        rateResponse.data &&
        !isNaN(parseFloat(rateResponse.data))
      ) {
        rateValue = parseFloat(rateResponse.data);
      }

      if (rateValue != null && rateValue > 0) {
        // 後端回傳的是小數形式，轉換為百分比
        interestRateDisplay.value = Number(rateValue);
        console.log("設定利率顯示:", interestRateDisplay.value + "%");
      } else {
        console.log("無法解析利率值:", rateResponse);
        interestRateDisplay.value = null;
      }
    }
  } catch (err) {
    console.error("取得利率時發生錯誤:", err);
    if (err.response) {
      console.error("錯誤回應:", err.response.data);
    }
    interestRateDisplay.value = null;
  }

  // 計算月付款
  if (form.value.loanAmount && form.value.loanAmount > 0) {
    try {
      const paymentResponse = await request({
        url: "/loans/calc/monthly-payment",
        method: "post",
        data: {
          loanTypeId: form.value.loanTypeId,
          loanTermId: termId,
          loanMonths: form.value.loanMonths,
          amount: form.value.loanAmount,
        },
      });

      console.log("月付款 API 原始回應:", paymentResponse);

      // 處理回應
      if (paymentResponse && paymentResponse.error) {
        console.error("月付款 API 錯誤:", paymentResponse.error);
        calcResult.value = {
          monthlyPayment: 0,
          totalInterest: 0,
          totalPayment: 0,
        };
      } else if (paymentResponse) {
        // 直接使用回應資料
        const result = paymentResponse.data || paymentResponse;
        calcResult.value = {
          monthlyPayment: result.monthlyPayment || 0,
          totalInterest: result.totalInterest || 0,
          totalPayment: result.totalPayment || 0,
        };
        console.log("設定計算結果:", calcResult.value);
      } else {
        console.log("月付款回應為空");
        calcResult.value = {
          monthlyPayment: 0,
          totalInterest: 0,
          totalPayment: 0,
        };
      }
    } catch (err) {
      console.error("計算月付款時發生錯誤:", err);
      if (err.response) {
        console.error("錯誤回應:", err.response.data);
      }
      calcResult.value = {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0,
      };
    }
  } else {
    console.log("貸款金額無效，跳過月付款計算");
    calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }
};

const applyLoan = () => {
  console.log("立即申請，帶入表單資料:", form.value);
};

onMounted(fetchLoanCalculation);
watch(
  [
    () => form.value.loanAmount,
    () => form.value.loanTypeId,
    () => form.value.loanMonths,
  ],
  fetchLoanCalculation
);
</script>

<style scoped>
.loan-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px;
}

.loan-container h1 {
  font-size: 24px;
  padding-bottom: 20px;
}

/* 第一區：貸款繳納進度 - 卡片輪播 */
.loan-status-carousel {
  margin: 40px 0;
}

.loan-status-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}

.loan-status-wrapper {
  display: flex;
  justify-content: center;
  position: relative; /* 讓箭頭可以絕對定位 */
}

.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #555;
  transition: 0.2s;
}

.arrow-btn:hover {
  color: #ebb211 !important;
}

/* 左右箭頭位置 */
.arrow-btn.left {
  left: -48px; /* 可依需求調整，超出 container */
}

.arrow-btn.right {
  right: -48px;
}

.loan-status-card {
  background: #f5f5f5;
  border-radius: 30px;
  padding: 30px 40px 60px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 1280px; /* ✅ 固定寬度 */
}

.review-status {
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: flex-start;
  border: 1px solid;
  border-radius: 10px;
  padding: 4px 12px 4px 8px;
  font-size: 16px;
  font-weight: 400;
  margin-left: auto;
  border: 1px solid #0acf3f;
  color: #0acf3f;
}

.loan-status-card h2 {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.loan-status-card .status-content {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: center; /* h2 置中 */
  position: relative; /* 讓按鈕可以絕對定位 */
}

.status-header h2 {
  margin: 0;
  text-align: center;
  flex: 1; /* 撐開中間空間 */
}

/* 按鈕靠左 */
.loan-action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* 防止被擠掉 */
}

/* 狀態文字靠右或自然排列 */
.status-text {
  flex: 1; /* 撐開剩餘空間 */
  text-align: right;
}

.loan-status-card .divider {
  height: 1px;
  background-color: #d0d0d0;
  margin: 8px 0;
}

/* donut 圖表 */
.chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 152px;
  width: 100%;
}

.chart-box canvas {
  width: 180px;
  height: 180px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: #555;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

/* 資訊區塊 */
.info-box {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.row {
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 18px;
  position: relative;
}

.action-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  margin-top: 4px;
}

.upload-btn {
  color: #0acf3f;
}

.download-btn {
  color: #ebb211;
}

.label {
  color: #333;
  font-weight: 500;
}

.value {
  color: #555;
  min-width: 120px;
  font-weight: 400;
}

/* 各狀態顏色 */
.status-approved {
  border: 1px solid #ebb211;
  color: #ebb211;
}

.status-rejected {
  border: 1px solid #222626;
  color: #222626;
}

.status-pending {
  border: 1px solid #ce1465;
  color: #ce1465;
}

.status-reviewing {
  border: 1px solid #444b4b;
  color: #444b4b;
}

.progress-info {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
  font-weight: 400;
}

.progress-info span {
  font-size: 12px;
}

.progress-info strong {
  font-weight: 500;
}

/* Vuetify箭頭按鈕 */
.arrow-btn {
  color: #555;
  transition: 0.2s;
}

.arrow-btn:hover {
  color: #ebb211 !important;
}

.arrow-btn:disabled {
  color: #ccc !important;
}

.pay {
  background-color: #ebb211;
  border-radius: 50px;
  padding: 8px 16px;
  color: #fff;
  margin-left: 310px;
}

/* 第二區 */
.loan-records {
  background: rgba(245, 245, 245, 0.8);
  border-radius: 30px;
  padding: 20px;
  margin-bottom: 24px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.table thead {
  background-color: #ffffff;
}

.table th {
  color: #444848;
  font-weight: 600;
  text-align: center;
  padding: 14px 10px;
  font-size: 16px;
}

.table td {
  padding: 12px 10px;
  text-align: center;
  background-color: #ffffff;
  color: #666a6a;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.table tr:hover td {
  background-color: #f9f9f9;
}

/* 第三區 */
/* 整體區塊 */
.loan-calculator {
  display: flex;
  gap: 20px;
  background: #f5f5f5;
  border-radius: 30px;
  padding: 20px;
  margin-bottom: 24px;
}

/* 左欄：輸入 */
.calc-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 40px;
}

.calc-left label {
  display: flex;
  flex-direction: column;
  font-size: 18px;
  color: #4c4c4c;
  font-weight: 500;
  gap: 4px;
}

.calc-left input,
.calc-left select {
  margin-top: 6px;
  padding: 10px 14px;
  border-radius: 50px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline: none;
  background: white;
}

.calc-left input:focus,
.calc-left select:focus {
  border-color: #ebb211;
  box-shadow: 0 0 4px rgba(235, 178, 17, 0.5);
}

.calc-left p {
  font-size: 12px;
  color: gray;
  padding-left: 8px;
  margin-top: -24px;
}

.calc-right {
  flex: 1;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.calc-right img {
  width: 488px;
  height: auto;
  object-fit: contain;
  /* 保持比例，完整顯示 */
}

.calc-result {
  position: absolute;
  /* 疊在圖片上 */
  text-align: center;
  color: #fff;
}

.cash {
  color: #ebb211;
}

.highlight {
  font-size: 32px;
  font-weight: bold;
}

.calc-result h3 {
  font-size: 40px;
  font-weight: bold;
}

.calc-result p {
  font-size: 24px;
  font-weight: bold;
}

.calc-result button {
  border: 1px solid #fff;
  border-radius: 50px;
  padding: 8px 24px;
  margin-top: 24px;
}

.calc-result button:hover {
  background-color: #fff;
  color: black;
}

small {
  font-size: 18px;
}

/* 第四區 */
.loan-section {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
}

.loan-section .title {
  color: #009e60;
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 48px;
}

.steps {
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.steps .step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.apply-button {
  margin-top: 40px;
  background-color: #ebb211;
  font-size: 16px;
  color: #ffffff;
  padding: 16px 32px;
  text-decoration: none;
  border: none;
  border-radius: 32px;
}

/* 第五區 */
.loan-plans {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}
</style>
