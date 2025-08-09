<template>
  <v-app>
    <v-main >
      <v-container style="max-width: 1500px; margin: auto">
        <!-- 查詢區 -->
        <v-row class="search-area">
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
          
          <!-- 查詢按鈕 -->
          <v-col cols="12" sm="2" class="d-flex justify-space-between align-center">
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
                  <v-btn v-bind="props" icon size="large" @click="addDialog = true">
                    <v-icon>mdi-account-edit-outline</v-icon>
                  </v-btn>
                  <!-- 新增 Dialog -->
                  <insert-account-dialog  v-model:show="addDialog" @added="fetchAllAccounts"></insert-account-dialog>
                </template>
                <span>新增帳戶</span>
              </v-tooltip>
              <!-- 人工凍結檢查 -->
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="large" @click="openCheckDialog">
                    <v-icon>mdi-account-sync-outline</v-icon>
                  </v-btn>
                </template>
                <span>人工凍結檢查</span>
              </v-tooltip>


          </v-col>
        </v-row>

        <!-- 資料表 -->
        
        <v-data-table :headers="headers" :items="filteredAccounts" :items-per-page="5" :items-per-page-options="[5, 10, 20]" class="my-data-table" >
          <template v-slot:item.balance="{ item }">
            {{ item.currency }} {{ item.balance.toLocaleString() }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex" style="gap: 10px">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="large" @click="tradeDialog = true">
                    <v-icon> mdi-hand-coin-outline</v-icon>
                  </v-btn>
                </template>
                <span>交易</span>
              </v-tooltip>

              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="large" @click="openDetailDialog(item)">
                    <v-icon> mdi-receipt-text-outline</v-icon>
                  </v-btn>
                </template>
                <span>交易明細</span>
              </v-tooltip>
              <trade-account-dialog v-model:show="detailDialog"
              :selected-account="selectedAccount" ></trade-account-dialog>
              
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon size="large" @click="openUpdateDialog(item)">
                    <v-icon>mdi-account-edit-outline</v-icon>
                  </v-btn>
                </template>
                <span>修改狀態</span>
              </v-tooltip location="top">
              <update-account-dialog v-model:show="updateDialog"
              :selected-account="selectedAccount"
              :update-form="updateForm"
              @submit-update-status="submitUpdateStatus"></update-account-dialog>
             
            </div>
          </template>
        </v-data-table>

        



        <!-- 交易 tradeDialog -->
        <v-dialog v-model="tradeDialog" width="500">
          <v-card>
            <v-card-title>交易</v-card-title>
            <v-card-text>這裡放交易功能</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="tradeDialog = false">關閉</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
       
        <!-- 修改 updateDialog -->
       

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, watch } from "vue";
import { useWorkerStore } from "@/stores/Worker";
import InsertAccountDialog from "@/components/account/accountVue/insertAccountDialog.vue";
import UpdateAccountDialog from "@/components/account/accountVue/updateAccountDialog.vue";
import TradeAccountDialog from "@/components/account/accountVue/transactionDetailDialog.vue";

const addDialog = ref(false);
const tradeDialog = ref(false);
const updateDialog = ref(false);
const detailDialog = ref(false);
const filteredAccounts = ref([]);
const selectedAccount = ref(null);
const workerStore = useWorkerStore();
const workerId = workerStore.wId; // 操作行員ID

// 搜尋欄位
const fetchAccounts = async () => {
 
  /**
   * 確認有至少一個欄位填寫**** 不然會報錯 ！
   * Object.values() 會把物件的所有值取出，變成陣列
   * .every() 是陣列方法，會對陣列每一個元素跑判斷
   * val 是陣列裡的每一個欄位值
   */
  const isAllEmpty = Object.values(filters.value).every(val => !val || val.trim() === "");

  if ( isAllEmpty ) {
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

  console.log(filteredAccounts.value);
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
  { title: "狀態", key: "status"},
  { title: "操作", key: "actions", sortable: false },
];

// 帳戶明細dialog
const openDetailDialog = (item) => {
  selectedAccount.value = item;
  detailDialog.value = true;
}

// 修改帳戶狀態
const updateForm = ref({
  status:"",
  memo:" ",
  operatorId:"",
  accountId:"",
});

const openUpdateDialog = (item) =>{
  selectedAccount.value = item;
  updateForm.value.status = item.status || '';
  updateForm.value.operatorId = workerId;
  updateForm.value.accountId = item.accountId;
  updateDialog.value = true;
  updateForm.value.memo = "";
};

const submitUpdateStatus = async () => {
  if( updateForm.value.status === selectedAccount.value.status ){
    alert("請修改狀態");
    return;
  }

  // memo是null的話 => false 是空白的話.trim() => ""空白刪掉 => 沒有東西所以是false 
  if( !updateForm.value.memo?.trim() ){
      alert("請填寫修改狀態原因");
      return;
    }
    console.log(updateForm);

    const updateRS = await request({
      url:"/account/update",
      method:"PUT",
      data: updateForm.value,
       headers: { "Content-Type": "application/json" },
    });

    alert("修改狀態成功");
    updateDialog.value = false;
    fetchAccounts();
  }
</script>

<style scoped>
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
.my-data-table{
  margin-top: 20px;
}
.search-area{
  margin-top: 20px;
}

</style>