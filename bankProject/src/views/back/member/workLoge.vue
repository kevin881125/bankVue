<template>
  <div class="container">
    <h2>工作者操作紀錄</h2>
    <div class="searchbar">
      <div class="input">
        <input
          type="text"
          v-model="searchData"
          placeholder="請輸入帳號"
        /><button class="serchbtn" @click="search">查詢</button>
      </div>
      <button class="download" @click="download">csv檔案下載</button>
    </div>
    <div class="table">
      <div class="thead">
        <div class="th" v-for="field in fields">{{ field }}</div>
      </div>
      <div class="tbody">
        <div class="tr" v-for="(worlerLog, index) in worlerLogs">
          <div class="td">{{ index + 1 }}</div>
          <div class="td">{{ worlerLog.worker.wId }}</div>
          <div class="td">{{ worlerLog.worker.wAccount }}</div>
          <div class="td">{{ worlerLog.worker.wName }}</div>
          <div class="td">{{ worlerLog.action }}</div>
          <div class="td">{{ worlerLog.message }}</div>
          <div class="td">{{ formatTaiwanTime(worlerLog.time) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// 格式化 ISO 時間 → 台灣時間字串
function formatTaiwanTime(isoString) {
  return dayjs.utc(isoString).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
}

const searchData = ref("");

const worlerLogs = ref({});
const fields = ref([
  "排序",
  "使用者ID",
  "使用者帳號",
  "使用者名稱",
  "動作",
  "訊息",
  "時間",
]);

onMounted(() => {
  dowloadpage();
});

const dowloadpage = () => {
  getAllworlerLog();
};

const getAllworlerLog = async () => {
  const data = await request({
    url: "/workerlog/all",
    method: "GET",
  });
  worlerLogs.value = data;
};

const search = async () => {
  let uul = "";
  if (searchData.value === "") {
    uul = "/workerlog/all";
  } else {
    uul = "/workerlog/account/" + searchData.value;
  }

  try {
    const data = await request({
      url: uul,
      method: "GET",
    });
    worlerLogs.value = data;
  } catch (error) {
    console.log(error);
    
    worlerLogs.value = error;
  }

};

const download = async () => {
  try {
    // 傳入 isDownload: true 告訴攔截器要回傳完整 response
    const response = await request({
      url: "/workerlog/api/download-workerlogs",
      method: "get",
      responseType: "blob",
      isDownload: true, // 自訂參數
      params: { workerName: searchData.value }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "worker_logs.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("下載失敗", error);
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

h2 {
  font-size: 40px;

}

.searchbar {
  width: 600px;
  height: 150px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

input {
  all: unset;
  width: 80%;
  height: 100%;
  padding-left: 10px;
}
.input {
  height: 50px;
  width: 300px;
  background-color: #fff;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 5px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.serchbtn {
  width: 56px;
  height: 36px;
  border-radius: 20px;
  background-color: #ebb211;
  color: #ffffff;
}
.download {
  width: 100px;
  height: 40px;
  border-radius: 30px;
  background-color: #03910a;
  color: #ffffff;
}

/*新版*/
.table {
  width: 100%;
  background-color: #fff;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  border-collapse: collapse;
}
.thead {
  height: 50px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 10px;
}
.tr {
  display: flex;
}
.tbody {
  height: 600px;
  overflow: auto;
  padding: 10px 10px;
}
.td {
  width: 300px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #666a6a;
  padding: 30px 10px;
}
.td:nth-child(1) {
  width: 50px;
}
.td:nth-child(2) {
  width: 145px;
}
.td:nth-child(3) {
  width: 180px;
}
.td:nth-child(4) {
  width: 210px;
}
.td:nth-child(5) {
  width: 70px;
}
.td:nth-child(6) {
  width: 600px;
}
.td:nth-child(7) {
  width: 300px;
}

.th {
  text-align: center;
}
.th:nth-child(1) {
  width: 50px;
}
.th:nth-child(2) {
  width: 145px;
}
.th:nth-child(3) {
  width: 180px;
}
.th:nth-child(4) {
  width: 210px;
}
.th:nth-child(5) {
  width: 70px;
}
.th:nth-child(6) {
  width: 600px;
}
.th:nth-child(7) {
  width: 300px;
}
</style>
