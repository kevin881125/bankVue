<template>
  <div v-if="innerVisible" class="dialog-overlay">
    <div class="dialog-container">
      <h3 class="dialog-title">立即繳費</h3>
      <hr />

      <!-- 下一期繳費資訊 -->
      <div class="schedule-info">
        <p>
          <strong>繳款截止日：</strong> {{ schedule?.dueDate || "尚未生成" }}
        </p>
      </div>

      <!-- 繳費方式切換 -->
      <div class="payment-tabs">
        <div
          :class="['tab', selectedMethod === 'account' ? 'active' : '']"
          @click="selectedMethod = 'account'"
        >
          帳戶轉帳
        </div>
        <div
          :class="['tab', selectedMethod === 'linepay' ? 'active' : '']"
          @click="selectedMethod = 'linepay'"
        >
          Line Pay
        </div>
      </div>

      <!-- 各繳費方式 UI -->
      <div class="payment-slider">
        <!-- 帳戶轉帳 -->
        <div
          class="payment-slide"
          :class="{ active: selectedMethod === 'account' }"
        >
          <div class="form-item">
            <label for="accountId">還款帳戶:</label>
            <div class="custom-select-wrapper">
              <select v-model="selectedAccountId" id="accountId" required>
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
            <div v-if="accountsLoading" class="loading-text">
              載入帳戶資料中...
            </div>
            <div v-else-if="accounts.length === 0" class="no-accounts-text">
              尚未找到可用帳戶
            </div>
          </div>
        </div>

        <!-- Line Pay -->
        <div
          class="payment-slide"
          :class="{ active: selectedMethod === 'linepay' }"
        >
          <p>點擊「確認繳費」後，將跳轉到 Line Pay 網頁完成付款。</p>
        </div>
      </div>

      <div class="amount-due-display">
        應繳金額：NT$ {{ formatMoney(schedule?.amountDue) }}
      </div>
      <hr />
      <div class="dialog-actions">
        <button class="btn btn-cancel" @click="closeDialog">取消</button>
        <button class="btn btn-confirm" @click="onPayClick">確認繳費</button>
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.dialog-container {
  background: #fff;
  padding: 20px;
  width: 640px;
  border-radius: 8px;
}
.dialog-title {
  margin: 0 0 10px 0;
  text-align: center;
}
.schedule-info p {
  margin: 5px 0;
}
.form-item {
  margin: 10px 0;
}
.custom-select-wrapper {
  width: 100%;
}
.custom-select-wrapper select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.payment-tabs {
  display: flex;
  margin: 15px 0;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: bold;
  color: rgb(128, 128, 128);
}
.tab.active {
  border-color: #ebb211;
  color: #000;
}
.payment-slider {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.payment-slide {
  position: absolute;
  top: 0;
  left: 100%;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.3s ease;
}
.payment-slide.active {
  left: 0;
  opacity: 1;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
.btn {
  padding: 6px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.btn-cancel {
  background: #ccc;
  color: #333;
}
.btn-confirm {
  background: #ebb211;
  color: #fff;
}
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
.amount-due-display {
  text-align: right;
  font-size: 20px;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 10px;
}
</style>
