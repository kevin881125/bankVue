<template>
  <div class="loan-container">
    <!-- 第一區：個人貸款資訊（完全保持不變；僅加顯示條件） -->
    <section v-if="isMemberWithLoans" class="loan-status-carousel">
      <div class="loan-status-wrapper">
        <!-- 左箭頭 -->
        <v-btn icon variant="text" class="arrow-btn left" @click="prevLoan" :disabled="loans.length === 0">
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
                <button v-if="currentLoan.status === 'supplement'" class="action-btn upload-btn"
                  @click="onUploadSupplement">
                  <v-icon size="20">mdi-upload</v-icon>
                </button>

                <button v-else-if="currentLoan.status === 'approved'" class="action-btn download-btn"
                  @click="onDownloadContract">
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
                  <span class="color-box" style="background-color: #e0e0e0"></span>剩餘
                </span>
                <span class="legend-item">
                  <span class="color-box" style="background-color: #ebb211"></span>已還款
                </span>
              </div>
            </div>

            <pay-modal v-model="showPayModal" :loan-id="selectedLoanId" @success="fetchMemberPayments"
              @update-schedule="fetchNextSchedule" />

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
                <div class="info-text">
                  <strong>還款進度 :</strong>
                  NT$ {{ currentLoan.paid.toLocaleString() }} / NT$
                  {{ currentLoan.amount.toLocaleString() }} (已還
                  {{ currentLoan.progress }}%)
                </div>
                <button v-show="currentLoan.status === 'approved'" class="pay" color="primary" size="small"
                  @click="openPayModal(currentLoan.loanId)">
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
        <v-btn icon variant="text" class="arrow-btn right" @click="nextLoan" :disabled="loans.length === 0">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </section>

    <!-- 單筆貸款詳細資訊（保持不變） -->
    <loanMemberDetail v-if="selectedLoan" :visible="showModal" :data="selectedLoan" @close="showModal = false" />

    <!-- 第二區：還款紀錄（保持內容；僅加顯示條件） -->
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
              <td class="amount-cell">NT$ {{ record.amount.toLocaleString() }}</td>
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
            <div class="product-card" v-for="(product, index) in visibleProducts" :key="index">
              <div class="product-icon">
                <v-icon size="48" :color="product.color">{{ product.icon }}</v-icon>
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

    <!-- 第三區：貸款試算（保持不變） -->
    <section class="loan-calculator-section">
      <div class="section-header">
        <h2>貸款試算</h2>
        <p class="section-subtitle">快速計算您的每月還款金額</p>
      </div>

      <div class="calculator-wrapper">
        <!-- 左側：輸入區域 -->
        <div class="calculator-input">
          <div class="input-group">
            <label class="input-label">
              <span class="label-text">貸款金額</span>
              <input type="number" class="input-field" placeholder="請輸入金額（NT$）" v-model.number="form.loanAmount" />
            </label>
          </div>

          <div class="input-group">
            <label class="input-label">
              <span class="label-text">貸款類型</span>
              <select class="input-field" v-model="form.loanTypeId">
                <option value="">選擇貸款類型</option>
                <option value="LT001">車貸</option>
                <option value="LT002">房貸</option>
                <option value="LT003">個人信貸</option>
              </select>
            </label>
          </div>

          <div class="input-group">
            <label class="input-label">
              <span class="label-text">貸款期數（月）</span>
              <select class="input-field" v-model.number="form.loanMonths">
                <option value="">選擇月份</option>
                <option v-for="m in monthOptions" :key="m" :value="m">
                  {{ m }} 個月
                </option>
              </select>
            </label>
          </div>

          <p class="disclaimer">* 實際利率請以最終審核合約為準</p>
        </div>

        <!-- 右側：計算結果 -->
        <div class="calculator-result">
          <div class="result-card">
            <h3 class="result-title">試算結果</h3>

            <div class="result-item main-result">
              <span class="result-label">每月還款金額</span>
              <span class="result-value primary">
                NT$ {{
                  calcResult.monthlyPayment != null
                    ? Math.round(calcResult.monthlyPayment).toLocaleString()
                    : '0'
                }}
              </span>
            </div>

            <div class="result-item">
              <span class="result-label">預估年利率</span>
              <span class="result-value">{{ formatRate(interestRateDisplay) }}</span>
            </div>

            <button class="apply-btn" @click="applyLoan">
              立即申請
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 第四區：貸款申請流程（完全保持不變） -->
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
      <router-link to="/yuzubank/loanHome/loanApplicationForm" class="apply-button">立即申請</router-link>
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

const openPayModal = async (loanId) => {
  selectedLoanId.value = loanId;
  showPayModal.value = true;
};

const loans = ref([]);
const currentIndex = ref(0);
const activeChart = ref(null);
let chartInstance = null;

const currentLoan = computed(() => loans.value[currentIndex.value] || {});
const isMemberWithLoans = computed(() => memberStore.isLoggedIn && loans.value.length > 0);

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
      contractPath: loan.getontractPath || "",
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
    case "reviewing":
      return "status-reviewing";
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
  const period = Math.floor(
    (currentLoan.value.progress / 100) * currentLoan.value.months
  );
  return period > 0 ? period : 1;
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
        sortDate: item.paymentDate ? new Date(item.paymentDate) : new Date(0)
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
    name: '汽車貸款',
    rate: '年利率 2.88% 起',
    maxAmount: '最高 200 萬',
    features: ['新車舊車皆可貸', '快速審核', '最高可貸車價 100%'],
    description: '不論新車或中古車，提供彈性貸款方案，審核快速，讓您輕鬆擁有愛車',
    icon: 'mdi-car',
    color: '#EBB211',
    term: '最長 7 年'
  },
  {
    name: '房屋貸款',
    rate: '年利率 1.56% 起',
    maxAmount: '最高 2000 萬',
    features: ['首購優惠', '寬限期最長 5 年', '可貸成數高達 8 成'],
    description: '購屋自住首選，提供優惠利率與彈性還款方案，實現您的購屋夢想',
    icon: 'mdi-home',
    color: '#CE1465',
    term: '最長 30 年'
  },
  {
    name: '個人信貸',
    rate: '年利率 3.99% 起',
    maxAmount: '最高 300 萬',
    features: ['免保人免擔保', '24小時線上申請', '最快當日撥款'],
    description: '線上申請簡便快速，無需保人擔保，資金週轉的最佳選擇',
    icon: 'mdi-account-cash',
    color: '#222626',
    term: '最長 7 年'
  },
  {
    name: '企業貸款',
    rate: '年利率 2.5% 起',
    maxAmount: '最高 5000 萬',
    features: ['營運資金週轉', '設備採購專案', '專業團隊服務'],
    description: '協助企業擴展營運，提供設備採購與週轉金專案，專業團隊量身規劃',
    icon: 'mdi-office-building',
    color: '#EBB211',
    term: '最長 20 年'
  },
  {
    name: '學生貸款',
    rate: '年利率 1.8% 起',
    maxAmount: '最高 100 萬',
    features: ['就學期間免還本金', '畢業後彈性還款', '政府專案優惠'],
    description: '協助學子完成學業夢想，寬限期長，減輕在學期間經濟壓力',
    icon: 'mdi-school',
    color: '#CE1465',
    term: '最長 15 年'
  },
  {
    name: '創業貸款',
    rate: '年利率 3.2% 起',
    maxAmount: '最高 800 萬',
    features: ['青年創業優惠', '政府補貼利息', '創業顧問輔導'],
    description: '支持創業夢想，提供優惠利率與創業輔導，讓您的事業起步更順利',
    icon: 'mdi-rocket-launch',
    color: '#222626',
    term: '最長 10 年'
  },
  {
    name: '裝修貸款',
    rate: '年利率 4.2% 起',
    maxAmount: '最高 500 萬',
    features: ['工程分期撥款', '專案管理服務', '裝修完工保障'],
    description: '打造理想居家空間，提供裝修工程分期撥款，讓您安心改造家園',
    icon: 'mdi-home-edit',
    color: '#EBB211',
    term: '最長 15 年'
  },
  {
    name: '醫美貸款',
    rate: '年利率 5.9% 起',
    maxAmount: '最高 150 萬',
    features: ['指定診所合作', '分期零利率', '審核快速通過'],
    description: '讓美麗不再等待，與優質醫美診所合作，提供分期付款服務',
    icon: 'mdi-spa',
    color: '#CE1465',
    term: '最長 5 年'
  }
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

const form = ref({
  loanAmount: 100000,
  loanTypeId: "LT001",
  loanMonths: 16,
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
    if (rateResponse && rateResponse.error) {
      interestRateDisplay.value = null;
    } else {
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
        interestRateDisplay.value = Number(rateValue);
      } else {
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

      if (paymentResponse && paymentResponse.error) {
        calcResult.value = {
          monthlyPayment: 0,
          totalInterest: 0,
          totalPayment: 0,
        };
      } else if (paymentResponse) {
        const result = paymentResponse.data || paymentResponse;
        calcResult.value = {
          monthlyPayment: result.monthlyPayment || 0,
          totalInterest: result.totalInterest || 0,
          totalPayment: result.totalPayment || 0,
        };
      } else {
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

/* 第一區：貸款繳納進度 - 卡片輪播（保持不變） */
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
  position: relative;
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

.arrow-btn.left {
  left: -48px;
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
  width: 1280px;
}

.review-status {
  display: flex;
  align-items: center;
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
  justify-content: center;
  position: relative;
}

.status-header h2 {
  margin: 0;
  text-align: center;
  flex: 1;
}

.loan-action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.status-text {
  flex: 1;
  text-align: right;
}

.loan-status-card .divider {
  height: 1px;
  background-color: #d0d0d0;
  margin: 8px 0;
}

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

.info-box {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.row {
  display: flex;
  align-items: center;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #555;
  line-height: 1.5;
  font-weight: 400;
  white-space: nowrap;
  min-height: 48px;
}

.progress-info .info-text {
  display: inline-block;
}

.progress-info button.pay {
  margin-left: 0;
}

.progress-info span {
  font-size: 12px;
}

.progress-info strong {
  font-weight: 500;
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

/* 共用區段標題樣式（保持） */
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

/* 第二區：還款紀錄（保持） */
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
  content: '';
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
  color: #EBB211;
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

/* 第三區：貸款產品卡片輪播（改版後） */
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
  border-color: #EBB211;
  background: #EBB211;
  color: #fff;
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
  color: #EBB211;
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
  background: linear-gradient(135deg, #EBB211 0%, #d49d0f 100%);
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

/* 第三區：貸款試算（保持） */
.loan-calculator-section {
  margin: 60px 0;
}

.calculator-wrapper {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

.calculator-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-text {
  font-size: 16px;
  font-weight: 500;
  color: #222626;
}

.input-field {
  padding: 16px 20px;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  font-size: 16px;
  color: #222626;
  background: #fff;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #EBB211;
  box-shadow: 0 0 0 4px rgba(235, 178, 17, 0.1);
}

.input-field::placeholder {
  color: #999;
}

.disclaimer {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-style: italic;
}

.calculator-result {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #f0f2f5;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  margin: 0 0 32px 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 0;
}

.result-item.main-result {
  border-top: 2px solid #EBB211;
  border-bottom: 2px solid #EBB211;
  padding: 20px 0;
  margin: 24px 0;
}

.result-label {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.result-value {
  font-size: 18px;
  font-weight: 600;
  color: #222626;
}

.result-value.primary {
  font-size: 28px;
  color: #EBB211;
}

.apply-btn {
  background: linear-gradient(135deg, #EBB211 0%, #d49d0f 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
  width: 100%;
}

.apply-btn:hover {
  background: linear-gradient(135deg, #d49d0f 0%, #c08d0d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(235, 178, 17, 0.3);
}

/* 第四區：貸款申請流程（保持不變） */
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

/* 輕量區塊分隔（新增，不影響原本結構） */
.loan-status-carousel,
.loan-records-section,
.loan-products-carousel,
.loan-calculator-section,
.loan-section {
  position: relative;
}

.loan-status-carousel::after,
.loan-records-section::after,
.loan-products-carousel::after,
.loan-calculator-section::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -30px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e9ecef, transparent);
}
</style>
