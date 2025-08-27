<template>
  <div v-if="innerVisible" class="dialog-overlay">
    <div class="dialog-container">
      <!-- 標題區域 -->
      <div class="dialog-header">
        <h3 class="dialog-title">立即繳費</h3>
        <div class="due-date">
          繳款截止日：{{ schedule?.dueDate || "尚未生成" }}
        </div>
      </div>

      <!-- 應繳金額區域 -->
      <div class="amount-section">
        <div class="amount-label">本期應繳金額</div>
        <div class="amount-value">
          NT$ {{ formatMoney(schedule?.amountDue) }}
        </div>
      </div>

      <!-- 繳費方式選擇 -->
      <div class="payment-section">
        <div class="section-title">選擇繳費方式</div>

        <div class="payment-methods">
          <div
            :class="[
              'payment-method',
              selectedMethod === 'account' ? 'active' : '',
            ]"
            @click="selectedMethod = 'account'"
          >
            <div class="method-icon">
              <v-icon size="24">mdi-bank</v-icon>
            </div>
            <div class="method-info">
              <div class="method-name">帳戶轉帳</div>
              <div class="method-desc">從您的帳戶直接扣款</div>
            </div>
            <div class="method-radio">
              <div
                :class="[
                  'radio',
                  selectedMethod === 'account' ? 'checked' : '',
                ]"
              ></div>
            </div>
          </div>

          <div
            :class="[
              'payment-method',
              selectedMethod === 'linepay' ? 'active' : '',
            ]"
            @click="selectedMethod = 'linepay'"
          >
            <div class="method-icon">
              <img
                src="../../../image/loan/LINE-Pay(v)_W61_n.png"
                alt="Line Pay"
                class="linepay-icon"
              />
            </div>
            <div class="method-info">
              <div class="method-name">Line Pay</div>
              <div class="method-desc">透過 Line Pay 線上付款</div>
            </div>
            <div class="method-radio">
              <div
                :class="[
                  'radio',
                  selectedMethod === 'linepay' ? 'checked' : '',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- 選擇的繳費方式詳細內容 -->
        <div class="payment-details">
          <!-- 帳戶轉帳詳細設定 -->
          <div v-if="selectedMethod === 'account'" class="payment-content">
            <div class="form-group">
              <label class="form-label">選擇扣款帳戶</label>
              <div class="select-wrapper">
                <select
                  v-model="selectedAccountId"
                  class="form-select"
                  required
                >
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
              <div v-if="accountsLoading" class="status-text loading">
                <span class="loading-dot"></span>載入帳戶資料中...
              </div>
              <div v-else-if="accounts.length === 0" class="status-text error">
                尚未找到可用帳戶
              </div>
            </div>
          </div>

          <!-- Line Pay 詳細說明 -->
          <div v-if="selectedMethod === 'linepay'" class="payment-content">
            <div class="linepay-notice">
              ⇩ 點擊下方「確認繳費」後，至 Line Pay 付款頁面完成交易 ⇩
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="dialog-actions">
        <button class="btn btn-secondary" @click="closeDialog">取消</button>
        <button class="btn btn-primary" @click="onPayClick">確認繳費</button>
      </div>
    </div>
  </div>

  <!-- 共用確認對話框 -->
  <confirm-modal
    :visible="showConfirm"
    :message="confirmMessage"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import ConfirmModal from "@/components/logoutModal.vue";

const memberStore = useMemberStore();

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  loanId: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue", "success", "updateSchedule"]);

const innerVisible = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (innerVisible.value = val)
);
watch(innerVisible, (val) => emit("update:modelValue", val));

const schedule = ref(null);
const selectedMethod = ref("account");
const selectedAccountId = ref("");
const accounts = ref([]);
const accountsLoading = ref(false);

const showConfirm = ref(false);
const confirmMessage = ref("你確定要繳費嗎？");

// --- API 請求 ---
const fetchNextSchedule = async () => {
  if (!props.loanId) return;
  try {
    const res = await request({
      url: `/loans/${props.loanId}/schedules`,
      method: "get",
    });
    const list = Array.isArray(res.data) ? res.data : res;
    schedule.value = list.find((s) => s.paymentStatus === "pending") || {
      qrUrl: null,
    };
  } catch (err) {
    console.error("取得下一期繳費資訊失敗:", err);
    schedule.value = null;
  }
};

const loadMemberAccounts = async () => {
  if (!memberStore.mId) return;
  accountsLoading.value = true;
  try {
    const res = await request({
      url: `/account/getmemberaccounts/${memberStore.mId}`,
      method: "get",
    });
    accounts.value = Array.isArray(res.data) ? res.data : res;
    console.log(res);
    
  } catch (err) {
    console.error("取得會員帳戶失敗", err);
    accounts.value = [];
  } finally {
    accountsLoading.value = false;
  }
};

// --- 付款 ---
function onPayClick() {
  if (!schedule.value) return alert("尚無繳費資訊");
  if (selectedMethod.value === "account" && !selectedAccountId.value)
    return alert("請選擇還款帳戶");

  confirmMessage.value = `您即將繳交 NT$ ${formatMoney(
    schedule.value.amountDue
  )}，確定嗎？`;
  showConfirm.value = true;
}

async function submitPayment() {
  if (selectedMethod.value === "account") {
    if (!selectedAccountId.value) return alert("請選擇還款帳戶");

    try {
      // 內部帳戶轉帳流程
      const txRequest = {
        accountId: selectedAccountId.value,
        transactionType: "繳納貸款",
        toAccountId: "7999999987",
        amount: schedule.value.amountDue,
        operatorId: memberStore.mId,
        memo: `貸款 ${props.loanId || ""} 繳款`,
      };
      const txRes = await request({
        url: `/account/transaction/internaltransfer`,
        method: "put",
        data: txRequest,
      });
      if (txRes?.status !== "轉帳成功") return alert(txRes?.memo || "轉帳失敗");

      // 記錄付款
      const paymentRequest = {
        amountPaid: schedule.value.amountDue,
        scheduleId: schedule.value.scheduleId,
        accountId: selectedAccountId.value,
        paymentMethod: "account",
        paymentReference: `貸款 ${props.loanId || ""} 繳款`,
      };
      const paymentRes = await request({
        url: `/loans/${props.loanId}/payments/submit`,
        method: "post",
        data: paymentRequest,
      });

      emit("success", paymentRes);
      innerVisible.value = false;
      emit("updateSchedule"); // 讓父組件更新排程
      emit("refreshLoans");   // 新增：更新個人貸款資訊
    } catch (err) {
      console.error("繳費失敗:", err);
      alert("繳費失敗，請稍後再試");
    }
  } else if (selectedMethod.value === "linepay") {
    if (!props.loanId) return;

    try {
      console.log("開始 Line Pay 付款流程...");

      // 取得付款 URL
      const res = await request({
        url: `/pay/order/${props.loanId}`,
        method: "get",
      });

      console.log("Line Pay API Response:", res);

      const paymentUrl = res.paymentUrl || res?.data?.paymentUrl;
      const scheduleId = res.scheduleId || res?.data?.scheduleId;

      if (!paymentUrl) {
        alert("未取得 Line Pay 付款連結");
        return;
      }

      console.log("跳轉到 Line Pay:", paymentUrl);

      // 直接跳轉到 Line Pay 付款頁面（不開新視窗）
      // Line Pay 完成後會自動跳轉回 /linepay-success/{loanId}
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Line Pay 付款失敗:", err);
      alert("Line Pay 付款失敗，請稍後再試: " + (err.message || "未知錯誤"));
    }
  }
}

const scheduleList = ref([]);
const loanId = ref(null);

// --- 取得 URL 參數，檢查是否需要刷新 ---
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refreshPayment = urlParams.get("refreshPayment");
  const currentLoanId = urlParams.get("loanId");

  if (refreshPayment === "1" && currentLoanId) {
    console.log("檢測到付款完成，刷新數據...");

    // 等待一下讓後端處理完成
    setTimeout(async () => {
      if (props.loanId === currentLoanId) {
        await fetchNextSchedule();
        emit("updateSchedule");
        console.log("付款後數據刷新完成");
      }
    }, 1000);

    // 清理 URL 參數
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 原有的初始化邏輯
  if (innerVisible.value) {
    await fetchNextSchedule();
    await loadMemberAccounts();
  }
});

// --- API: 取得貸款排程與繳費紀錄 ---
async function fetchLoanSchedules() {
  try {
    const res = await request({
      url: `/loans/${loanId.value}/schedules`,
      method: "get",
    });
    scheduleList.value = Array.isArray(res.data) ? res.data : res;
  } catch (err) {
    console.error("刷新貸款排程失敗:", err);
  }
}

// --- 確認對話框 ---
function handleConfirm() {
  showConfirm.value = false;
  submitPayment();
}
function handleCancel() {
  showConfirm.value = false;
}

// --- 格式化 ---
const formatMoney = (amount) =>
  amount != null ? Math.round(amount).toLocaleString() : 0;
const formatAccountBalance = (balance) =>
  typeof balance === "number" ? balance.toLocaleString() : balance || "0";

// --- Lifecycle ---
onMounted(async () => {
  if (innerVisible.value) {
    await fetchNextSchedule();
    await loadMemberAccounts();
  }
});

watch(innerVisible, async (val) => {
  if (val) {
    await fetchNextSchedule();
    await loadMemberAccounts();
  }
});

watch(selectedMethod, async (val) => {
  if (val === "linepay") {
    if (!schedule.value) await fetchNextSchedule();
  }
});

const closeDialog = () => {
  innerVisible.value = false;
};

// --- 輪詢檢查繳費狀態 (Line Pay) ---
async function pollPaymentStatus(loanId, win) {
  const maxAttempts = 15;
  let attempt = 0;

  const interval = setInterval(async () => {
    attempt++;
    try {
      const res = await request({
        url: `/loans/${loanId}/payments`,
        method: "get",
      });
      if (res.data && res.data.length > 0) {
        // 繳費紀錄已更新
        clearInterval(interval);
        innerVisible.value = false; // 關閉彈窗
        emit("updateSchedule"); // 讓父組件刷新排程
        if (win) win.close(); // 關閉 Line Pay 視窗
      }
    } catch (err) {
      console.error("輪詢繳款狀態失敗:", err);
    }
    if (attempt >= maxAttempts) clearInterval(interval);
  }, 2000);
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(34, 38, 38, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.dialog-container {
  background: #ffffff;
  width: 520px;
  height: 736px;
  max-width: 90vw;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(34, 38, 38, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 標題區域 */
.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f5f5f7;
}

.dialog-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  text-align: center;
}

.due-date {
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 應繳金額區域 */
.amount-section {
  margin: 20px 24px;
  padding: 20px;
  text-align: center;
}

.amount-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #27ae60;
}

/* 繳費方式區域 */
.payment-section {
  padding: 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #222626;
  margin-bottom: 16px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
}

.payment-method:hover {
  border-color: #ebb211;
  transform: translateY(-1px);
}

.payment-method.active {
  border-color: #ebb211;
  background: #fefdf8;
}

.method-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.linepay-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #222626;
  margin-bottom: 2px;
}

.method-desc {
  font-size: 13px;
  color: #666;
}

.method-radio {
  margin-left: 12px;
}

.radio {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.radio.checked {
  border-color: #ebb211;
}

.radio.checked::after {
  content: "";
  width: 10px;
  height: 10px;
  background: #ebb211;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 繳費詳細內容 */
.payment-details {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.payment-content {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #222626;
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
  appearance: none;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.form-select:focus {
  outline: none;
  border-color: #ebb211;
  box-shadow: 0 0 0 3px rgba(235, 178, 17, 0.1);
}

.status-text {
  margin-top: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-text.loading {
  color: #666;
}

.status-text.error {
  color: #ce1465;
}

.loading-dot {
  width: 12px;
  height: 12px;
  border: 2px solid #e5e5e7;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Line Pay 通知 */
.linepay-notice {
  padding: 16px;
  border: 0.5px solid #08bf5b;
  border-radius: 12px;
  font-size: 14px;
  color: #08bf5b;
  margin-top: 20px;
}

/* 操作按鈕 */
.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f5f5f7;
  background: #fafafa;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f5f5f7;
  color: #666;
}

.btn-secondary:hover {
  background: #e5e5e7;
}

.btn-primary {
  background: #ebb211;
  color: white;
}

.btn-primary:hover {
  background: #d49c0f;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
</style>
