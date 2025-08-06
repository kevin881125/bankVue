<template>
  <div class="search-wrapper">
    <form @submit.prevent="onSearch" class="search-container">
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="請輸入搜尋內容"
      />
      <button type="submit" class="search-button">搜尋</button>
    </form>
  </div>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>貸款帳戶</th>
          <th>姓名</th>
          <th>貸款類型</th>
          <th>貸款期數(月)</th>
          <th>貸款金額</th>
          <th>貸款利率</th>
          <th>審核狀態</th>
          <th>申請時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <loanRow
          v-for="l in loans"
          :key="l.loanId"
          :loan="l"
          @open-detail="handleOpenDetail"
          @edit-review="openReviewModal"
        ></loanRow>
      </tbody>
    </table>
  </div>
  <LoanDetailModal
    :show="showModal"
    :data="loanDetail"
    @close="showModal = false"
  />
  <LoanReviewModal
    :visible="isModalVisible"
    :review="currentReview"
    @close="closeReviewModal"
    @save="trySaveReview"
  />

  <!-- 確認 Modal -->
  <ConfirmModal
    :visible="isConfirmVisible"
    message="確定要儲存審核結果嗎？"
    @confirm="onConfirmSave"
    @cancel="onCancelSave"
  />
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { useWorkerStore } from "@/stores/Worker";
import { ref, onMounted } from "vue";
import loanRow from "@/components/loan/loanRow.vue";
import LoanDetailModal from "@/components/loan/loanDetail/loanDetailModal.vue";
import LoanReviewModal from "@/components/loan/loanReview/loanReviewModal.vue";
import { translateStatus } from "@/components/loan/utils/statusHelper";
import ConfirmModal from "@/components/loan/confirm/confirmModal.vue";

const loans = ref([]);
const searchKeyword = ref("");

async function fetchLoans(keyword = "") {
  try {
    const data = await request({
      url: `/search/loans`,
      method: "GET",
      params: { search: keyword },
    });
    loans.value = data.filter((item) => item !== null && item !== undefined);
  } catch (error) {
    alert("取得貸款資料失敗");
    console.error(error);
  }
}

onMounted(() => {
  fetchLoans(); // 頁面載入先抓全部或空字串搜尋
});

function onSearch() {
  fetchLoans(searchKeyword.value.trim());
}

const loanDetail = ref({});
const showModal = ref(false);

const handleOpenDetail = async (loanId) => {
  try {
    const res = await request({
      url: `/loans/${loanId}`,
      method: "GET",
    });
    loanDetail.value = res;
    showModal.value = true;
  } catch (error) {
    alert("取得詳細資料失敗");
    console.error(error);
  }
};

const isModalVisible = ref(false);
const currentReview = ref(null);

// 父層 setup script 中

const openReviewModal = async (loanId) => {
  const workerStore = useWorkerStore();
  const workerId = workerStore.wId;

  try {
    // 拿該筆貸款資料
    const loan = await request({
      url: `/loans/${loanId}`,
      method: "GET",
    });

    // 如果要顯示補件/證明文件：
    const document = await request({
      url: `/loans/${loanId}/latest-review`,
      method: "GET",
    });

    // 準備要傳給 Modal 的內容
    currentReview.value = {
      loanId: loan.loanId,
      mName: loan.mname,
      reviewerId: workerId,
      reviewTime: document?.reviewTime || new Date().toISOString(),
      decision: document?.decision || "",
      notes: document?.notes || "",
      proofDocumentUrl: document?.proofDocumentUrl || null,
    };

    isModalVisible.value = true;
  } catch (error) {
    alert("無法取得審核資料");
    console.error(error);
  }
};

// 儲存審核結果
const saveReview = async (updatedReview) => {
  const { loanId, reviewerId, decision, notes } = updatedReview;

  try {
    await request({
      url: `/loans/${loanId}/status`,
      method: "POST",
      data: { newStatus: decision, reviewerId, notes },
    });

    isModalVisible.value = false;

    // 更新本地資料狀態
    const index = loans.value.findIndex((l) => l.loanId === loanId);
    if (index !== -1) {
      loans.value[index].approvalStatus = translateStatus(decision);
    }
  } catch (error) {
    alert("送出審核失敗");
    console.error(error);
  }
};

const isConfirmVisible = ref(false);
let reviewToSave = null;

// 用在 saveReview 前的觸發
function trySaveReview(updatedReview) {
  reviewToSave = updatedReview;
  isConfirmVisible.value = true;
}

// 當使用者確認儲存
async function onConfirmSave() {
  isConfirmVisible.value = false;
  if (!reviewToSave) return;

  const { loanId, reviewerId, decision, notes } = reviewToSave;

  try {
    await request({
      url: `/loans/${loanId}/review`,
      method: "POST",
      data: { reviewerId, decision, notes },
    });
    isModalVisible.value = false;

    // 更新本地狀態
    const index = loans.value.findIndex((l) => l.loanId === loanId);
    if (index !== -1) {
      loans.value[index].approvalStatus = translateStatus(decision);
    }
  } catch (error) {
    alert("送出審核失敗");
    console.error(error);
  }
}

function closeReviewModal() {
  isModalVisible.value = false;
  currentReview.value = null; // 清空審核資料，避免殘留
}

// 當使用者取消儲存
function onCancelSave() {
  isConfirmVisible.value = false;
}
</script>
<style scoped>
.search-wrapper {
  display: flex;
  justify-content: flex-end; /* 將內部 form 靠右 */

  .search-container {
    display: flex;
    background-color: #ffffff;
    border-radius: 30px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 800px;

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      color: #535353;
      padding: 8px;
      background-color: transparent;
    }

    .search-button {
      border: none;
      background-color: #ebb211;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #e5a900;
      }
    }
  }
}
.table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.table thead {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
  background-color: white;
  position: relative;
  z-index: 1;
}

/* 欄位標頭樣式 */
.table th {
  background-color: #ffffff; /* 白底 */
  color: #444848; /* 夜幕灰字體 */
  font-weight: 600;
  text-align: center;
  padding: 14px 10px;
  font-size: 16px;
}

/* 可選：資料列 hover 效果 */
.table tr:hover {
  background-color: #f9f9f9;
}
</style>
