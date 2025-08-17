<template>
  <div class="loan-container">
    <!-- 第一區：貸款繳納進度 -->
    <section class="loan-status">
      <div class="status-header">
        <h1>個人貸款</h1>
      </div>
      <div class="divider"></div>
      <div class="status-content">
        <div class="chart-box">
          <canvas ref="loanChart"></canvas>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="color-box" style="background-color:#E0E0E0;"></span>剩餘
            </span>
            <span class="legend-item">
              <span class="color-box" style="background-color:#EBB211;"></span>已還款
            </span>
          </div>
        </div>

        <div class="info-box">
          <div class="row">
            <div class="label">貸款帳號 :</div>
            <div class="value">7153000051</div>
            <span class="mdi mdi-eye"></span>
            <div class="review-status">貸款中</div>
          </div>

          <div class="row">
            <div class="label">貸款類型 :</div>
            <div class="value">信貸</div>
            <div class="label">貸款利率 :</div>
            <div class="value">{{ formatRate(interestRateDisplay) }}</div>
          </div>

          <div class="row">
            <div class="label">貸款期數 :</div>
            <div class="value">{{ form.loanMonths }} 個月</div>
            <div class="label">貸款開始時間 :</div>
            <div class="value">2025/08/01</div>
          </div>
          <hr>
          <div class="progress-info">
            <strong>還款進度 : </strong>
            NT$ 500,000 <span>/ NT$ 1,000,000 (已還 50%)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 第二區：繳納明細 -->
    <section class="loan-records">
      <div class="records-header">
        <h2>還款紀錄</h2>
        <button class="pay">立即繳費</button>
      </div>

      <div class="table">
        <table>
          <thead>
            <tr>
              <th>貸款帳戶</th>
              <th>日期</th>
              <th>扣款狀態</th>
              <th>扣款金額</th>
              <th>扣款方式</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="index">
              <td>{{ record.loanAccount }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.status }}</td>
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
        <label>貸款金額
          <input type="number" placeholder="請輸入金額（NT$）" v-model.number="form.loanAmount">
        </label>

        <label>貸款類型
          <select v-model="form.loanTypeId">
            <option value="">選擇貸款類型</option>
            <option value="LT001">車貸</option>
            <option value="LT002">房貸</option>
            <option value="LT003">學生貸款</option>
          </select>
        </label>

        <label>貸款期數（月）
          <select v-model.number="form.loanMonths">
            <option value="">選擇月份</option>
            <option v-for="m in monthOptions" :key="m" :value="m">{{ m }} 個月</option>
          </select>
        </label>

        <p>* 實際利率請以最終審核合約為準</p>
      </div>

      <div class="calc-right">
        <img src="../../../image/background.png" alt="背景圖">
        <div class="calc-result">
          <h3>利率試算</h3>
          <p>每月只需還
            <span class="cash">NT$<span class="highlight">
                {{ calcResult.monthlyPayment != null ? Math.round(calcResult.monthlyPayment).toLocaleString() : 0 }}
              </span> 元</span>
          </p>
          <small>最低年利率：{{ formatRate(interestRateDisplay) }}</small><br>
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
      <router-link to="/yuzubank/loanHome/loanApplicationForm" class="apply-button">立即申請</router-link>
    </section>

    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import { request } from "@/utils/FontAxiosUtil";

const loanChart = ref(null);

onMounted(() => {
  new Chart(loanChart.value, {
    type: "doughnut",
    data: {
      labels: ["已還款", "剩餘"],
      datasets: [{ data: [50, 50], backgroundColor: ["#EBB211", "#E0E0E0"], borderWidth: 0 }],
    },
    options: { cutout: "60%", plugins: { legend: { display: false } }, maintainAspectRatio: false },
  });
});

const records = ref([
  { loanAccount: "7211000051", date: "2025/08/10", status: "扣款成功", amount: 10000, paymentMethod: "7153000051" },
  { loanAccount: "7221000721", date: "2025/07/10", status: "扣款成功", amount: 10000, paymentMethod: "Line Pay" },
]);

const form = ref({
  loanAmount: 100000,
  loanTypeId: "LT001",
  loanMonths: 16,
});

const monthOptions = [6, 10, 12, 16, 24, 36, 40, 48, 56, 60];

const interestRateDisplay = ref(null); // 初始為 null
const calcResult = ref({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0 });

// 格式化函數
const formatMoney = (amount) => amount != null ? Math.round(amount).toLocaleString() : "0";
const formatRate = (rate) => rate != null ? Number(rate).toFixed(1) + "%" : "載入中...";

// 將月份對應到 Term ID
const monthToTermId = (months) => {
  if (months >= 6 && months <= 12) return "TERM001";   // short: 6-12個月
  if (months >= 13 && months <= 36) return "TERM002";  // mid: 13-36個月  
  if (months >= 37 && months <= 60) return "TERM003";  // long: 37-60個月
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
    amount: form.value.loanAmount
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
      if (typeof rateResponse === 'number') {
        rateValue = rateResponse;
      } else if (rateResponse && typeof rateResponse.data === 'number') {
        rateValue = rateResponse.data;
      } else if (rateResponse && !isNaN(parseFloat(rateResponse))) {
        rateValue = parseFloat(rateResponse);
      } else if (rateResponse && rateResponse.data && !isNaN(parseFloat(rateResponse.data))) {
        rateValue = parseFloat(rateResponse.data);
      }

      if (rateValue != null && rateValue > 0) {
        // 後端回傳的是小數形式，轉換為百分比
        interestRateDisplay.value = Number(rateValue) * 100;
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
        calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
      } else if (paymentResponse) {
        // 直接使用回應資料
        const result = paymentResponse.data || paymentResponse;
        calcResult.value = {
          monthlyPayment: result.monthlyPayment || 0,
          totalInterest: result.totalInterest || 0,
          totalPayment: result.totalPayment || 0
        };
        console.log("設定計算結果:", calcResult.value);
      } else {
        console.log("月付款回應為空");
        calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
      }
    } catch (err) {
      console.error("計算月付款時發生錯誤:", err);
      if (err.response) {
        console.error("錯誤回應:", err.response.data);
      }
      calcResult.value = { monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
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
watch([() => form.value.loanAmount, () => form.value.loanTypeId, () => form.value.loanMonths], fetchLoanCalculation);
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

/* 第一區 */

/* 標題水平與垂直置中，底框 */
.status-header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  /* 底色 */
  height: 120px;
  /* 高度可調 */
  border-radius: 12px;
  margin-top: 56px;
}

.status-header h1 {
  font-size: 28px;
  font-weight: 600;
}

/* 排版圖表與資訊 */
.status-content {
  display: flex;
  align-items: flex-start;
  gap: 80px;
}

/* 垂直分隔線 */
.divider {
  width: 1px;
  background-color: #959595;
  align-self: stretch;
}

.loan-status {
  display: flex;
  background: #f5f5f5;
  border-radius: 30px;
  padding: 30px 20px 30px 80px;
  margin-bottom: 24px;
  gap: 80px;
  align-items: flex-start;
}

.chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  height: 152px;
  width: 100%;
  padding: 0;
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
  /* 圖例距離 canvas */
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
  gap: 16px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 18px;
}

.row span {
  margin-left: -16px;
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

.review-status {
  border: 1px solid #0acf3f;
  color: #0acf3f;
  padding: 2px 16px;
  border-radius: 20px;
  font-weight: 400;
  margin-left: auto;
  font-size: 16px;
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

.records-header button {
  background-color: #ebb211;
  border-radius: 50px;
  padding: 8px 16px;
  color: #fff;
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