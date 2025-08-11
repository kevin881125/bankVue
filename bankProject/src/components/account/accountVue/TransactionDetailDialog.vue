<template>
  <v-dialog v-model="internalShow" max-width="1200px" persistent>
    <v-card>
      <!-- 日期篩選＋快速查詢 -->
      <v-card-text class="pb-0">
        <v-row align="center" class="mb-1">
          <v-col cols="auto" class="account-info"
            ><strong>查詢日期</strong></v-col
          >
          <v-date-input
            v-model="dateRange"
            multiple="range"
            :max="maxDate"
            label="選擇日期區間"
            prepend-icon="mdi-calendar"
            :close-on-content-click="false"
            :hide-actions="false"
          />

          <v-col cols="auto">
            <v-btn size="small" variant="text" @click="setToday">本日</v-btn>
            <v-divider vertical class="mx-2" />
            <v-btn size="small" variant="text" @click="setLast7Days"
              >最近一週</v-btn
            >
            <v-divider vertical class="mx-2" />
            <v-btn size="small" variant="text" @click="setThisMonth"
              >本月</v-btn
            >
            <v-divider vertical class="mx-2" />
            <v-btn size="small" variant="text" @click="setLastMonth"
              >上月</v-btn
            >
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="onSearch">查詢</v-btn>
          </v-col>
        </v-row>
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
          <v-btn icon @click="internalShow = false" title="關閉">
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
    url: "/account/transaction/gettransactionsrecords",
    method: "GET",
    params: {
      accountId: props.selectedAccount?.accountId,
      startDate,
      endDate,
    },
  });

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
</script>

<style scoped></style>
