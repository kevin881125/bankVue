<template>
  <v-app>
    <v-main>
      <v-container style="max-width: 1500px; margin: auto">
        <!-- 篩選 審核、未審核 按鈕  -->
        <!-- <v-btn-toggle> 是 Vuetify 中用來建立「按鈕切換群組」的元件，可以讓使用者從一組按鈕中選擇一個（或多個）選項。它常用於 tab 選擇、過濾器、切換開關等。
            mandatory 是 <v-btn-toggle> 的一個布林屬性，用來強制必須選擇一個選項。
            -->
        <v-btn-toggle v-model="filterStatus" class="mb-4 status-area" mandatory>
          <v-btn value="undone">待審核</v-btn>
          <v-btn value="done">已審核</v-btn>
        </v-btn-toggle>

        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          density="compact"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
          class="search-area"
        ></v-text-field>

        <!-- 資料表格 -->
        <!-- item-value這裡是設定每筆資料的唯一值欄位，預設是 'id'，但我們的主鍵是 applicationId 
          :sort-by="['applyTime']"  一開始按照這個排序
          :sort-desc="[true]"       由新到舊 
          :custom-sort="customSort" 自定義排序
        -->
        <v-data-table
          :headers="headers"
          :items="applicationlist"
          item-value="applicationId"
          v-model:search="search"
          :filter-keys="[
            'member.mName',
            'applicationId',
            'member.mIdentity',
            'applyTime',
            'status',
            'mId',
          ]"
          :items-per-page="5"
          :items-per-page-options="[5, 10, 20]"
          class="my-data-table"
        >
          <template #item.actions="{ item }">
            <v-btn @click="memberDetailDialog(item)">
              <v-icon>mdi-eye</v-icon>
              詳細資訊
            </v-btn>
          </template>
          <template v-slot:item.applyTime="{ item }">
            {{ formatDateTime(item.applyTime) }}
          </template>
        </v-data-table>
      </v-container>
      <applicationDetail
        :model-value="dialog"
        @update:model-value="(val) => (dialog = val)"
        :selected-item="selectedItem"
        :readonly="
          selectedItem &&
          (selectedItem.status === '通過' ||
            selectedItem.status === '未通過' ||
            selectedItem.status === '待補件')
        "
        @updated="fetchApplications"
      ></applicationDetail>
    </v-main>
  </v-app>
</template>

<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, watch } from "vue";
import applicationDetail from "@/components/member/applicationDetail.vue";
import { formatDateTime } from "@/utils/DataUtil";

const search = ref("");

// sortable: false 是 Vuetify 的 <v-data-table> 中用來設定「這欄不能排序」的屬性。
const headers = [
  { title: "申請編號", key: "applicationId" },
  { title: "會員ID", key: "mId" },
  { title: "會員名稱", key: "member.mName" },
  { title: "身分證字號", key: "member.mIdentity" },
  { title: "申請時間", key: "applyTime" },
  { title: "狀態", key: "status" },
  { title: "操作", key: "actions", sortable: false },
];

// 資料列表
const applicationlist = ref([]);

// 篩選狀態 預設是"未審核"
const filterStatus = ref("undone");

// 根據狀態載入資料
const fetchApplications = async () => {
  let url = "";

  if (filterStatus.value === "undone") {
    url = "/account/application/getrwundone";
  } else if (filterStatus.value === "done") {
    url = "/account/application/getrwdone";
  }

  applicationlist.value = await request({
    url,
    method: "GET",
  });
};

// 當篩選狀態變更，重新取得資料 (watch偵測狀態改變自動更新資料)
watch(filterStatus, () => {
  fetchApplications();
});

// 頁面載入時，抓預設資料(未審核)
onMounted(async () => {
  fetchApplications();
});

const dialog = ref(false);
const selectedItem = ref(null);

function memberDetailDialog(item) {
  selectedItem.value = item; // 儲存選中的資料
  dialog.value = true; // 打開彈窗
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

.my-data-table,
.status-area,
.search-area {
  margin-top: 20px;
}
</style>
