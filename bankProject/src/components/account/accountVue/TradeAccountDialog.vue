<template>
  <v-dialog v-model="internalShow" width="500">
    <v-card>
      <!-- 標題列 -->
      <v-card-title class="d-flex justify-space-between align-center">
        選擇交易類型
        <v-btn icon @click="internalShow = false" title="關閉">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- 內容區 -->
      <v-card-text class="pa-6 text-center">
        <v-row justify="center" align="center" class="btn-row">
          <v-col cols="12" sm="4">
            <v-btn
              block
              color="red-darken-2"
              variant="elevated"
              size="x-large"
              rounded="lg"
              prepend-icon="mdi-cash-minus"
              @click="onWithdrawDialog = true"
            >
              提款
            </v-btn>
          </v-col>

          <v-col cols="12" sm="4">
            <v-btn
              block
              color="green-darken-2"
              variant="elevated"
              size="x-large"
              rounded="lg"
              prepend-icon="mdi-cash-plus"
              @click="onDepositDialog = true"
            >
              存款
            </v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              block
              color="indigo-darken-2"
              variant="elevated"
              size="x-large"
              rounded="lg"
              prepend-icon="mdi-bank-transfer"
              @click="onTransferDialog = true"
            >
              轉帳
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="onDepositDialog" width="500">
    <v-card>123</v-card>
  </v-dialog>
  <v-dialog v-model="onTransferDialog" width="500">
    <v-card>1231</v-card>
  </v-dialog>

  <!-- 提款 -->
  <v-dialog v-model="onWithdrawDialog" width="520">
    <v-card>
      <!-- 標題：圖示 + 文字 -->
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="red-darken-2">mdi-cash-minus</v-icon>
        <span class="text-h6">提款</span>
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-6">
        <!-- 提款帳戶 -->
        <account-select
          v-model="withdraw.accountId"
          :items="accountOptions"
          :loading="loadingAccounts"
          label="提款帳戶"
          show-hint
          :disabled="false"
        />
        <!-- 提款金額 -->
        <v-text-field
          v-model.number="withdraw.amount"
          type="number"
          min="0"
          step="1"
          prefix="＄"
          label="提款金額"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          :rules="amountRules"
        />
      </v-card-text>

      <!-- 底部：置中按鈕 -->
      <v-card-actions class="justify-center pb-6">
        <v-btn variant="text" @click="onWithdrawDialog = false">取消</v-btn>
        <v-btn
          color="red-darken-2"
          variant="elevated"
          :disabled="!canSubmitWithdraw"
          @click="submitWithdraw"
        >
          確認提款
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, reactive, computed } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import AccountSelect from "@/components/account/common/AccountSelect.vue";
import { useWorkerStore } from "@/stores/Worker";
/** ========= Props / Emits / Dialog 同步 ========= **/
const props = defineProps({
  show: Boolean,
  selectedAccount: Object,
});
const emit = defineEmits(["update:show", "tx-success"]);
const internalShow = ref(props.show);
const onDepositDialog = ref(false);
const onTransferDialog = ref(false);
const onWithdrawDialog = ref(false);
const workerStore = useWorkerStore();
const workerId = workerStore.wId; // 操作行員ID
watch(
  () => props.show,
  (val) => (internalShow.value = val)
);

watch(internalShow, (val) => {
  emit("update:show", val);
});

// 1) 帳戶清單：:用 selectedAccount的mId 去找他的所有帳戶
// const Account = { accountId: "", accountName: "", balance: "" };
const allAccounts = ref([]);
const accountOptions = ref([]);

// 這是一個載入中狀態的 flag，用來在畫面上顯示「讀取中」或鎖住 UI。
const loadingAccounts = ref(false);

const fetchAccountsByMID = async (mId) => {
  if (!mId) {
    allAccounts.value = [];
    return;
  }
  loadingAccounts.value = true;
  try {
    const res = await request({
      url: `/account/getmemberaccounts/${mId}`,
      method: "GET",
    });

    // 安全解包：支援回傳陣列，或 { data: [...] }
    const list = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : [];

    allAccounts.value = list;

    // 這裡要用 allAccounts.value（或直接用 list）
    accountOptions.value = list.map((a) => ({
      label: `${a.accountId}｜${a.accountName}`,
      value: String(a.accountId),
      balance: Number(a.balance ?? 0),
    }));

    console.log(
      "[child] accountOptions.len =",
      accountOptions.value.length,
      accountOptions.value
    );
  } catch (e) {
    console.error("取得帳戶失敗", e);
    allAccounts.value = [];
  } finally {
    loadingAccounts.value = false;
  }
};

// 1) 取得預設帳號（字串化）
const defaultAccountId = computed(() =>
  props.selectedAccount?.accountId != null
    ? String(props.selectedAccount.accountId)
    : ""
);

// 2) 專門重置提款表單的函式
function resetWithdraw() {
  withdraw.value.accountId = defaultAccountId.value; // ← 預設選父層那個帳戶
  withdraw.value.amount = null; // 金額也清空
}

// 3) 打開提款視窗時，重置一次
watch(onWithdrawDialog, (open) => {
  if (open) resetWithdraw();
});

// 只要 mId 出現/變更，撈一次；之後三個 dialog 共用 allAccounts
watch(
  () => props.selectedAccount?.mId ?? null,
  (mId, oldVal) => {
    console.log("[watch] mId changed:", oldVal, "=>", mId);
    if (mId != null) {
      fetchAccountsByMID(mId);
    } else {
      allAccounts.value = [];
      accountOptions.value = []; // 同步清空
    }
  },
  { immediate: true }
);

/** 2) 提款用的表單狀態（其他 Dialog 也可共用同顆下拉） **/
const withdraw = ref({
  accountId: "",
  amount: null,
  transactionType: "提款",
  memo: "臨櫃提款",
  operatorId: workerId,
});

// 目前選擇帳戶餘額
const currentBalance = computed(
  () =>
    accountOptions.value.find((o) => o.value === withdraw.value.accountId)
      ?.balance ?? 0
);

// 驗證規則
const amountRules = [
  (v) => (v !== null && v !== "" && Number(v) > 0) || "請輸入金額",
  (v) => Number(v) <= currentBalance.value || "金額不可超過目前餘額",
];

// 可否提交
const canSubmitWithdraw = computed(
  () =>
    withdraw.value.accountId &&
    withdraw.value.amount > 0 &&
    withdraw.value.amount <= currentBalance.value
);

const submitWithdraw = async () => {
  console.log("提款資料：", withdraw.value);

  const res = await request({
    url: "/account/transaction/depositwithdrawal",
    method: "PUT",
    data: withdraw.value,
  });

  if (res.status == "交易成功") {
    alert("提款成功");
    if (props.selectedAccount?.mId != null) {
      await fetchAccountsByMID(props.selectedAccount.mId);
    }
    // 回到預設值
    resetWithdraw();

    emit("tx-success");
    // 可選：關閉視窗
    onWithdrawDialog.value = false;
    internalShow.value = false;
  } else {
    alert(res?.message || res?.data?.message || "交易失敗，請稍後再試");
  }
};
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.v-card.pa-6 {
  padding-top: 48px; /* 預留給 close-btn */
}

:deep(.v-field__input) {
  font-size: 16px;
}
</style>
