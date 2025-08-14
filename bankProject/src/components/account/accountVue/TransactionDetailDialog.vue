<template>
  <v-dialog v-model="internalShow" max-width="1380px" persistent>
    <!-- 目前查詢日期後端還沒測試 -->
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
              <v-btn
                color="primary"
                class="search-action"
                @click="getTransactionsRecords"
                >查詢</v-btn
              >
            </v-col>
          </v-row>

          <!-- 快速查詢 -->
          <v-row justify="center" align="center" class="mb-3">
            <v-col cols="auto" class="search-title"> 快速查詢 </v-col>
            <v-col cols="auto" class="text-center">
              <v-btn text small class="search-btn" @click="setLast3Months"
                >三個月</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setLast6Months"
                >半年</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setLast1Year"
                >一年</v-btn
              >
              <v-divider vertical class="mx-2" />
              <v-btn text small class="search-btn" @click="setLast2Years"
                >兩年</v-btn
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
          <v-col cols="auto">
            <v-btn
              color="indigo-darken-2"
              class="search-action"
              variant="outlined"
              @click="downloadJSON"
              >匯出JSON檔</v-btn
            >
          </v-col>
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
import { ref, watch, defineProps, defineEmits } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { formatDateOnly, formatDateTime } from "@/utils/DataUtil";
import { VDateInput } from "vuetify/labs/VDateInput";
import type { AxiosResponse } from "axios";

// 型別守衛：判斷物件是否為 AxiosResponse
// 安全拆箱：把不確定型別的 res 變成真正的 Blob
function toBlob(res: unknown): Blob {
  if (res instanceof Blob) return res; // 已是 Blob
  if (res && typeof res === "object") {
    const maybe = res as Partial<AxiosResponse<any>>;
    if ("data" in maybe && maybe!.data instanceof Blob) {
      return maybe!.data as Blob; // AxiosResponse<Blob>
    }
  }
  if (res instanceof ArrayBuffer) return new Blob([res]); //（保險）若是 ArrayBuffer
  throw new Error("Response is not a Blob");
}

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
  if (val) {
    getTransactionsRecords();
  } else {
    dateRange.value = [];
  }
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
  { title: "操作人員", key: "operatorId", value: "operatorId" },
];

/** ========= 日期篩選（v-date-input） ========= **/
type DateLike = string | Date | undefined;
const dateRange = ref<DateLike[]>([]); // 會是 [start, end]

// helper：建立不含時間的 Date（避免時區偏移）
const d = (y: number, m: number, day: number) => new Date(y, m, day);

// 今天 （作為max）
const now = new Date();
const maxDate = formatDateOnly(now);

// 三個月
const setLast3Months = () => {
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  const start = d(now.getFullYear(), now.getMonth() - 3, now.getDate());
  dateRange.value = [start, end];
};

// 半年
const setLast6Months = () => {
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  const start = d(now.getFullYear(), now.getMonth() - 6, now.getDate());
  dateRange.value = [start, end];
};

// 一年
const setLast1Year = () => {
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  const start = d(now.getFullYear() - 1, now.getMonth(), now.getDate());
  dateRange.value = [start, end];
};

// 兩年
const setLast2Years = () => {
  const end = d(now.getFullYear(), now.getMonth(), now.getDate());
  const start = d(now.getFullYear() - 2, now.getMonth(), now.getDate());
  dateRange.value = [start, end];
};

// 取 yyyy-MM-dd 的起訖字串
const getStartEnd = (): [string | null, string | null] => {
  if (!dateRange.value.length) return [null, null];

  const start = dateRange.value[0];
  const end = dateRange.value[dateRange.value.length - 1];

  const toYmd = (v: DateLike) =>
    typeof v === "string" ? v.slice(0, 10) : formatDateOnly(v as Date);
  console.log(toYmd(start));

  return [toYmd(start), toYmd(end)];
};

// 查詢交易明細
const transactionsList = ref([]);

const getTransactionsRecords = async () => {
  const [startDate, endDate] = getStartEnd();
  const res = await request({
    url: "/account/transaction/gettransactionsrecords",
    method: "GET",
    params: {
      accountId: props.selectedAccount?.accountId,
      startDate,
      endDate,
    },
  });

  console.log(res);

  transactionsList.value = res.map((tx: any) => ({
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

// 輸出JSON檔
const downloadJSON = async () => {
  const [startDate, endDate] = getStartEnd();
  const res = await request({
    url: "/account/transaction/exportjson",
    method: "GET",
    params: {
      accountId: props.selectedAccount?.accountId,
      startDate,
      endDate,
      type: "worker",
    },
    responseType: "blob",
  });

  const blob = toBlob(res); // ← 安全取得 Blob
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const acc = props.selectedAccount?.accountId ?? "ACCOUNT";
  a.href = url;
  a.download = `交易紀錄_${acc}_${startDate ?? "NA"}_${endDate ?? "NA"}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
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
