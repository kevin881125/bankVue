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
        <div
          class="payment-slide"
          :class="{ active: selectedMethod === 'account' }"
        >
          <!-- 選擇還款帳戶 -->
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
        <div
          class="payment-slide"
          :class="{ active: selectedMethod === 'linepay' }"
        >
          <p>請使用 Line Pay 掃描 QR Code 付款：</p>
          <div class="qr-placeholder">[Line Pay QR Code]</div>
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

const fetchNextSchedule = async () => {
  if (!props.loanId) return;
  try {
    const res = await request({
      url: `/loans/${props.loanId}/schedules`,
      method: "get",
    });
    const list = Array.isArray(res.data) ? res.data : res;
    schedule.value = list.find((s) => s.paymentStatus === "pending") || null;
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

onMounted(() => {
  if (innerVisible.value) {
    fetchNextSchedule();
    loadMemberAccounts();
  }
});

watch(innerVisible, async (val) => {
  if (val) {
    await fetchNextSchedule();
    await loadMemberAccounts();
  }
});

const closeDialog = () => {
  innerVisible.value = false;
};

const formatMoney = (amount) =>
  amount != null ? Math.round(amount).toLocaleString() : 0;

const formatAccountBalance = (balance) =>
  typeof balance === "number" ? balance.toLocaleString() : balance || "0";

// --- 繳費流程 ---
function onPayClick() {
  if (!schedule.value) {
    alert("尚無繳費資訊");
    return;
  }
  if (selectedMethod.value === "account" && !selectedAccountId.value) {
    alert("請選擇還款帳戶");
    return;
  }

  confirmMessage.value = `您即將繳交 NT$ ${formatMoney(
    schedule.value.amountDue
  )}，確定嗎？`;
  showConfirm.value = true;
}

async function submitPayment() {
  if (selectedMethod.value === "account") {
    if (!selectedAccountId.value) {
      alert("請選擇還款帳戶");
      return;
    }

    try {
      // 1️⃣ 帳戶轉帳
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

      if (txRes?.status !== "轉帳成功") {
        alert(txRes?.memo || "轉帳失敗");
        return;
      }

      // 2️⃣ 呼叫貸款 API 新增繳費紀錄並更新排程
      const paymentRequest = {
        amountPaid: schedule.value.amountDue, // 注意這裡要對應後端 LoanPayment 的欄位
        scheduleId: schedule.value.scheduleId,
        accountId: selectedAccountId.value,
        paymentMethod: "account", // 帳戶轉帳
        memo: `貸款 ${props.loanId || ""} 繳款`,
      };

      const paymentRes = await request({
        url: `/loans/${props.loanId}/payments/submit`,
        method: "post",
        data: paymentRequest,
      });

      emit("success", paymentRes);
      innerVisible.value = false;
    } catch (err) {
      console.error("繳費失敗:", err);
      alert("繳費失敗，請稍後再試");
    }
  } else if (selectedMethod.value === "linepay") {
    alert("Line Pay 功能尚未串接實際付款 API");
  }
}

function handleConfirm() {
  showConfirm.value = false;
  submitPayment();
}

function handleCancel() {
  showConfirm.value = false;
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
.qr-placeholder {
  width: 150px;
  height: 150px;
  background: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto;
  border: 1px dashed #ccc;
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
  font-size: 20px; /* 大字級 */
  font-weight: bold;
  color: #27ae60; /* 綠色 */
  margin-bottom: 10px; /* 與按鈕間距 */
}
</style>
