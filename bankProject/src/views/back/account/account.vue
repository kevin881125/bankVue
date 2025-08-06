<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- 查詢區 -->
        <v-row>
          <v-col cols="12" sm="1">搜尋:</v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model="filters.mId" label="客戶編號"></v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field
              v-model="filters.mIdentity"
              label="身份證字號"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field v-model="filters.mPhone" label="電話"></v-text-field>
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
          <v-col cols="12" sm="1" class="d-flex align-center">
            <v-btn
              @click="fetchAccounts"
              variant="plain"
              size="large"
              class="px-6"
              prepend-icon="mdi-magnify"
              >查詢</v-btn
            >
          </v-col>
        </v-row>

        <!-- 資料表 -->
        <v-data-table :headers="headers" :items="filteredAccounts">
          <template v-slot:item.balance="{ item }">
            {{ item.currency }} {{ item.balance.toLocaleString() }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex" style="gap: 10px">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small">
                    <v-icon> mdi-hand-coin-outline</v-icon>
                  </v-btn>
                </template>
                <span>交易</span>
              </v-tooltip>
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small">
                    <v-icon> mdi-receipt-text-outline</v-icon>
                  </v-btn>
                </template>
                <span>交易明細</span>
              </v-tooltip>
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="small">
                    <v-icon>mdi-account-edit-outline</v-icon>
                  </v-btn>
                </template>
                <span>修改狀態</span>
              </v-tooltip location="top">
             
            </div>
          </template>
        </v-data-table>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, watch } from "vue";

const search = ref("");
const filteredAccounts = ref([]);

const fetchAccounts = async () => {
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

  console.log(filteredAccounts.value);
};

const filters = ref({
  mId: "",
  mIdentity: "",
  mPhone: "",
  accountId: "",
  mName: "",
});

const headers = [
  { title: "客戶編號", key: "mId" },
  { title: "客戶姓名", key: "member.mName" },
  { title: "身份證字號", key: "member.mIdentity" },
  { title: "帳戶號碼", key: "accountId" },
  { title: "帳戶名稱", key: "accountName" },
  { title: "餘額", key: "balance" },
  { title: "操作", key: "actions", sortable: false },
];
</script>
