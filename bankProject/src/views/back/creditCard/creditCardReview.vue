<template>
 <h2>待審核卡片</h2>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>編號</th>
          <th>名字</th>
          <th>卡種</th>
          <th>身分證正面</th>
          <th>身分證反面</th>
          <th>財力證明</th>
          <th>申請日期</th>
          <th>狀態</th>
          <th>查看</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <creditCardRow v-for="c in creditCards" :key="c.applicationId" :creditCard="c" isPending="true" :handleApprove="handleApprove" :handleReject="handleReject" :card="card" :cardTypeMap="cardTypeMap"/>
      </tbody>
    </table>
  </div>
  <h2>已通過卡片</h2>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>編號</th>
          <th>名字</th>
          <th>卡種</th>
          <th>身分證正面</th>
          <th>身分證反面</th>
          <th>財力證明</th>
          <th>申請日期</th>
          <th>狀態</th>
          <th>查看</th>
        </tr>
      </thead>
      <tbody>
        <creditCardRow v-for="c in approvedCards" :key="c.applicationId" :creditCard="c" :card="card" :cardTypeMap="cardTypeMap"/>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted } from "vue";
import creditCardRow from "@/components/creditCard/creditCardRow.vue";
import { useRouter } from "vue-router";

const creditCards=ref([]);
const approvedCards = ref([]);

async function fetchCardsData() {
  try {
    const response = await request({ url: "/cardBack/review", method: "GET" });
    console.log("從 /cardBack/review 獲取的原始資料:", response); // 偵錯點
    console.log(response);

    // 處理資料，並將結果賦值給 ref
    creditCards.value = response.pendingList;
    approvedCards.value = response.approvedList;
    
  } catch (error) {
    console.error("無法取得卡片資料", error);
    // 處理錯誤，例如顯示錯誤訊息
  }
}

// 在 onMounted 時，只呼叫這個函數
onMounted(() => {
  fetchCardsData();
});

const router = useRouter();

async function handleApprove(card,reviewComment) {
  try {
    await request({
      url: "/cardBack/updateStatus",
      method: "POST",
      params: {
        applicationId: card.applicationId,
        action: "approve",
        reviewComment:reviewComment || ""
      },
    });
    alert("已通過！");
    // 操作成功後，呼叫這個函數來刷新資料
    await fetchCardsData(); 
  } catch (err) {
    console.error("通過失敗", err);
  }
}

const reviewComment = ref("");

async function handleReject(card,reviewComment) {
  try {
    await request({
      url: "/cardBack/updateStatus",
      method: "POST",
      params: {
        applicationId: card.applicationId,
        action: "reject",
        reviewComment:reviewComment || ""
      },
    });
    alert("已拒絕！");
    // 操作成功後，呼叫這個函數來刷新資料
    await fetchCardsData();
  } catch (err) {
    console.error("拒絕失敗", err);
  }
}
const cardTypeMap = ref({});

async function fetchCardTypeMap() {
  try {
    const res = await request({ url: "/card/apply", method: "GET" });
     console.log("從 /card/apply 獲取的卡種對應表:", res); // 偵錯點
    cardTypeMap.value = res; // 假設是 {1: "白金卡", 2: "黑卡"}
  } catch (error) {
    console.error("卡種對照表錯誤", error);
  }
}
// 初始化載入時
onMounted(async () => {
  await Promise.all([
    fetchCardsData(),
    fetchCardTypeMap()
  ]);
});
</script>
<style scoped>
*{
  box-sizing: border-box;
}
table {
  width: 100%;
  height: 100%;
  background-color: rgb(255, 255, 255);
   border-collapse: collapse;
   box-shadow: 0 0 10px 10px gray;
   padding-left: 10px;
   padding-right: 10px;
}
thead{
    width: 100%;
    height: 50px;
    background-color:rgb(255, 255, 255);
    box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1); 
}
th{
    color: #555555;
    border-right: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    
}
.table {
  height: 85%;
  border-collapse: collapse;
  overflow: auto;
}
.search {
  width: 100%;
  height: calc(15% - 10px) ;
  background-color: #ffffff;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1);
}
</style>