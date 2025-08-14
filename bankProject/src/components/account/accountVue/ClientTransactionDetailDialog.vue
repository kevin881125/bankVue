<template>
  <v-dialog v-model="internalShow" max-width="1200px" persistent>
    <!-- 目前查詢日期後端還沒測試  getTransactionsRecords()  startDate, endDate-->
    <v-card>
      <!-- 關閉按鈕（放在 v-card 裡，但絕對定位） -->
      <v-btn icon @click="internalShow = false" title="關閉" class="close-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- 日期篩選＋快速查詢 -->
      <v-card-text class="pb-0">
        <v-container fluid class="search-container">
          <v-row justify="center" align="center" class="date-row">
            <v-col cols="auto" class="label"><strong>查詢日期</strong></v-col>
            <v-date-input
              v-model="dateRange"
              multiple="range"
              :max="maxDate"
              label="選擇日期區間"
              prepend-icon="mdi-calendar"
              :close-on-content-click="false"
              :hide-actions="false"
              min-width="auto"
            />
            <v-col cols="auto">
              <v-btn color="primary" class="search-action" @click="onSearch"
                >查詢</v-btn
              >
            </v-col>
          </v-row>

          <!-- 提示文字 -->
          <v-row class="hint-row">
            <v-col class="hint-text">
              依「交易日」排序提供近一年往來明細，每次查詢區間最多三個月。
            </v-col>
          </v-row>

          <!-- 快速查詢 -->
          <v-row justify="center" align="center" class="mb-3">
            <v-col cols="auto" class="search-title"> 快速查詢 </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn text small class="search-btn" @click="setToday"
                >本日</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setLast7Days"
                >最近一週</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setThisMonth"
                >本月</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setLastMonth"
                >上月</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <!-- 帳戶資訊 -->
      <v-card-title class="account-info-bar">
        <v-row no-gutters align="center" class="w-100">
          <v-col cols="auto" class="account-info">
            <strong>帳戶：</strong>
            {{ props.selectedAccount?.accountId || "XXXX" }}
            {{ props.selectedAccount?.accountName || "" }}
          </v-col>
          <v-col cols="auto" class="account-info ml-4">
            <strong>幣別：</strong>
            {{ props.selectedAccount?.currency || "XX" }}
          </v-col>
          <v-col cols="auto" class="account-info ml-4">
            <strong>筆數：</strong>
            {{ transactionsList.length }} 筆
          </v-col>
          <v-spacer></v-spacer>
        </v-row>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="transactionsList"
          :items-per-page="5"
          class="my-data-table"
          density="compact"
        >
          <template #item.amount="{ item }">
            {{ item.currency }} {{ Number(item.amount).toLocaleString() }}
          </template>
          <template #item.balanceAfter="{ item }">
            {{ item.currency }} {{ Number(item.balanceAfter).toLocaleString() }}
          </template>
          <template #item.txTime="{ item }">
            {{ formatDateTime(item.txTime) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed, nextTick } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { formatDateOnly, formatDateTime } from "@/utils/DataUtil";
import { VDateInput } from "vuetify/labs/VDateInput";

/** ========= Props / Emits / Dialog 同步 ========= **/
const props = defineProps({
  show: Boolean,
  selectedAccount: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:show"]);
const internalShow = ref(props.show);

watch(
  () => props.show,
  (val) => (internalShow.value = val)
);

watch(internalShow, (val) => {
  emit("update:show", val);
  if (val) getTransactionsRecords();
});

const headers = [
  { title: "交易編號", key: "transactionId", value: "transactionId" },
  { title: "交易日期", key: "txTime", value: "txTime" },
  { title: "交易類型", key: "transactionType", value: "transactionType" },
  { title: "交易金額", key: "amount", value: "amount" },
  { title: "餘額", key: "balanceAfter", value: "balanceAfter" },
  { title: "交易資訊", key: "info", value: "info" },
  { title: "交易結果", key: "status", value: "status" },
  { title: "備註", key: "memo", value: "memo" },
];

/** ========= 日期篩選（v-date-input） ========= **/
type DateLike = string | Date | undefined;
const dateRange = ref<DateLike[]>([]); // 會是 [start, end]

// helper：建立不含時間的 Date（避免時區偏移）
const d = (y: number, m: number, day: number) => new Date(y, m, day);

// 今天 （作為max）
const now = new Date();
const maxDate = formatDateOnly(now);

// 快速查詢
const setToday = () => {
  const today = d(now.getFullYear(), now.getMonth(), now.getDate());
  dateRange.value = [today, today];
};
const setLast7Days = () => {
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  const start = d(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  dateRange.value = [start, end];
};
const setThisMonth = () => {
  const start = d(now.getFullYear(), now.getMonth(), 1);
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  dateRange.value = [start, end];
};
const setLastMonth = () => {
  const start = d(now.getFullYear(), now.getMonth() - 1, 1);
  const end = d(now.getFullYear(), now.getMonth(), 0);
  dateRange.value = [start, end];
};

// 取 yyyy-MM-dd 的起訖字串
const getStartEnd = (): [string | null, string | null] => {
  if (!dateRange.value.length) return [null, null];

  const start = dateRange.value[0];
  const end = dateRange.value[dateRange.value.length - 1];

  const toYmd = (v: DateLike) =>
    typeof v === "string" ? v.slice(0, 10) : formatDateOnly(v as Date);

  return [toYmd(start), toYmd(end)];
};

// 三個月內檢查（粗抓 31*3 天）
function within3Months() {
  const [s, e] = getStartEnd();
  if (!s || !e) return true;
  const ms = (x: string) => new Date(x + "T00:00:00").getTime();
  const diff = ms(e) - ms(s);
  return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 31 * 3;
}

const onSearch = () => {
  if (!within3Months()) {
    alert("查詢區間不可超過三個月");
    return;
  }
  getTransactionsRecords();
};

// 查詢交易明細
const transactionsList = ref([]);

const getTransactionsRecords = async () => {
  const [startDate, endDate] = getStartEnd();
  const res = await request({
    url: "/account/transaction/getsuccesstxrecords",
    method: "GET",
    params: {
      accountId: props.selectedAccount?.accountId,
      startDate,
      endDate,
    },
  });

  transactionsList.value = (res.data || []).map((tx: any) => ({
    ...tx,
    info: `${tx.toBankCode || ""}-${tx.toAccountId || ""}`,
  }));
};

watch(
  dateRange,
  (val) => {
    console.log("dateRange changed:", JSON.stringify(val));
  },
  { deep: true }
);
</script>

<style scoped>
/* 查詢區背景與整體設定 */
.search-container {
  background-color: #f5f5f5;
  border-radius: 16px; /* 邊角更圓 */
  padding: 16px 12px;
  text-align: center;
}

/* 查詢日期 label */
.label {
  font-size: 16px;
}

/* 日期輸入框 */
.date-input {
  width: 130px;
  font-size: 16px;
}

/* 查詢按鈕 */
.search-action {
  font-size: 16px;
  font-weight: bold;
}

/* 日期選擇列與提示文字距離縮小 */
.date-row {
  margin-bottom: 4px;
  padding: 30px 10px 0px 10px;
}

.hint-row {
  margin-top: 0px;
}

.hint-text {
  color: rgba(255, 0, 0, 0.753);
  font-size: 14px;
  text-align: center;
}

/* 快速查詢 */
.search-title {
  font-size: 16px;
}

.search-btn {
  font-size: 16px;
  min-width: 60px;
}

/* 帳戶資訊列 */
.account-info-bar {
  padding: 6px 30px;
}

.account-info {
  font-size: 15px; /* 比查詢區略小 */
}

/* 表格標題建議把 >>> 改為 :deep()（Vite/Vue3 正式語法） */
:deep(.v-data-table-header th) {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

/* 表格內容 */
:deep(.v-data-table__td) {
  font-size: 15px;
  vertical-align: middle;
  padding-top: 10px;
  padding-bottom: 10px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
</style>
