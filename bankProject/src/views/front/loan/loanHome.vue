<template>
  <div class="loan-container">
    <!-- 第一區：個人貸款資訊（優化視覺排版） -->
    <section v-if="isMemberWithLoans" class="loan-status-carousel">
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
          <!-- 頂部標題和狀態區域 -->
          <div class="card-header">
            <h2 class="loan-title">
              申貸帳戶: {{ currentLoan.loanId }} - {{ currentLoan.typeName }}
              <button class="detail-btn" @click="onOpenDetail">
                <span class="mdi mdi-eye"></span>
              </button>
            </h2>

            <div class="status-container">
              <div
                class="status-badge"
                :class="statusClass(currentLoan.status)"
              >
                <div class="action-buttons">
                  <button
                    v-if="currentLoan.status === 'supplement'"
                    class="action-btn upload-btn"
                    @click="onUploadSupplement"
                    title="上傳補件"
                  >
                    <v-icon size="18">mdi-upload</v-icon>
                  </button>
                  <button
                    v-else-if="currentLoan.status === 'approved'"
                    class="action-btn download-btn"
                    @click="onDownloadContract"
                    title="下載合約"
                  >
                    <v-icon size="18">mdi-download</v-icon>
                  </button>
                </div>
                <span class="status-text">{{
                  translateStatus(currentLoan.status)
                }}</span>
              </div>
            </div>
          </div>
          <hr class="hr" />
          <!-- 內容區域 -->
          <div class="card-content">
            <!-- 圖表區域 -->
            <div class="chart-section">
              <div class="chart-box">
                <canvas ref="activeChart" width="180" height="180"></canvas>
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
            </div>

            <!-- 資訊區域 -->
            <div class="info-section">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">貸款金額</span>
                  <span class="info-value"
                    >NT$ {{ currentLoan.amount.toLocaleString() }}</span
                  >
                </div>

                <div class="info-item">
                  <span class="info-label">貸款利率</span>
                  <span class="info-value">{{
                    formatRate(currentLoan.rate)
                  }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">還款期數</span>
                  <span class="info-value"
                    >第 {{ currentPeriod }} / {{ currentLoan.months }} 期</span
                  >
                </div>

                <div class="info-item">
                  <span class="info-label">還款進度</span>
                  <span class="info-value">{{ currentLoan.progress }}%</span>
                </div>
              </div>

              <!-- 還款資訊 -->
              <div class="payment-section">
                <div class="payment-info">
                  <span class="payment-text">
                    <strong>還款進度 :</strong>
                    NT$ {{ currentLoan.paid.toLocaleString() }} / NT$
                    {{ currentLoan.amount.toLocaleString() }} (已還
                    {{ currentLoan.progress }}%)
                  </span>
                </div>
                <button
                  v-show="currentLoan.status === 'approved'"
                  class="payment-btn"
                  @click="openPayModal(currentLoan.loanId)"
                >
                  立即繳費
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="loan-status-card empty">
          <div class="empty-content">
            <v-icon size="64" color="#ccc">mdi-bank-outline</v-icon>
            <p>目前沒有貸款資料</p>
          </div>
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

      <pay-modal
        v-model="showPayModal"
        :loan-id="selectedLoanId"
        @success="fetchMemberPayments"
        @update-schedule="fetchNextSchedule"
        @refresh-loans="fetchMemberLoans"
      />
    </section>

    <!-- 單筆貸款詳細資訊（保持不變） -->
    <loanMemberDetail
      v-if="selectedLoan"
      :visible="showModal"
      :data="selectedLoan"
      @close="showModal = false"
    />

    <!-- 第二區：還款紀錄（保持不變） -->
    <section v-if="isMemberWithLoans" class="loan-records-section">
      <div class="section-header">
        <h2>還款紀錄</h2>
        <p class="section-subtitle">最近 5 筆還款記錄</p>
      </div>

      <div class="records-table-wrapper">
        <table class="records-table">
          <thead>
            <tr>
              <th>貸款帳戶</th>
              <th>還款日期</th>
              <th>還款金額</th>
              <th>付款方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in limitedRecords" :key="index">
              <td class="account-cell">{{ record.loanAccount }}</td>
              <td class="date-cell">{{ record.date }}</td>
              <td class="amount-cell">
                NT$ {{ record.amount.toLocaleString() }}
              </td>
              <td class="method-cell">{{ record.paymentMethod }}</td>
            </tr>
            <tr v-if="limitedRecords.length === 0" class="no-data-row">
              <td colspan="4" class="no-data-cell">暫無還款記錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 第三區：貸款產品推薦（改為一次顯示3張、每次切1張、無限循環 + 假資料更完整） -->
    <section class="loan-products-carousel">
      <div class="section-header">
        <h2>貸款產品推薦</h2>
        <p class="section-subtitle">為您精選適合的貸款方案</p>
      </div>

      <div class="products-carousel-wrapper">
        <!-- 左箭頭（無限循環，不禁用） -->
        <button class="carousel-arrow left" @click="prevProduct">
          <v-icon>mdi-chevron-left</v-icon>
        </button>

        <!-- 產品卡片容器：只渲染當前視窗的三張卡片 -->
        <div class="products-container">
          <div class="products-track" :style="trackStyle">
            <div
              class="product-card"
              v-for="(product, index) in visibleProducts"
              :key="index"
            >
              <div class="product-icon">
                <v-icon size="48" :color="product.color">{{
                  product.icon
                }}</v-icon>
              </div>
              <h3 class="product-title">{{ product.name }}</h3>
              <div class="product-rate">{{ product.rate }}</div>
              <div class="product-amount">{{ product.maxAmount }}</div>
              <div class="product-term">{{ product.term }}</div>
              <ul class="product-features">
                <li v-for="(f, idx) in product.features" :key="idx">{{ f }}</li>
              </ul>
              <p class="product-description">{{ product.description }}</p>
              <button class="product-btn">了解更多</button>
            </div>
          </div>
        </div>

        <!-- 右箭頭（無限循環，不禁用） -->
        <button class="carousel-arrow right" @click="nextProduct">
          <v-icon>mdi-chevron-right</v-icon>
        </button>
      </div>
    </section>

    <!-- 第四區：貸款試算（優化視覺排版） -->
    <section class="loan-calculator-section">
      <div class="section-header">
        <h2>貸款試算</h2>
        <p class="section-subtitle">快速計算您的每月還款金額</p>
      </div>

      <div class="calculator-container">
        <!-- 左側：輸入區域 -->
        <div class="calculator-inputs">
          <div class="input-section">
            <h3 class="input-section-title">貸款條件設定</h3>

            <div class="input-group">
              <label class="input-label">貸款金額（萬元）</label>
              <div class="input-wrapper input-with-unit">
                <input
                  type="number"
                  class="input-field"
                  placeholder="最多 500 萬"
                  v-model.number="form.loanAmountWan"
                  :max="loanAmountMaxWan"
                  min="1"
                />
                <span class="input-unit">萬</span>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">貸款類型</label>
              <div class="input-wrapper">
                <select
                  class="input-field select-field"
                  v-model="form.loanTypeId"
                >
                  <option value="">選擇貸款類型</option>
                  <option value="LT001">車貸</option>
                  <option value="LT002">房貸</option>
                  <option value="LT003">個人信貸</option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">貸款期數</label>
              <div class="input-wrapper">
                <select
                  class="input-field select-field"
                  v-model.number="form.loanMonths"
                >
                  <option value="">選擇期數</option>
                  <option v-for="m in monthOptions" :key="m" :value="m">
                    {{ m }} 個月
                  </option>
                </select>
              </div>
            </div>

            <div class="disclaimer">
              <v-icon size="16" color="#999">mdi-information-outline</v-icon>
              <span>實際利率請以最終審核合約為準</span>
            </div>
          </div>
        </div>

        <!-- 右側：計算結果 -->
        <div class="calculator-results">
          <div class="result-section">
            <h3 class="result-section-title">試算結果</h3>

            <div class="result-main">
              <div class="result-primary">
                <span class="result-primary-label">每月還款金額</span>
                <span class="result-primary-value">
                  NT$
                  {{
                    calcResult.monthlyPayment != null
                      ? Math.round(calcResult.monthlyPayment).toLocaleString()
                      : "0"
                  }}
                </span>
              </div>

              <div class="result-rate">
                <span class="result-rate-label">預估年利率</span>
                <span class="result-rate-value">{{
                  formatRate(interestRateDisplay)
                }}</span>
              </div>
            </div>
            <div class="apply-btn">
              <button
                class="calculator-apply-btn"
                @click="scrollToProcessSection"
              >
                <v-icon size="20">mdi-calculator</v-icon>
                立即申請
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 第五區：貸款申請流程（保持不變） -->
    <section class="loan-process-section" ref="processSection">
      <h2 class="process-title">貸款申請流程</h2>
      <p class="process-subtitle">簡單三步驟，快速完成申請</p>

      <div class="process-steps">
        <!-- Step 1 -->
        <div class="process-step">
          <div class="icon-circle">
            <v-icon size="28" color="#fff">mdi-book-check</v-icon>
          </div>
          <h3 class="step-title">填寫資料</h3>
          <p class="step-desc">線上填寫申請資料</p>
        </div>

        <v-icon size="28" color="#ebb211">mdi-chevron-right</v-icon>

        <!-- Step 2 -->
        <div class="process-step">
          <div class="icon-circle">
            <v-icon size="28" color="#fff">mdi-file-search</v-icon>
          </div>
          <h3 class="step-title">案件審核</h3>
          <p class="step-desc">送出申請後<br />隨時可追蹤案件狀態</p>
        </div>

        <v-icon size="28" color="#ebb211">mdi-chevron-right</v-icon>

        <!-- Step 3 -->
        <div class="process-step">
          <div class="icon-circle">
            <v-icon size="28" color="#fff">mdi-cash-multiple</v-icon>
          </div>
          <h3 class="step-title">取得額度</h3>
          <p class="step-desc">最快 20 分鐘完成審核</p>
        </div>
      </div>

      <!-- CTA 按鈕 -->
      <router-link
        to="/yuzubank/loanHome/loanApplicationForm"
        class="apply-loan-btn"
      >
        立即申貸
      </router-link>
    </section>

    <div class="main" ref="routerViewRef">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import Chart from "chart.js/auto";
import { request } from "@/utils/FontAxiosUtil";
import { useRoute } from "vue-router";
import { useMemberStore } from "@/stores/MemberStore";
import { translateStatus } from "@/components/loan/utils/statusHelper";
import loanMemberDetail from "@/components/loan/front/loanMemberDetail.vue";
import payModal from "@/components/loan/front/payModal.vue";

const memberStore = useMemberStore();
const memberId = memberStore.mId;
const showPayModal = ref(false);
const selectedLoanId = ref(null);
const processSection = ref(null);

const openPayModal = async (loanId) => {
  selectedLoanId.value = loanId;
  showPayModal.value = true;
};

const scrollToProcessSection = () => {
  if (processSection.value) {
    processSection.value.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

const loans = ref([]);
const currentIndex = ref(0);
const activeChart = ref(null);
let chartInstance = null;

const currentLoan = computed(() => loans.value[currentIndex.value] || {});
const isMemberWithLoans = computed(
  () => memberStore.isLoggedIn && loans.value.length > 0
);

// 取得會員貸款資料（保持不變）
const fetchMemberLoans = async () => {
  if (!memberStore.isLoggedIn) return;

  try {
    const res = await request({
      url: `/loans/member/${memberId}`,
      method: "get",
    });

    let data = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray(res.data)) {
      data = res.data;
    } else if (res && typeof res === "object") {
      data = [res];
    }
    loans.value = data
      .map((loan) => ({
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
        contractPath: loan.getontractPath || "",
        status: loan.approvalStatus || "未知",
      }))
      .sort((a, b) => {
        // 先比日期
        const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
        if (dateDiff !== 0) return dateDiff;
        // 同一天再比流水號
        const seqA = parseInt(a.loanId.substr(5, 5));
        // 流水號部分
        const seqB = parseInt(b.loanId.substr(5, 5));
        return seqB - seqA; // 越大越新
      });

    currentIndex.value = 0;
    await nextTick();
    renderChart();
  } catch (err) {
    console.error("取得會員貸款資料失敗:", err);
    loans.value = [];
  }
};

// 單筆貸款詳細資訊（保持不變）
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
    status: currentLoan.value.status,
    approvalStatusName: translateStatus(currentLoan.value.status),
    progress: currentLoan.value.progress || 0,
  };
  showModal.value = true;
};

// 狀態顏色變換（保持不變）
const statusClass = (status) => {
  switch (status) {
    case "approved":
      return "status-approved";
    case "rejected":
      return "status-rejected";
    case "pending":
      return "status-pending";
    case "supplement":
      return "status-supplement";
    default:
      return "";
  }
};

// 上傳補件檔案（保持不變）
const onUploadSupplement = async () => {
  const loanId = currentLoan.value.loanId;
  if (!loanId) {
    alert("找不到貸款資料");
    return;
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.jpg,.png";
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
      await fetchMemberLoans();
    } catch (err) {
      console.error("上傳失敗:", err);
      alert("補件上傳失敗，請稍後再試");
    }
  };
  fileInput.click();
};

// 下載合約（保持不變）
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
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("下載失敗:", err);
    alert("下載失敗，請稍後再試");
  }
};

// 還款期數（保持不變）
const currentPeriod = computed(() => {
  if (!currentLoan.value || !currentLoan.value.months) return 0;
  return Math.floor(
    (currentLoan.value.progress / 100) * currentLoan.value.months
  );
});

// Carousel 左右切換（保持不變）
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

// 更新 donut 圖表（保持不變）
const renderChart = () => {
  if (!currentLoan.value || !activeChart.value) return;
  if (chartInstance) chartInstance.destroy();

  const progress = Math.min(Math.max(currentLoan.value.progress || 0, 0), 100);

  chartInstance = new Chart(activeChart.value, {
    type: "doughnut",
    data: {
      labels: ["已還款", "剩餘"],
      datasets: [
        {
          data: [progress, 100 - progress],
          backgroundColor: ["#EBB211", "#E0E0E0"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "60%",
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });
};

watch(currentIndex, renderChart);
const formatRate = (rate) =>
  rate != null ? Number(rate * 100).toFixed(1) + "%" : "載入中...";

// 下一期排程（保持不變）
const nextSchedule = ref(null);
const fetchNextSchedule = async () => {
  if (!selectedLoanId.value) return;

  try {
    const res = await request({
      url: `/loans/${selectedLoanId.value}/schedules/next`,
      method: "get",
    });
    nextSchedule.value = res.data || null;
  } catch (err) {
    console.error("取得下一期排程失敗:", err);
    nextSchedule.value = null;
  }
};

// 還款紀錄（保持不變）
const records = ref([]);
const limitedRecords = computed(() => {
  return records.value.slice(0, 5);
});

const fetchMemberPayments = async () => {
  if (!memberStore.isLoggedIn) return;

  try {
    const res = await request({
      url: `/loans/member/${memberId}/payments`,
      method: "get",
    });

    let data = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray(res.data)) {
      data = res.data;
    } else if (res && typeof res === "object") {
      data = [res];
    }

    records.value = data
      .map((item) => ({
        loanAccount: item.loanId || "",
        date: item.paymentDate
          ? new Date(item.paymentDate).toLocaleDateString()
          : "",
        amount: item.amountPaid ? Number(item.amountPaid) : 0,
        paymentMethod: item.paymentMethod || "",
        sortDate: item.paymentDate ? new Date(item.paymentDate) : new Date(0),
      }))
      .sort((a, b) => b.sortDate - a.sortDate);
  } catch (err) {
    console.error("取得還款紀錄失敗:", err);
    records.value = [];
  }
};

// 貸款產品數據（填入更完整的假資料）
const loanProducts = ref([
  {
    name: "汽車貸款",
    rate: "年利率 2.88% 起",
    maxAmount: "最高 200 萬",
    features: ["新車舊車皆可貸", "快速審核", "最高可貸車價 100%"],
    description:
      "不論新車或中古車，提供彈性貸款方案，審核快速，讓您輕鬆擁有愛車",
    icon: "mdi-car",
    color: "#EBB211",
    term: "最長 7 年",
  },
  {
    name: "房屋貸款",
    rate: "年利率 1.56% 起",
    maxAmount: "最高 2000 萬",
    features: ["首購優惠", "寬限期最長 5 年", "可貸成數高達 8 成"],
    description: "購屋自住首選，提供優惠利率與彈性還款方案，實現您的購屋夢想",
    icon: "mdi-home",
    color: "#CE1465",
    term: "最長 30 年",
  },
  {
    name: "個人信貸",
    rate: "年利率 3.99% 起",
    maxAmount: "最高 300 萬",
    features: ["免保人免擔保", "24小時線上申請", "最快當日撥款"],
    description: "線上申請簡便快速，無需保人擔保，資金週轉的最佳選擇",
    icon: "mdi-account-cash",
    color: "#222626",
    term: "最長 7 年",
  },
  {
    name: "企業貸款",
    rate: "年利率 2.5% 起",
    maxAmount: "最高 5000 萬",
    features: ["營運資金週轉", "設備採購專案", "專業團隊服務"],
    description: "協助企業擴展營運，提供設備採購與週轉金專案，專業團隊量身規劃",
    icon: "mdi-office-building",
    color: "#EBB211",
    term: "最長 20 年",
  },
  {
    name: "學生貸款",
    rate: "年利率 1.8% 起",
    maxAmount: "最高 100 萬",
    features: ["就學期間免還本金", "畢業後彈性還款", "政府專案優惠"],
    description: "協助學子完成學業夢想，寬限期長，減輕在學期間經濟壓力",
    icon: "mdi-school",
    color: "#CE1465",
    term: "最長 15 年",
  },
  {
    name: "創業貸款",
    rate: "年利率 3.2% 起",
    maxAmount: "最高 800 萬",
    features: ["青年創業優惠", "政府補貼利息", "創業顧問輔導"],
    description: "支持創業夢想，提供優惠利率與創業輔導，讓您的事業起步更順利",
    icon: "mdi-rocket-launch",
    color: "#222626",
    term: "最長 10 年",
  },
  {
    name: "裝修貸款",
    rate: "年利率 4.2% 起",
    maxAmount: "最高 500 萬",
    features: ["工程分期撥款", "專案管理服務", "裝修完工保障"],
    description: "打造理想居家空間，提供裝修工程分期撥款，讓您安心改造家園",
    icon: "mdi-home-edit",
    color: "#EBB211",
    term: "最長 15 年",
  },
  {
    name: "醫美貸款",
    rate: "年利率 5.9% 起",
    maxAmount: "最高 150 萬",
    features: ["指定診所合作", "分期零利率", "審核快速通過"],
    description: "讓美麗不再等待，與優質醫美診所合作，提供分期付款服務",
    icon: "mdi-spa",
    color: "#CE1465",
    term: "最長 5 年",
  },
]);

/** 產品輪播：一次顯示 3 張、每次切 1 張、可循環 */
const productsPerPage = 3;

// 計算要顯示的卡片
const visibleProducts = computed(() => loanProducts.value);

// 計算 track 的偏移量
const trackStyle = computed(() => {
  const percent = -(currentIndex.value * (100 / productsPerPage));
  return {
    transform: `translateX(${percent}%)`,
    transition: "transform 0.5s ease",
  };
});

// 上一張
const prevProduct = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  } else {
    currentIndex.value = loanProducts.value.length - productsPerPage;
  }
};

// 下一張
const nextProduct = () => {
  if (currentIndex.value < loanProducts.value.length - productsPerPage) {
    currentIndex.value += 1;
  } else {
    currentIndex.value = 0;
  }
};

//  貸款試算
const loanAmountMaxWan = 500;
const form = ref({
  loanAmountWan: 50, // 以「萬元」為單位
  loanTypeId: "LT001",
  loanMonths: 16,
});

// 計算實際貸款金額（元）
const loanAmountInNTD = computed(() => {
  return form.value.loanAmountWan * 10000;
});

const monthOptions = [6, 10, 12, 16, 24, 36, 40, 48, 56, 60];

const interestRateDisplay = ref(null);
const calcResult = ref({
  monthlyPayment: 0,
  totalInterest: 0,
  totalPayment: 0,
});

const formatMoney = (amount) =>
  amount != null ? Math.round(amount).toLocaleString() : "0";

const monthToTermId = (months) => {
  if (months >= 6 && months <= 12) return "TERM001";
  if (months >= 13 && months <= 36) return "TERM002";
  if (months >= 37 && months <= 60) return "TERM003";
  return null;
};

const fetchLoanCalculation = async () => {
  if (!form.value.loanTypeId || !form.value.loanMonths) {
    interestRateDisplay.value = null;
    calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
    return;
  }

  const termId = monthToTermId(form.value.loanMonths);

  try {
    const rateResponse = await request({
      url: "/loans/calc/rate",
      method: "get",
      params: {
        loanTypeId: form.value.loanTypeId,
        loanTermId: termId,
      },
    });

    let rateValue = null;
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

    interestRateDisplay.value =
      rateValue != null && rateValue > 0 ? Number(rateValue) : null;
  } catch (err) {
    console.error("取得利率錯誤:", err);
    interestRateDisplay.value = null;
  }

  if (loanAmountInNTD.value > 0) {
    try {
      const paymentResponse = await request({
        url: "/loans/calc/monthly-payment",
        method: "post",
        data: {
          loanTypeId: form.value.loanTypeId,
          loanTermId: termId,
          loanMonths: form.value.loanMonths,
          amount: loanAmountInNTD.value,
        },
      });

      const result = paymentResponse.data || paymentResponse;
      calcResult.value = {
        monthlyPayment: result.monthlyPayment || 0,
        totalInterest: result.totalInterest || 0,
        totalPayment: result.totalPayment || 0,
      };
    } catch (err) {
      console.error("計算月付款錯誤:", err);
      calcResult.value = {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0,
      };
    }
  } else {
    calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }
};

const applyLoan = () => {
  console.log("立即申請，帶入表單資料:", form.value);
};

onMounted(() => {
  fetchMemberLoans();
  fetchLoanCalculation();
  fetchMemberPayments();
});

watch(
  [
    () => form.value.loanAmountWan,
    () => form.value.loanTypeId,
    () => form.value.loanMonths,
  ],
  fetchLoanCalculation
);

//  Route 監聽
const route = useRoute();
const routerViewRef = ref(null);

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === "/yuzubank/loanHome") {
      fetchMemberLoans(); // 每次跳回 loanHome 時刷新
    }
  }
);

watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath.includes("/loanApplicationForm")) {
      await nextTick();
      if (routerViewRef.value) {
        routerViewRef.value.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }
);
</script>

<style scoped>
.loan-container {
  max-width: 1280px;
  align-items: center;
  margin: 0 auto;
  padding: 40px 20px;
  /* background-color: #fafafa; */
}

/* 第一區：個人貸款資訊 - 優化後樣式 */
.loan-status-carousel {
  margin: 60px 0;
}

.loan-status-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 24px;
}

.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #666;
  transition: all 0.3s ease;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.arrow-btn:hover {
  color: #ebb211;
  border-color: #ebb211;
  transform: translateY(-50%) scale(1.05);
}

.arrow-btn.left {
  left: -60px;
}

.arrow-btn.right {
  right: -60px;
}

.arrow-btn:disabled {
  color: #d1d5db;
  border-color: #e5e7eb;
  transform: translateY(-50%) scale(1);
  cursor: not-allowed;
}

.loan-status-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  width: 1280px;
  max-width: 100%;
  height: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

.loan-status-card.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
}

.empty-content {
  text-align: center;
  color: #9ca3af;
}

.empty-content p {
  margin: 16px 0 0 0;
  font-size: 18px;
}

/* 卡片頂部區域 - 優化排版 */
.card-header {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}
.hr {
  border: none;
  border-top: 1px solid #f1f3f4;
  margin: 20px 0;
}
.loan-title {
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  margin: 0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
}

.detail-btn {
  background: none;
  /* border: 1.5px solid #858585; */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ebb211;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;
}

.detail-btn:hover {
  background: #ebb211;
  color: #fff;
  transform: scale(1.1);
}

.status-container {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-text {
  display: flex;
  justify-content: center;
  margin: 2px 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 2px 4px 2px 4px;
  border-radius: 50px;
  border: 1.5px solid;
  font-size: 14px;
  font-weight: 600;
  background: #fff;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  background: none;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  padding-left: 4px;
  padding-top: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn {
  color: #70ca54;
  /* margin-top: 2px; */
}

.upload-btn:hover {
  transform: scale(1.1);
}

.download-btn {
  color: #ebb211;
  /* margin-top: 2px; */
}

.download-btn:hover {
  transform: scale(1.1);
}

.status-approved {
  border-color: #ebb211;
  color: #ebb211;
}

.status-rejected {
  border-color: #ef4444;
  color: #ef4444;
}

.status-pending {
  border-color: #ce1465;
  color: #ce1465;
}

.status-supplement {
  border-color: #70ca54;
  color: #70ca54;
}

/* 卡片內容區域 */
.card-content {
  display: flex;
  gap: 48px;
  align-items: stretch;
}

.chart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 200px;
  width: 200px;
}

.chart-box canvas {
  width: 180px !important;
  height: 180px !important;
  display: block;
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

/* 資訊區域 */
.info-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 18px;
  color: #222626;
  font-weight: 600;
}

.payment-section {
  padding-top: 24px;
  border-top: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-info {
  flex: 1;
  padding: 13px 0;
}

.payment-text {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.5;
  font-weight: 400;
}

.payment-btn {
  background: #ebb211;
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.payment-btn:hover {
  background: #d4a017;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(235, 178, 17, 0.3);
}

/* 共用區段標題樣式 */
.section-header {
  margin-bottom: 32px;
  text-align: center;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #222626;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 第二區：還款紀錄（保持不變） */
.loan-records-section {
  margin: 60px 0;
  position: relative;
}

.records-table-wrapper {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.records-table thead {
  background: linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%);
}

.records-table th {
  padding: 20px 24px;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #222626;
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.records-table th:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background: #e8eaed;
}

.records-table tbody tr {
  transition: all 0.2s ease;
}

.records-table tbody tr:hover {
  background-color: rgba(235, 178, 17, 0.04);
}

.records-table tbody tr:nth-child(even) {
  background-color: #fafbfc;
}

.records-table tbody tr:nth-child(even):hover {
  background-color: rgba(235, 178, 17, 0.06);
}

.records-table td {
  padding: 18px 24px;
  font-size: 15px;
  color: #444;
  border-bottom: 1px solid #f0f2f5;
}

.account-cell {
  font-weight: 500;
  color: #222626;
}

.date-cell {
  color: #666;
}

.amount-cell {
  font-weight: 600;
  color: #ebb211;
}

.method-cell {
  color: #666;
}

.no-data-row td {
  text-align: center;
  padding: 40px 24px;
  color: #999;
  font-style: italic;
}

/* 第三區：貸款產品推薦（保持原樣） */
.loan-products-carousel {
  margin: 60px 0;
  position: relative;
}

.products-carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: #666;
}

.carousel-arrow:hover {
  border: 2px solid #ebb211;
  color: #ebb211;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-arrow.left {
  left: -60px;
}

.carousel-arrow.right {
  right: -60px;
}

.products-container {
  width: 1280px;
  max-width: 100%;
  overflow: hidden;
}

.products-track {
  display: flex;
  gap: 16px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card {
  flex: 0 0 calc(33.333% - 16px);
  background: #fff;
  border-radius: 20px;
  padding: 32px 24px;
  margin: 0 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #f0f2f5;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.product-icon {
  margin-bottom: 20px;
}

.product-title {
  font-size: 22px;
  font-weight: 600;
  color: #222626;
  margin: 0 0 12px 0;
}

.product-rate {
  font-size: 18px;
  font-weight: 600;
  color: #ebb211;
  margin-bottom: 8px;
}

.product-amount,
.product-term {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.product-features {
  list-style: none;
  padding: 0;
  margin: 12px 0;
  text-align: left;
  font-size: 14px;
  color: #444;
  min-height: 60px;
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
  min-height: 42px;
}

.product-btn {
  background: linear-gradient(135deg, #ebb211 0%, #d49d0f 100%);
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-btn:hover {
  background: linear-gradient(135deg, #d49d0f 0%, #c08d0d 100%);
  transform: translateY(-1px);
}

/* 第三區：貸款試算 - 優化後樣式 */
.loan-calculator-section {
  margin: 60px 0;
}

.calculator-container {
  display: flex;
  gap: 48px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

.calculator-inputs {
  flex: 1;
  padding: 40px;
  background: #fafbfc;
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-unit input {
  width: 100%;
  padding-right: 2rem;
}

.input-with-unit span {
  margin-left: -2rem;
  pointer-events: none;
  color: #333;
}

/* 隱藏 Chrome、Safari、Edge 的上下箭頭 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222626;
  margin: 0 0 32px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebb211;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #222626;
  background: #fff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #ebb211;
  box-shadow: 0 0 0 4px rgba(235, 178, 17, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
  pointer-events: none;
}

.select-field {
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
  appearance: none;
}

.disclaimer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-top: 24px;
  padding: 16px;
}

.calculator-results {
  flex: 1;
  padding: 40px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222626;
  margin: 0 0 32px 0;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f3f4;
}

.result-main {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-primary {
  text-align: center;
  padding: 24px;
  border-radius: 12px;
}

.result-primary-label {
  display: block;
  font-size: 24px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 16px;
}

.result-primary-value {
  display: block;
  font-size: 48px;
  font-weight: 1000;
  color: #000000;
  line-height: 1;
}

.result-rate {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid #f1f3f4;
}

.result-rate-label {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.5px;
  padding-right: 8px;
}

.result-rate-value {
  font-size: 24px;
  color: #6b7280;
  font-weight: 500;
  line-height: 0.8;
  letter-spacing: 1.5px;
}

.apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.calculator-apply-btn {
  background: #ebb211;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 50%;
}

.calculator-apply-btn:hover {
  background: #e7ab08;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(235, 178, 17, 0.3);
}

/* 優化後：貸款申請流程 */
.loan-process-section {
  background: #fff;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  margin: 60px 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.process-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #222626;
}

.process-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.process-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.process-step {
  text-align: center;
  max-width: 220px;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ebb211;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  box-shadow: 0 4px 12px rgba(235, 178, 17, 0.3);
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #222626;
  margin-bottom: 6px;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.apply-loan-btn {
  display: inline-block;
  padding: 14px 36px;
  background: #ebb211;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 32px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.apply-loan-btn:hover {
  background: #d49d0f;
  box-shadow: 0 6px 18px rgba(235, 178, 17, 0.3);
}


/* 響應式設計 */
@media (max-width: 1024px) {
  .card-content {
    flex-direction: column;
    gap: 32px;
  }

  .calculator-container {
    flex-direction: column;
  }

  .status-container {
    position: static;
    justify-content: center;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .loan-container {
    padding: 20px 16px;
  }

  .arrow-btn.left {
    left: -40px;
  }

  .arrow-btn.right {
    right: -40px;
  }

  .loan-status-card {
    padding: 24px;
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .payment-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .calculator-inputs,
  .calculator-results {
    padding: 24px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .status-container {
    position: static;
  }
}
</style>
