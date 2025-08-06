<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- 查詢區 -->
        <v-row>
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
              v-model="search"
              label="姓名搜尋"
              append-inner-icon="mdi-magnify"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn @click="fetchAccounts" variant="plain">查詢</v-btn>
          </v-col>
        </v-row>

        <!-- 資料表 -->
        <v-data-table :headers="headers" :items="filteredAccounts">
          <template v-slot:filteredAccounts.balance> </template>
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
