<template>
  <v-dialog v-model="internalShow" max-width="1200px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <div>
            <strong>帳戶：</strong>
            {{ props.selectedAccount?.accountId || "XXXX" }}
            {{ props.selectedAccount?.accountName || "" }}
          </div>
          <div>
            <strong>幣別：</strong>
            {{ props.selectedAccount?.currency || "XX" }}
          </div>
          <div><strong>筆數：</strong> {{ 2 }} 筆</div>
        </div>
        <v-btn icon @click="internalShow = false" title="關閉">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="transactionsList"
          :items-per-page="5"
          class="my-data-table"
          dense
        >
          <template v-slot:item.amount="{ item }">
            {{ item.currency }} {{ Number(item.amount).toLocaleString() }}
          </template>
          <template v-slot:item.balanceAfter="{ item }">
            {{ item.currency }} {{ Number(item.balanceAfter).toLocaleString() }}
          </template>

          <template v-slot:item.txTime="{ item }">
            {{ formatDateTime(item.txTime) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { formatDateTime } from "@/utils/DataUtil";

const props = defineProps({
  show: Boolean,
  selectedAccount: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["update:show"]);

const internalShow = ref(props.show);

watch(
  () => props.show,
  (val) => {
    internalShow.value = val;
  }
);

watch(internalShow, (val) => {
  emit("update:show", val);
  if (val) {
    getTransactionsRecords();
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

// 查詢交易明細
const transactionsList = ref([]);

const getTransactionsRecords = async () => {
  transactionsList.value = (
    await request({
      url: "/account/transaction/gettransactionsrecords",
      method: "GET",
      params: { accountId: props.selectedAccount?.accountId },
    })
  ).map((tx) => ({
    ...tx,
    info: `${tx.toBankCode || ""}-${tx.toAccountId || ""}`,
  }));
  console.log(props.selectedAccount?.accountId);

  console.log(transactionsList.value);
};
</script>

<style scoped>
.my-data-table >>> .v-data-table-header th {
  font-size: 18px;
  font-weight: bold;
}

.my-data-table >>> .v-data-table__td {
  font-size: 15px;
  vertical-align: middle;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
