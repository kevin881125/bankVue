<template>
  <div class="loan-form-container">
    <section>
      <h2>貸款申請表單</h2>
      <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <div class="form-grid">
          <!-- 會員姓名 -->
          <div class="form-item">
            <label for="memberName">會員姓名:</label>
            <input
              type="text"
              v-model="form.memberName"
              id="memberName"
              readonly
            />
          </div>

          <!-- 貸款金額 -->
          <div class="form-item">
            <label for="loanAmount">貸款金額（萬元）:</label>
            <div class="input-with-unit">
              <input
                type="number"
                v-model="form.loanAmount"
                id="loanAmount"
                min="1"
                max="500"
                placeholder="最多 500 萬元"
                required
              />
              <span>萬</span>
            </div>
          </div>

          <!-- 貸款類型 -->
          <div class="form-item">
            <label for="loanTypeId">貸款類型:</label>
            <div class="custom-select-wrapper">
              <select
                v-model="form.loanTypeId"
                id="loanTypeId"
                @change="fetchInterestRate"
                required
              >
                <option value="">選擇貸款類型</option>
                <option value="LT001">車貸</option>
                <option value="LT002">房貸</option>
                <option value="LT003">就學貸款</option>
              </select>
            </div>
          </div>

          <!-- 貸款期數 -->
          <div class="form-item">
            <label for="loanTermId">貸款期數（月）:</label>
            <div class="custom-select-wrapper">
              <select
                v-model="form.loanTermId"
                id="loanTermId"
                @change="handleTermChange"
                required
              >
                <option value="">選擇期數</option>
                <option value="TERM001" data-month="6">6 個月</option>
                <option value="TERM001" data-month="9">9 個月</option>
                <option value="TERM001" data-month="12">12 個月</option>
                <option value="TERM002" data-month="24">24 個月</option>
                <option value="TERM002" data-month="36">36 個月</option>
                <option value="TERM003" data-month="48">48 個月</option>
                <option value="TERM003" data-month="60">60 個月</option>
              </select>
            </div>
          </div>

          <!-- 還款帳戶 -->
          <div class="form-item">
            <label for="accountId">還款帳戶:</label>
            <div class="custom-select-wrapper">
              <select v-model="form.accountId" id="accountId" required>
                <option value="">請選擇還款帳戶</option>
                <option
                  v-for="acc in accounts"
                  :key="acc.accountId"
                  :value="acc.accountId"
                >
                  {{ acc.accountName }} ({{ acc.currency }}
                  {{ formatAccountBalance(acc.balance) }})
                </option>
              </select>
            </div>
            <!-- 顯示帳戶載入狀態 -->
            <div v-if="accountsLoading" class="loading-text">
              載入帳戶資料中...
            </div>
            <div v-else-if="accounts.length === 0" class="no-accounts-text">
              尚未找到可用帳戶
            </div>
          </div>

          <!-- 上傳收入證明 -->
          <div class="form-item file-upload">
            <label>收入證明上傳:</label>
            <div class="file-wrapper" @click="triggerFile">
              <div class="file-label">選擇檔案</div>
              <div class="file-input-wrapper">
                <span class="file-name">{{ fileName || "尚未選擇檔案" }}</span>
                <input type="file" ref="fileInput" @change="handleFileChange" />
              </div>
            </div>
          </div>

          <!-- 利率顯示 -->
          <div class="form-item interest-display">
            <label
              >預估利率：<span class="rate-value">{{
                interestRateDisplay
              }}</span></label
            >
          </div>

          <!-- 月付款試算 -->
          <div class="form-item payment-display" v-if="monthlyPayment > 0">
            <label
              >預估月付款：<span class="payment-value"
                >NT$ {{ formatNumber(monthlyPayment) }} 元</span
              ></label
            >
          </div>
        </div>

        <input type="hidden" v-model="form.mId" />
        <input type="hidden" v-model="form.applyDate" />
        <input type="hidden" v-model="form.loanTerm" />

        <!-- 送出按鈕 -->
        <div class="form-actions">
          <button type="submit">送出申請</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import { request } from "@/utils/FontAxiosUtil";
import router from "@/router";

const memberStore = useMemberStore();
const form = ref({
  memberName: "",
  loanAmount: "",
  loanTypeId: "",
  loanTermId: "",
  loanTerm: "",
  accountId: "",
  mId: "",
  applyDate: "",
});

const file = ref(null);
const fileName = ref("");
const interestRateDisplay = ref("--.-%");
const monthlyPayment = ref(0);
const fileInput = ref(null);
const accounts = ref([]);
const accountsLoading = ref(false);

// 格式化數字
const formatNumber = (num) => {
  return Math.round(num).toLocaleString();
};

// 格式化帳戶餘額顯示
const formatAccountBalance = (balance) => {
  if (typeof balance === "number") {
    return balance.toLocaleString();
  }
  return balance || "0";
};

// 載入會員帳戶資料
const loadMemberAccounts = async () => {
  if (!form.value.mId) {
    console.warn("會員ID不存在，無法載入帳戶資料");
    return;
  }

  accountsLoading.value = true;
  try {
    console.log(`載入會員帳戶，會員ID: ${form.value.mId}`);

    const res = await request({
      url: `/account/getmemberaccounts/${form.value.mId}`,
      method: "get",
    });

    console.log("帳戶API回應:", res);

    if (res && res.data && Array.isArray(res.data)) {
      accounts.value = res.data;
      console.log(`成功載入 ${accounts.value.length} 個帳戶`);

      if (accounts.value.length > 0) {
        form.value.accountId = accounts.value[0].accountId;
        console.log(
          `自動選擇帳戶: ${accounts.value[0].accountName} (${accounts.value[0].accountId})`
        );
      }
    } else if (res && Array.isArray(res)) {
      // 處理直接返回陣列的情況
      accounts.value = res;
      console.log(`成功載入 ${accounts.value.length} 個帳戶 (直接陣列)`);

      // 如果有帳戶，自動選擇第一個
      // if (accounts.value.length > 0) {
      //   form.value.accountId = accounts.value[0].accountId;
      //   console.log(
      //     `自動選擇帳戶: ${accounts.value[0].accountName} (${accounts.value[0].accountId})`
      //   );
      // }
    } else {
      accounts.value = [];
      console.warn("取得會員帳戶資料格式不正確", res);
    }
  } catch (err) {
    console.error("取得會員帳戶失敗", err);
    accounts.value = [];

    // 提供更詳細的錯誤訊息
    if (err.response) {
      console.error("API錯誤回應:", err.response.data);
      console.error("狀態碼:", err.response.status);
    }
  } finally {
    accountsLoading.value = false;
  }
};

// 初始設定
onMounted(async () => {
  form.value.memberName = memberStore.mName;
  form.value.mId = memberStore.mId;
  form.value.applyDate = new Date().toISOString();

  console.log("初始化表單，會員資料:", {
    memberName: form.value.memberName,
    mId: form.value.mId,
  });

  // 載入會員帳戶
  await loadMemberAccounts();
});

// 更新 loanTerm 值
const updateLoanTerm = () => {
  const selectEl = document.getElementById("loanTermId");
  if (!selectEl || selectEl.selectedIndex < 0) return;

  const selectedOption = selectEl.options[selectEl.selectedIndex];
  const monthValue = selectedOption.getAttribute("data-month");
  if (monthValue) {
    form.value.loanTerm = monthValue;
    console.log("更新 loanTerm:", monthValue);
  }
};

// 期數變更處理
const handleTermChange = () => {
  updateLoanTerm();
  fetchInterestRate();
};

// 取得利率並計算月付款
const fetchInterestRate = async () => {
  console.log("開始取得利率，參數:", {
    loanTypeId: form.value.loanTypeId,
    loanTermId: form.value.loanTermId,
    loanAmount: form.value.loanAmount,
    loanTerm: form.value.loanTerm,
  });

  if (!form.value.loanTypeId || !form.value.loanTermId) {
    interestRateDisplay.value = "--.-%";
    monthlyPayment.value = 0;
    return;
  }

  try {
    // 1. 取得利率
    const rateRes = await request({
      url: "/loans/calc/rate",
      method: "get",
      params: {
        loanTypeId: form.value.loanTypeId,
        loanTermId: form.value.loanTermId,
      },
    });

    console.log("利率 API 回應:", rateRes);

    let rateValue = 0;
    if (rateRes) {
      // 處理不同的回應格式
      if (typeof rateRes === "number") {
        rateValue = rateRes;
      } else if (rateRes.data && typeof rateRes.data === "number") {
        rateValue = rateRes.data;
      } else if (!isNaN(parseFloat(rateRes))) {
        rateValue = parseFloat(rateRes);
      }

      if (rateValue > 0) {
        interestRateDisplay.value = (rateValue * 100).toFixed(1) + "%";
        console.log("設定利率顯示:", interestRateDisplay.value);
      } else {
        interestRateDisplay.value = "無法取得利率";
      }
    } else {
      interestRateDisplay.value = "無法取得利率";
    }

    // 2. 如果有貸款金額，計算月付款
    if (
      form.value.loanAmount &&
      form.value.loanAmount > 0 &&
      form.value.loanTerm
    ) {
      try {
        const paymentRes = await request({
          url: "/loans/calc/monthly-payment",
          method: "post",
          data: {
            loanTypeId: form.value.loanTypeId,
            loanTermId: form.value.loanTermId,
            loanMonths: parseInt(form.value.loanTerm),
            amount: form.value.loanAmount * 10000, // 轉換萬元為元
          },
        });

        console.log("月付款 API 回應:", paymentRes);

        if (paymentRes) {
          const result = paymentRes.data || paymentRes;
          monthlyPayment.value = result.monthlyPayment || 0;
          console.log("設定月付款:", monthlyPayment.value);
        } else {
          monthlyPayment.value = 0;
        }
      } catch (paymentErr) {
        console.error("計算月付款失敗:", paymentErr);
        monthlyPayment.value = 0;
      }
    } else {
      monthlyPayment.value = 0;
    }
  } catch (err) {
    console.error("取得利率失敗:", err);
    interestRateDisplay.value = "取得失敗";
    monthlyPayment.value = 0;
  }
};

// 監聽表單變更
watch([() => form.value.loanTypeId, () => form.value.loanTermId], () => {
  if (form.value.loanTypeId && form.value.loanTermId) {
    fetchInterestRate();
  } else {
    interestRateDisplay.value = "--.-%";
    monthlyPayment.value = 0;
  }
});

// 監聽貸款金額變更
watch(
  () => form.value.loanAmount,
  () => {
    if (
      form.value.loanTypeId &&
      form.value.loanTermId &&
      form.value.loanAmount
    ) {
      fetchInterestRate();
    }
  }
);

// 點擊整個欄位觸發 input
const triggerFile = () => {
  fileInput.value.click();
};

// 檔案選擇
const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    file.value = e.target.files[0];
    fileName.value = file.value.name;
  } else {
    file.value = null;
    fileName.value = "";
  }
};

// 表單送出
const handleSubmit = async () => {
  if (!file.value) {
    alert("請選擇收入證明檔案");
    return;
  }

  if (!form.value.loanTerm) {
    alert("請選擇貸款期數");
    return;
  }

  if (!form.value.accountId) {
    alert("請選擇還款帳戶");
    return;
  }

  const formData = new FormData();

  // 準備送出的資料，對應後端 LoanCreateDto 的欄位
  const submitData = {
    mId: form.value.mId,
    loanTypeId: form.value.loanTypeId,
    loanTermId: form.value.loanTermId,
    loanTerm: parseInt(form.value.loanTerm), // 確保是數字
    loanAmount: form.value.loanAmount * 10000, // 轉換萬元為元
    repayAccountId: form.value.accountId, // 注意：對應後端的 repayAccountId
    // 不需要傳 incomeProofPath，後端會自動處理
  };

  console.log("準備送出的貸款資料:", submitData);

  // 使用 @RequestPart 格式
  formData.append(
    "loan",
    new Blob([JSON.stringify(submitData)], { type: "application/json" })
  );
  formData.append("file", file.value);

  try {
    const res = await request({
      url: "/loans/create",
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("送出的 payload:", submitData);

    console.log("API 回應:", res); // 調試用，查看完整回應結構

    // 安全地取得 loanId
    let loanId = "未知";
    if (res) {
      if (res.data && res.data.loanId) {
        loanId = res.data.loanId;
      } else if (res.loanId) {
        loanId = res.loanId;
      } else if (typeof res === "object") {
        // 如果 res 是貸款物件本身
        loanId = res.loanId || "申請成功";
      }
    }

    alert("申請成功！案件編號：" + loanId);

    // 清空表單
    form.value = {
      memberName: memberStore.mName,
      loanAmount: "",
      loanTypeId: "",
      loanTermId: "",
      loanTerm: "",
      accountId: accounts.value.length > 0 ? accounts.value[0].accountId : "",
      mId: memberStore.mId,
      applyDate: new Date().toISOString(),
    };
    file.value = null;
    fileName.value = "";
    interestRateDisplay.value = "--.-%";
    monthlyPayment.value = 0;
    router.push("/yuzubank/loanHome").then(() => {
      // 等 router-view render 完成後刷新貸款資料
      const loanHomeComponent =
        router.currentRoute.value.matched[0].instances.default;
      if (loanHomeComponent && loanHomeComponent.fetchMemberLoans) {
        loanHomeComponent.fetchMemberLoans();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  } catch (err) {
    console.error("貸款申請失敗:", err);
    console.error("錯誤詳情:", err.response);

    // 提供更詳細的錯誤訊息
    let errorMessage = "申請失敗，請稍後再試";

    if (err.response) {
      // 請求已發出且伺服器已回應狀態碼
      console.log("錯誤狀態碼:", err.response.status);
      console.log("錯誤回應資料:", err.response.data);

      if (err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `申請失敗 (狀態碼: ${err.response.status})`;
        }
      }
    } else if (err.request) {
      // 請求已發出但沒有收到回應
      errorMessage = "網路連線問題，請檢查網路連線";
    } else if (err.message) {
      errorMessage = err.message;
    }

    alert(errorMessage);
  }
};
</script>

<style scoped>
.loan-form-container {
  max-width: 1280px;
  /* height: 800px; */
  margin: 0 auto 72px;
  padding: 32px 16px;
}

/* 調整 select 寬度與 input 一致 */
.custom-select-wrapper {
  width: 100%;
}

.custom-select-wrapper select {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 50px;
  border: 1px solid #ccc;
  background-color: #fff;
  box-sizing: border-box;
  appearance: none;
}

/* 載入和無帳戶狀態樣式 */
.loading-text {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

.no-accounts-text {
  font-size: 14px;
  color: #e74c3c;
  margin-top: 4px;
  font-weight: bold;
}

form {
  background-color: #f9f9f9;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 16px 56px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

form input,
form select {
  padding: 12px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 50px;
  background-color: #fff;
  box-sizing: border-box;
}

form input:focus,
form select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}

.interest-display,
.payment-display {
  justify-content: flex-start;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.rate-value {
  color: #e74c3c;
  font-size: 20px;
}

.payment-value {
  color: #27ae60;
  font-size: 18px;
}

.form-actions {
  margin-top: 32px;
  text-align: center;
}

form button {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #ebb211;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

form button:hover {
  background-color: #357ab8;
}

.file-wrapper {
  display: flex;
  border-radius: 50px;
  overflow: hidden;
  border: 1px solid #ccc;
  height: 48px;
  cursor: pointer;
}

.file-label {
  background-color: #dddddd;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 20px;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.file-input-wrapper {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  position: relative;
  background-color: #f5f5f5;
}

.file-name {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input-wrapper input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
