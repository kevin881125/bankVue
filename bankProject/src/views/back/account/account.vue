<template>
  <v-app>
    <v-main>
      <v-sheet color="surface" class="pa-6 min-h">
        <v-container style="max-width: 1500px; margin: auto">
          <!-- 查詢區 -->
          <v-row class="search-area">
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.mId"
                label="客戶編號"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.mIdentity"
                label="身份證字號"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.mPhone"
                label="電話"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.accountId"
                label="帳戶號碼"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="2">
              <v-text-field
                v-model="filters.mName"
                label="姓名搜尋"
              ></v-text-field>
            </v-col>

            <!-- 查詢按鈕 -->
            <v-col
              cols="12"
              sm="2"
              class="d-flex justify-space-between align-center"
            >
              <v-btn
                @click="fetchAccounts"
                variant="plain"
                size="large"
                class="px-6"
                prepend-icon="mdi-magnify"
              >
                查詢
              </v-btn>

              <!-- 新增帳戶 -->
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="large"
                    @click="addDialog = true"
                  >
                    <v-icon>mdi-account-edit-outline</v-icon>
                  </v-btn>
                  <!-- 新增 Dialog -->
                  <insert-account-dialog
                    v-model:show="addDialog"
                    @added="fetchAllAccounts"
                  ></insert-account-dialog>
                </template>
                <span>新增帳戶</span>
              </v-tooltip>
              <!-- 人工凍結檢查 -->
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="large"
                    @click="openCheckDialog"
                  >
                    <v-icon>mdi-account-sync-outline</v-icon>
                  </v-btn>
                </template>
                <span>人工凍結檢查</span>
              </v-tooltip>
            </v-col>
          </v-row>

          <!-- 資料表 -->

          <v-data-table
            :headers="headers"
            :items="filteredAccounts"
            :items-per-page="5"
            :items-per-page-options="[5, 10, 20]"
            item-value="accountId"
            show-expand
            class="my-data-table"
          >
            <template v-slot:item.balance="{ item }">
              {{ item.currency }} {{ item.balance.toLocaleString() }}
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="statusColor(item.status)"
                text-color="white"
                size="large"
                label
                :prepend-icon="statusIcon(item.status)"
              >
                {{ item.status }}</v-chip
              >
            </template>
            <!--        展開列：直接顯示資訊           -->
            <template #expanded-row="{ columns, item }">
              <td :colspan="columns.length" class="pa-4">
                <div class="expand-block rounded-lg">
                  <!-- 區塊標題 -->
                  <div
                    class="text-subtitle-1 font-weight-medium d-flex align-center mb-3"
                  >
                    <v-icon class="mr-2">mdi-information-outline</v-icon>
                    帳戶詳細
                  </div>

                  <!-- 第一排：帳戶摘要 -->
                  <v-row dense class="mb-2 member-info">
                    <v-col cols="12" md="3"
                      >帳號最後交易日：{{
                        item.lastTransactionDate || "—"
                      }}</v-col
                    >
                    <v-col cols="12" md="3"
                      >狀態更改備註：{{ item.memo || "—" }}</v-col
                    >
                    <v-col cols="12" md="3"
                      >操作人員編號：{{ item.operatorId ?? "—" }}</v-col
                    >
                    <v-col cols="12" md="3"
                      >更改狀態時間：{{
                        fmtDateTime(item.statusUpdatedTime)
                      }}</v-col
                    >
                  </v-row>

                  <v-divider class="my-3" />

                  <!-- 會員資訊（需要身分比對時顯示） -->
                  <template v-if="item.member">
                    <div class="d-flex align-center mb-3">
                      <span
                        class="text-subtitle-1 font-weight-medium d-flex align-center"
                      >
                        <v-icon class="mr-2">mdi-account-box</v-icon>
                        會員資訊
                      </span>
                      <span class="text-caption text-medium-emphasis ml-4">
                        ※ 請先核對以下資訊是否正確
                      </span>
                    </div>
                    <v-row dense class="member-info">
                      <v-col cols="12" md="2"
                        >性別： {{ item.member.mGender ?? "—" }}</v-col
                      >
                      <v-col cols="12" md="2"
                        >電話：{{ item.member.mPhone ?? "—" }}</v-col
                      >
                      <v-col cols="12" md="2"
                        >生日：{{ fmtDate(item.member.mBirthday) }}</v-col
                      >
                      <v-col cols="12" md="3"
                        >信箱：{{ item.member.mEmail ?? "—" }}</v-col
                      >
                      <v-col cols="12" md="3"
                        >地址：{{ item.member.mAddress ?? "—" }}</v-col
                      >
                    </v-row>
                  </template>
                </div>
              </td>
            </template>

            <!--          action 列 按鈕           -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex" style="gap: 10px">
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="large"
                      @click="openTradeDiolog(item)"
                      :disabled="disableTrade(item.status)"
                      color="indigo-darken-2"
                    >
                      <v-icon> mdi-hand-coin-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>交易</span>
                </v-tooltip>

                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="large"
                      @click="openDetailDialog(item)"
                      color="blue-grey-darken-1"
                    >
                      <v-icon> mdi-receipt-text-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>交易明細</span>
                </v-tooltip>

                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="large"
                      @click="openUpdateDialog(item)"
                      color="orange-darken-2"
                    >
                      <v-icon>mdi-account-edit-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>修改狀態</span>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>

          <update-account-dialog
            v-model:show="updateDialog"
            :selected-account="selectedAccount"
            :update-form="updateForm"
            @submit-update-status="submitUpdateStatus"
          >
          </update-account-dialog>

          <transaction-detail-dialog
            v-model:show="detailDialog"
            :selected-account="selectedAccount"
          ></transaction-detail-dialog>

          <trade-account-dialog
            v-model:show="tradeDialog"
            :selected-account="selectedAccount"
            @tx-success="onTxSuccess"
          ></trade-account-dialog>
        </v-container>
      </v-sheet>
    </v-main>
  </v-app>

  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>

  <SuccessMessage
    :visible="showSuccess"
    :successMessage="successMsg"
    @cancel="showSuccess = false"
  ></SuccessMessage>
</template>

<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref } from "vue";
import { useWorkerStore } from "@/stores/Worker";
import InsertAccountDialog from "@/components/account/accountVue/InsertAccountDialog.vue";
import UpdateAccountDialog from "@/components/account/accountVue/UpdateAccountDialog.vue";
import TransactionDetailDialog from "@/components/account/accountVue/TransactionDetailDialog.vue";
import TradeAccountDialog from "@/components/account/accountVue/TradeAccountDialog.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SuccessMessage from "@/components/SuccessMessage.vue";

const addDialog = ref(false);
const tradeDialog = ref(false);
const updateDialog = ref(false);
const detailDialog = ref(false);
const filteredAccounts = ref([]);
const selectedAccount = ref(null);
const workerStore = useWorkerStore();
const workerId = workerStore.wId; // 操作行員ID
const showError = ref(false);
const errorMsg = ref("");
const showSuccess = ref(false);
const successMsg = ref("");

// 搜尋欄位
const fetchAccounts = async () => {
  /**
   * 確認有至少一個欄位填寫**** 不然會報錯 ！
   * Object.values() 會把物件的所有值取出，變成陣列
   * .every() 是陣列方法，會對陣列每一個元素跑判斷
   * val 是陣列裡的每一個欄位值
   */
  const isAllEmpty = Object.values(filters.value).every(
    (val) => !val || val.trim() === ""
  );

  if (isAllEmpty) {
    console.log("查詢條件為空，略過查詢");
    return;
  }

  const requestBody = {
    mId: filters.value.mId || null,
    accountId: filters.value.accountId || null,
    member: {
      mIdentity: filters.value.mIdentity || null,
      mPhone: filters.value.mPhone || null,
      mName: filters.value.mName || null,
    },
  };

  filteredAccounts.value = await request({
    url: "/account/searchaccount",
    method: "POST",
    data: requestBody,
    headers: { "Content-Type": "application/json" },
  });
  console.log("查詢結果：", filteredAccounts.value);
};

const filters = ref({
  mId: "",
  mIdentity: "",
  mPhone: "",
  accountId: "",
  mName: "",
});

// 搜尋全部帳戶
const fetchAllAccounts = async () => {
  const requestBody = {
    mId: null,
    accountId: null,
    member: {
      mIdentity: null,
      mPhone: null,
      mName: null,
    },
  };

  filteredAccounts.value = await request({
    url: "/account/searchallaccount",
    method: "POST",
    data: requestBody,
    headers: { "Content-Type": "application/json" },
  });
};

// table 抬頭
const headers = [
  { title: "客戶編號", key: "mId" },
  { title: "客戶姓名", key: "member.mName" },
  { title: "身份證字號", key: "member.mIdentity" },
  { title: "帳戶號碼", key: "accountId" },
  { title: "帳戶名稱", key: "accountName" },
  { title: "餘額", key: "balance" },
  { title: "狀態", key: "status", sortable: false },
  { title: "操作", key: "actions", sortable: false },
];

// 狀態顏色
const statusColor = (s) => {
  switch (s) {
    case "啟用":
      return "blue-darken-2";
    case "凍結":
      return "red-darken-2";
    case "限制":
      return "green-darken-2";
    default:
      return "grey";
  }
};

// 狀態圖示
const statusIcon = (s) => {
  switch (s) {
    case "啟用":
      return "mdi-check-circle-outline";
    case "凍結":
      return "mdi-lock-outline";
    case "限制":
      return "mdi-alert-circle-outline";
    default:
      return "mdi-help-circle-outline";
  }
};

// 限制 狀態 無法交易
const disableTrade = (s) => {
  return s === "凍結";
};

// 交易 dialog
const openTradeDiolog = (item) => {
  selectedAccount.value = item;
  tradeDialog.value = true;
};

// 帳戶明細dialog
const openDetailDialog = (item) => {
  selectedAccount.value = item;
  detailDialog.value = true;
};

// 修改帳戶狀態
const updateForm = ref({
  status: "",
  memo: " ",
  operatorId: "",
  accountId: "",
});

const openUpdateDialog = (item) => {
  selectedAccount.value = item;
  updateForm.value.status = item.status || "";
  updateForm.value.operatorId = workerId;
  updateForm.value.accountId = item.accountId;
  updateDialog.value = true;
  updateForm.value.memo = "";
};

const submitUpdateStatus = async () => {
  if (updateForm.value.status === selectedAccount.value.status) {
    errorMsg.value = "請修改狀態";
    showError.value = true;
    return;
  }

  // memo是null的話 => false 是空白的話.trim() => ""空白刪掉 => 沒有東西所以是false
  if (!updateForm.value.memo?.trim()) {
    errorMsg.value = "請填寫修改狀態原因";
    showError.value = true;
    return;
  }
  console.log(updateForm);

  const updateRS = await request({
    url: "/account/update",
    method: "PUT",
    data: updateForm.value,
    headers: { "Content-Type": "application/json" },
  });

  successMsg.value = "修改狀態成功";
  showSuccess.value = true;

  updateDialog.value = false;
  fetchAccounts();
};

const onTxSuccess = async () => {
  // 判斷是否有任何查詢條件（至少一個非空白）
  const hasFilters = Object.values(filters.value).some(
    (v) => v && v.trim && v.trim() !== ""
  );

  if (hasFilters) {
    await fetchAccounts(); // 用使用者的條件重撈
  } else if (selectedAccount.value?.accountId) {
    // 沒條件 → 至少用目前選中的帳號精準更新
    const req = {
      mId: null,
      accountId: selectedAccount.value.accountId,
      member: { mIdentity: null, mPhone: null, mName: null },
    };
    const res = await request({
      url: "/account/searchaccount",
      method: "POST",
      data: req,
      headers: { "Content-Type": "application/json" },
    });
    const list = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : [];
    const updated = list[0];

    if (updated) {
      // 就地替換表格中的那一筆
      const idx = filteredAccounts.value.findIndex(
        (a) => String(a.accountId) === String(updated.accountId)
      );
      if (idx >= 0) filteredAccounts.value.splice(idx, 1, updated);
      // 同步 selectedAccount（避免顯示舊餘額）
      selectedAccount.value = updated;
    }
  } else {
    // 最後手段：全撈
    await fetchAllAccounts();
  }
};
const fmtDate = (d) => (d ? String(d).slice(0, 10) : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");
</script>

<style scoped>
.min-h {
  min-height: 100vh;
} /* 覆蓋整個視窗高度，底色不會露灰 */

.my-data-table >>> .v-data-table-header th {
  font-size: 20px; /* header 字體 */
  font-weight: bold;
}

.my-data-table >>> .v-data-table__td {
  font-size: 17px; /* 內文字體 */
  font-weight: normal; /* 不要粗體 */
  vertical-align: middle; /* 垂直置中 */
  padding-top: 12px;
  padding-bottom: 12px; /* 上下間距 */
}
.my-data-table {
  margin-top: 20px;
}
.search-area {
  margin-top: 20px;
}
:deep(.v-data-table__tr--expanded td) {
  background: transparent !important;
  padding: 0 !important;
}
.expand-block {
  background: transparent; /* 要卡片感可換成 rgb(var(--v-theme-surface)) */
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.member-info {
  /*color: #555;  深灰 */
  color: #888; /* <-- 淺灰 */
}
</style>
