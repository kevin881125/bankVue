<template>
  <div class="card-review-container">
    <div class="card-header">
      <v-btn-toggle v-model="displayMode" class="card-tabs" mandatory>
        <v-btn value="pending">待審核卡片 ({{ creditCards.length }})</v-btn>
        <v-btn value="approved">已通過卡片 ({{ approvedCards.length }})</v-btn>
      </v-btn-toggle>

      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="模糊查詢 (名字、卡種、日期)"
        class="search-input"
        clearable
        single-line
        hide-details
        variant="solo"
      ></v-text-field>
    </div>

    <div class="table-container">
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
        <tbody class="row">
          <template v-if="filteredCards.length > 0">
            <template v-if="displayMode === 'pending'">
              <creditCardRow v-for="c in filteredCards" :key="c.applicationId" :creditCard="c" isPending="true"
                :handleApprove="handleApprove" :handleReject="handleReject" :cardTypeMap="cardTypeMap" />
            </template>
            <template v-else-if="displayMode === 'approved'">
              <creditCardRow v-for="c in filteredCards" :key="c.applicationId" :creditCard="c"
                :handleIssueCard="handleIssueCard" :issuingIds="issuingIds" :cardTypeMap="cardTypeMap" />
            </template>
          </template>
          <tr v-else>
            <td colspan="10" class="text-center">沒有符合條件的資料</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive, computed } from "vue";
import creditCardRow from "@/components/creditCard/creditCardRow.vue";

const creditCards = ref([]);
const approvedCards = ref([]);
const cardTypeMap = ref({});
const issuingIds = reactive({});
const displayMode = ref('pending');

// 模糊查詢相關
const searchQuery = ref('');

const filteredCards = computed(() => {
  const currentList = displayMode.value === 'pending' ? creditCards.value : approvedCards.value;
  if (!searchQuery.value) {
    return currentList;
  }
  const query = searchQuery.value.toLowerCase();
  return currentList.filter(card => {
    const cardTypeName = cardTypeMap.value[String(card.cardType)] || '';
    return (
      (card.member.mname && card.member.mname.toLowerCase().includes(query)) ||
      cardTypeName.toLowerCase().includes(query) ||
      (card.applyDate && card.applyDate.includes(query))
    );
  });
});

async function fetchCardsData() {
  try {
    const response = await request({ url: "/cardBack/review", method: "GET" });
    creditCards.value = response.pendingList;
    approvedCards.value = response.approvedList;
  } catch (error) {
    console.error("無法取得卡片資料", error);
  }
}

async function fetchCardTypeMap() {
  try {
    const res = await request({ url: "/card/apply", method: "GET" });
    cardTypeMap.value = res;
  } catch (error) {
    console.error("卡種對照表錯誤", error);
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCardsData(),
    fetchCardTypeMap()
  ]);
});

async function handleApprove(card, reviewComment) {
  try {
    await request({
      url: "/cardBack/updateStatus",
      method: "POST",
      params: {
        applicationId: card.applicationId,
        action: "approve",
        reviewComment: reviewComment || ""
      },
    });
    alert("已通過！");
    await fetchCardsData();
  } catch (err) {
    console.error("通過失敗", err);
  }
}

async function handleReject(card, reviewComment) {
  try {
    await request({
      url: "/cardBack/updateStatus",
      method: "POST",
      params: {
        applicationId: card.applicationId,
        action: "reject",
        reviewComment: reviewComment || ""
      },
    });
    alert("已拒絕！");
    await fetchCardsData();
  } catch (err) {
    console.error("拒絕失敗", err);
  }
}

async function handleIssueCard(card) {
  const id = card.applicationId;
  if (issuingIds[id]) return;
  issuingIds[id] = true;

  try {
    await request({
      url: "/adminCard/issue",
      method: "POST",
      params: { applicationId: id }
    });
    alert("發卡成功！");

    const targetCardIndex = approvedCards.value.findIndex(c => c.applicationId === card.applicationId);
    if (targetCardIndex !== -1) {
      approvedCards.value[targetCardIndex].status = 'ISSUED';
    }

  } catch (err) {
    console.error("發卡失敗", err);
    alert("發卡失敗，請檢查後端日誌");
  } finally {
    issuingIds[id] = false;
  }
}
</script>

<style scoped>
.card-review-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f4f6f8;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-input {
  max-width: 400px;
}

.card-tabs {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

thead th, tbody td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  text-align: center; /* 統一靠中對齊 */
  vertical-align: middle;
}

thead th {
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.text-center {
  padding: 20px;
  color: #999;
}

.row{
  text-align: center;
}
</style>