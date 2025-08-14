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
              @click="openWithdraw"
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
              @click="openDeposit"
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
              @click="openTransfer"
            >
              轉帳
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 存款 -->
  <v-dialog v-model="onDepositDialog" width="500">
    <v-card>
      <!-- 標題：圖示 + 文字 -->
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="green-darken-2">mdi-cash-plus</v-icon>
        <span class="text-h6">存款</span>
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-6">
        <!-- 存款帳戶 -->
        <account-select
          v-model="form.accountId"
          :items="accountOptions"
          :loading="loadingAccounts"
          label="存款帳戶"
          show-hint
          :disabled="false"
        />
        <!-- 存款金額 -->
        <v-text-field
          v-model.number="form.amount"
          type="number"
          min="0"
          step="1"
          prefix="＄"
          label="存款金額"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          :rules="amountRules"
        />
      </v-card-text>

      <!-- 底部：置中按鈕 -->
      <v-card-actions class="justify-center pb-6">
        <v-btn variant="text" @click="onDepositDialog = false">取消</v-btn>
        <v-btn
          color="green-darken-2"
          variant="elevated"
          @click="submitTransaction(TRANSACTION.DEPOSIT)"
        >
          確認存款
        </v-btn>
      </v-card-actions>
    </v-card>
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
          v-model="form.accountId"
          :items="accountOptions"
          :loading="loadingAccounts"
          label="提款帳戶"
          show-hint
        />
        <!-- 提款金額 -->
        <v-text-field
          v-model.number="form.amount"
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
          @click="submitTransaction(TRANSACTION.WITHDRAW)"
        >
          確認提款
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 轉帳 -->
  <v-dialog v-model="onTransferDialog" width="500">
    <v-card>
      <!-- 標題：圖示 + 文字 -->
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="indigo-darken-2">mdi-bank-transfer</v-icon>
        <span class="text-h6">轉帳</span>
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-6">
        <!-- 轉出帳戶 -->
        <account-select
          v-model="form.accountId"
          :items="accountOptions"
          :loading="loadingAccounts"
          label="轉出帳戶"
          show-hint
          :disabled="false"
        />

        <v-divider class="my-4" />
        <div class="d-flex justify-end">
          <v-btn
            size="small"
            color="indigo-lighten-1"
            @click="openSelectTarget('mine')"
            title="選擇帳戶"
            variant="plain"
            :ripple="false"
          >
            我的帳戶 | 最近轉帳
          </v-btn>
        </div>
        <!-- 收款銀行代碼 -->
        <v-select
          v-model="form.toBankCode"
          :items="bankCodeOptions"
          item-title="label"
          item-value="code"
          label="轉入銀行代號"
          variant="outlined"
          density="comfortable"
          clearable
        />

        <v-row class="mt-3" dense>
          <v-col cols="12">
            <v-text-field
              v-model="form.toAccountId"
              label="收款帳號"
              variant="outlined"
              density="comfortable"
              clearable
            />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <!-- 轉出金額 -->
        <v-text-field
          v-model.number="form.amount"
          type="number"
          min="0"
          step="1"
          prefix="＄"
          label="轉出金額"
          variant="outlined"
          density="comfortable"
          class="mt-4"
          :rules="amountRules"
        />
      </v-card-text>

      <!-- 底部：置中按鈕 -->
      <v-card-actions class="justify-center pb-6">
        <v-btn variant="text" @click="onTransferDialog = false">取消</v-btn>
        <v-btn
          color="indigo-darken-2"
          variant="elevated"
          @click="submitTransaction(TRANSACTION.TRANSFER)"
        >
          確認轉帳
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 轉帳到其他帳戶 -->
  <v-dialog v-model="onTransferAccountsDialog" width="600" height="500">
    <v-card>
      <v-card-title class="d-flex align-center card-title-sticky">
        <v-icon class="mr-2" color="indigo-darken-2">mdi-bank-transfer</v-icon>
        <span class="text-h6">選擇轉入帳號</span>
        <v-spacer></v-spacer>

        <!-- 切換：最近轉帳 / 本人帳號 -->
        <v-btn-toggle
          v-model="targetTab"
          mandatory
          class="toggle-right"
          density="comfortable"
          @update:modelValue="onTabChange"
        >
          <v-btn value="recent" size="large" :ripple="false">最近轉帳</v-btn>
          <v-btn value="mine" size="large" :ripple="false">本人帳號</v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-divider />

      <v-card-text class="list-scroll">
        <!-- 搜尋 -->
        <v-text-field
          v-model="targetSearch"
          prepend-inner-icon="mdi-magnify"
          label="搜尋名稱或帳號"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <!-- 清單 -->
        <v-list class="rounded-xl elevation-1">
          <template v-if="filteredTargets.length">
            <v-list-item
              v-for="item in filteredTargets"
              :key="item.key"
              class="py-4 selectable-item"
              :lines="item.accountName ? 'three' : 'two'"
              @click="selectTarget(item)"
            >
              <div
                class="w-100 d-flex justify-space-between align-start gap-4"
                style="min-width: 0"
              >
                <!-- 左側：帳戶名稱 + 銀行 -->
                <div class="min-w-0">
                  <div class="text-body-1 font-weight-medium">
                    {{ item.accountName || "（未命名）" }}
                  </div>
                  <div class="text-medium-emphasis wrap">
                    ({{ item.bankCode }}) {{ item.bankName || "—" }}
                  </div>
                </div>

                <!-- 右側：帳戶號碼（大字、粗體、靠右） -->
                <div class="acc-no">
                  <div class="acc-no-label">帳戶號碼</div>
                  <div class="acc-no-text">
                    {{ item.accountId }}
                  </div>
                </div>
              </div>
            </v-list-item>
          </template>

          <div v-else class="text-center py-8 text-medium-emphasis">
            沒有符合的帳戶
          </div>
        </v-list>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="onTransferAccountsDialog = false"
          >關閉</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from "vue";
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
const onTransferAccountsDialog = ref(false);
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

// 2) 專門重置表單的函式
function resetForm() {
  form.value.accountId = defaultAccountId.value || "";
  form.value.amount = null;
  form.value.memo = "";
  // 只有轉帳會用到的欄位也順手清一下
  form.value.toBankCode = "";
  form.value.toAccountId = "";
  form.value.operatorId = workerId;
}

// 3) 用批次綁定的方式偵測「由關到開」
[onWithdrawDialog, onDepositDialog, onTransferDialog].forEach((dlg) =>
  watch(dlg, (open, old) => {
    // open → 新的值（最新狀態）old → 舊的值（變化前的狀態）
    if (open && !old) resetForm();
  })
);

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

/** 2) 共用的表單狀態 **/
const form = ref({
  accountId: "",
  amount: null,
  transactionType: "",
  memo: "",
  toBankCode: "",
  toAccountId: "",
  operatorId: workerId,
});

/** 3) 共用常數 **/
const TRANSACTION = {
  WITHDRAW: "提款",
  DEPOSIT: "存款",
  TRANSFER: "內部轉帳",
};

// 目前是哪種交易 (按鈕設定)
const currentType = ref(TRANSACTION.WITHDRAW);

// 目前選擇帳戶餘額
const currentBalance = computed(
  () =>
    accountOptions.value.find((o) => o.value === form.value.accountId)
      ?.balance ?? 0
);

// 金額規則（僅供 UI 提示；真正把關仍在 submitTransaction）
const amountRules = [
  (v) => (v !== null && v !== "" && Number(v) > 0) || "請輸入有效金額",
  (v) => {
    // 只有提款/轉帳需要檢查餘額
    const needBalanceCheck = [
      TRANSACTION.WITHDRAW,
      TRANSACTION.TRANSFER,
    ].includes(currentType.value);
    return (
      !needBalanceCheck ||
      Number(v) <= currentBalance.value ||
      "金額不能大於目前餘額"
    );
  },
];

// 轉帳
// 銀行代碼下拉（先放常用幾家；之後可從後端串 /banks 或 /codes 拿）
const bankCodeOptions = ref([
  { code: "004", label: "004｜臺灣銀行", name: "臺灣銀行" },
  { code: "005", label: "005｜土地銀行", name: "土地銀行" },
  { code: "700", label: "700｜中華郵政", name: "中華郵政" },
  { code: "812", label: "812｜台新銀行", name: "台新國際商業銀行" },
  { code: "822", label: "822｜中國信託", name: "中國信託商業銀行" },
  { code: "810", label: "810｜永豐銀行", name: "永豐商業銀行" },
  { code: "017", label: "017｜第一銀行", name: "第一商業銀行" },
  {
    code: "018",
    label: `${MY_BANK_CODE}｜${MY_BANK_NAME}`,
    name: MY_BANK_NAME,
  },
]);

// 依代碼帶出銀行名稱（唯讀顯示）
const toBankName = computed(
  () =>
    bankCodeOptions.value.find((b) => b.code === form.value.toBankCode)?.name ||
    ""
);

// 「我的帳戶」按鈕：之後可開你的“選我的另一個帳戶”的 dialog
const onMyAccountsDialog = ref(false);
function openMyAccounts() {
  // TODO: 開啟你的“我的帳戶”對話框，選完後把 form.toBankCode / form.toAccountId 帶回來
  onMyAccountsDialog.value = true;
}

// -------- 驗證：依交易型態分別檢查 + 送出表單--------
const submitTransaction = async (type) => {
  const errors = [];

  // 共用: 帳戶 + 金額
  if (!form.value.accountId) errors.push("請選擇帳戶");
  if (form.value.amount == null || form.value.amount <= 0)
    errors.push("請輸入有效金額");

  // 提款,轉帳 檢查餘額
  if ([TRANSACTION.WITHDRAW, TRANSACTION.TRANSFER].includes(type)) {
    if (Number(form.value.amount) > currentBalance.value) {
      errors.push("金額不能大於目前餘額");
    }
  }

  // 轉帳 檢查收款方資訊
  if (type === TRANSACTION.TRANSFER) {
    if (!form.value.toBankCode) errors.push("請輸入收款銀行代碼");
    if (!form.value.toAccountId) errors.push("請輸入收款帳號");
  }

  if (errors.length) {
    //join() 是 陣列的方法，用來把陣列的每個元素合併成一個字串。
    alert(errors.join("\n"));
    return;
  }

  // 路由 & 預設 memo
  const endpointMap = {
    [TRANSACTION.WITHDRAW]: "/account/transaction/depositwithdrawal",
    [TRANSACTION.DEPOSIT]: "/account/transaction/depositwithdrawal",
    [TRANSACTION.TRANSFER]: "/account/transaction/internaltransfer",
  };

  const defaultMemoMap = {
    [TRANSACTION.WITHDRAW]: "臨櫃提款",
    [TRANSACTION.DEPOSIT]: "臨櫃存款",
    [TRANSACTION.TRANSFER]: "臨櫃轉帳",
  };

  // 所有後端需要的欄位
  const base = {
    accountId: form.value.accountId,
    amount: Number(form.value.amount),
    transactionType: type,
    memo: defaultMemoMap[type],
    operatorId: workerId,
  };

  const payload =
    type === TRANSACTION.TRANSFER
      ? {
          ...base,
          toBankCode: form.value.toBankCode,
          toAccountId: form.value.toAccountId,
        }
      : base;

  const res = await request({
    url: endpointMap[type],
    method: "PUT",
    data: payload,
  });

  console.log(`${type} 回應：`, res);

  if (res.status == "交易成功" || res.status == "轉帳成功") {
    alert("交易成功");
    if (props.selectedAccount?.mId != null) {
      await fetchAccountsByMID(props.selectedAccount.mId);
    }

    emit("tx-success");

    // 依交易型態關閉對話框
    if (type === TRANSACTION.WITHDRAW) onWithdrawDialog.value = false;
    if (type === TRANSACTION.DEPOSIT) onDepositDialog.value = false;
    if (type === TRANSACTION.TRANSFER) onTransferDialog.value = false;
    internalShow.value = false;
  } else {
    alert(res?.message || res?.data?.message || "交易失敗，請稍後再試");
  }
};

function openWithdraw() {
  currentType.value = TRANSACTION.WITHDRAW;
  onWithdrawDialog.value = true;
}
function openDeposit() {
  currentType.value = TRANSACTION.DEPOSIT;
  onDepositDialog.value = true;
}
function openTransfer() {
  currentType.value = TRANSACTION.TRANSFER;
  onTransferDialog.value = true;
}

// ====== 快速選擇轉入帳號 Dialog 狀態 ======

function onTabChange(tab) {
  if (tab !== "recent") return; // 只在切到最近轉帳時才撈
  const fromAccountId = form.value.accountId; // ← 就是轉出帳戶
  if (!fromAccountId) {
    // 你也可以換成 snackbar/toast
    alert("請先選擇「轉出帳戶」再查看最近轉帳");
    return;
  }
  fetchRecentTargets(fromAccountId);
}

// 切換：'recent' | 'mine'
const targetTab = ref("recent");
const targetSearch = ref("");

// 自家銀行代碼/名稱（用於「本人帳號」清單）
const MY_BANK_CODE = "018";
const MY_BANK_NAME = "柚子銀行";

// 本人帳號（從 allAccounts 轉成顯示資料）
const myAccountTargets = computed(() =>
  (allAccounts.value || []).map((a) => ({
    key: `mine-${a.accountId}`,
    accountName: a.accountName,
    bankCode: MY_BANK_CODE,
    bankName: MY_BANK_NAME,
    accountId: String(a.accountId),
  }))
);

// 依目前標籤決定資料來源
const targetList = computed(() =>
  targetTab.value === "recent" ? recentTargets.value : myAccountTargets.value
);

// 搜尋過濾
const filteredTargets = computed(() => {
  const q = (targetSearch.value || "").trim();
  if (!q) return targetList.value;
  return targetList.value.filter(
    (x) =>
      (x.accountName && x.accountName.includes(q)) ||
      (x.bankName && x.bankName.includes(q)) ||
      (x.accountId && String(x.accountId).includes(q))
  );
});

// 選擇後回填到 form 並關閉
function selectTarget(item) {
  form.value.toBankCode = item.bankCode;
  form.value.toAccountId = item.accountId;

  // 若 bankCodeOptions 尚未包含該銀行，可動態補上，讓下拉顯示正常
  if (!bankCodeOptions.value.some((b) => b.code === item.bankCode)) {
    bankCodeOptions.value.push({
      code: item.bankCode,
      label: `${item.bankCode}｜${item.bankName || ""}`,
      name: item.bankName || "",
    });
  }

  onTransferAccountsDialog.value = false;
}

// 開啟 Dialog（可指定預設分頁）
function openSelectTarget(which = "recent") {
  targetTab.value = which; // 'recent' 或 'mine'
  onTransferAccountsDialog.value = true;
}

// 最近轉帳清單
const recentTargets = ref([]);

// 從後端撈最近轉帳紀錄
const fetchRecentTargets = async (fromAccountId = form.value.accountId) => {
  const acct = String(fromAccountId || "").trim();
  if (!acct) return;

  try {
    const res = await request({
      url: `/account/transaction/getrecenttoaccountid`,
      method: "GET",
      params: { accountId: acct },
    });

    const list = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : [];

    recentTargets.value = list.map((x, i) => {
      // 可能是字串（只回 toAccountId），也可能是物件
      const toAccountId =
        typeof x === "string" ? x : x.toAccountId ?? x.accountId ?? "";

      // 盡可能帶用後端回來的銀行代碼，沒有就預設本行 018
      const toBankCode =
        typeof x === "object"
          ? x.toBankCode ?? x.bankCode ?? MY_BANK_CODE
          : MY_BANK_CODE;

      // 銀行名稱優先用後端，否則用本地碼表對應，最後空字串
      const toBankName =
        (typeof x === "object" && x.toBankName) ||
        bankCodeOptions.value.find((b) => b.code === toBankCode)?.name ||
        (toBankCode === MY_BANK_CODE ? MY_BANK_NAME : "");

      return {
        key: `r-${i}`,
        accountName: "", // ← 規格：名稱固定空字串
        bankCode: toBankCode,
        bankName: toBankName,
        accountId: String(toAccountId),
      };
    });
  } catch (e) {
    console.error("取得最近轉帳失敗", e);
    recentTargets.value = [];
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

.w-100 {
  width: 100%;
}
.min-w-0 {
  min-width: 0;
} /* 讓左側可收縮，避免把右側擠掉 */

.wrap {
  white-space: normal;
  word-break: break-all;
}

.selectable-item {
  cursor: pointer;
} /* 整格可點 */
:deep(.v-list-item) {
  min-height: 88px;
} /* 每格高一點，讀性更好 */

/* 右側帳號區塊 */
.acc-no {
  text-align: right;
  margin-left: 12px;
  min-width: 180px; /* 可依字數調整 */
}
.acc-no-label {
  font-size: 15px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 6px;
}
.acc-no-text {
  font-size: 20px; /* 大一點 */
  font-weight: 700; /* 粗體 */
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace; /* 等寬更好讀 */
  white-space: normal;
  word-break: break-all; /* 需要時換行，但仍靠右 */
}

/* 標題列固定在頂部，背景不透明，避免被內容蓋住 */
.card-title-sticky {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--v-theme-surface); /* 或 #fff */
  min-height: 56px; /* 固定高度，切換時不跳動 */
  padding-right: 12px; /* 給右邊一點空間 */
}

/* 切換鈕靠右但離邊緣有點距離 */
.toggle-right {
  margin-right: 4px;
}

/* 內容改在這裡捲動，避免把標題列捲走 */
.list-scroll {
  max-height: 420px; /* 依你的對話框高度調整 */
  overflow-y: auto;
}
</style>
