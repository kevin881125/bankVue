<template>
  <div class="search-wrapper">
    <!-- 新增的按鈕區域 -->
    <div class="left-buttons">
      <!-- 審核狀態切換按鈕 -->
      <div class="status-filter">
        <select
          v-model="selectedStatus"
          @change="onStatusFilter"
          class="status-select"
        >
          <option value="">全部狀態</option>
          <option value="pending">待審核</option>
          <option value="supplement">補件中</option>
          <option value="approved">審核通過</option>
          <option value="rejected">拒絕申請</option>
        </select>
        <v-icon class="select-icon" small>mdi-menu-down</v-icon>
      </div>

      <!-- 審核紀錄按鈕 -->
      <button @click="openAuditRecord" class="audit-record-button">
        審核紀錄
      </button>
    </div>

    <!-- 原有的搜尋表單 -->
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

  <LoanReviewLogsModal
    :show="isAuditModalVisible"
    :records="auditRecords"
    @close="isAuditModalVisible = false"
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
import LoanReviewLogsModal from "@/components/loan/loanReview/loanReviewLogsModal.vue";

const loans = ref([]);
const searchKeyword = ref("");
const selectedStatus = ref(""); // 新增狀態篩選

async function fetchLoans(keyword = "", status = "") {
  try {
    const params = {};
    if (keyword) params.search = keyword;
    if (status) params.status = status;

    const data = await request({
      url: `/search/loans`,
      method: "GET",
      params,
    });
    loans.value = data;
  } catch (error) {
    alert("取得貸款資料失敗");
    console.error(error);
  }
}

onMounted(() => {
  fetchLoans(); // 頁面載入先抓全部或空字串搜尋
});

function onSearch() {
  fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
}

// 新增狀態篩選功能
function onStatusFilter() {
  fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
}

const auditRecords = ref([]);
const isAuditModalVisible = ref(false);

// 新增審核紀錄按鈕功能
async function openAuditRecord() {
  try {
    const data = await request({
      url: "/review/all", // 確認後端這個 API 有實作
      method: "GET",
    });

    auditRecords.value = data;
    isAuditModalVisible.value = true;
  } catch (error) {
    alert("取得審核紀錄失敗");
    console.error(error);
  }
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
      loans.value[index].approvalStatus = decision;
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

    // 如果有篩選條件，重新抓資料
    if (selectedStatus.value) {
      await fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
    } else {
      // 否則只更新本地資料
      const index = loans.value.findIndex((l) => l.loanId === loanId);
      if (index !== -1) {
        loans.value[index].approvalStatus = decision;
      }
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
  justify-content: space-between; /* 左右分散排列 */
  align-items: center;

  .left-buttons {
    display: flex;
    align-items: center;
    gap: 16px; /* 兩個按鈕之間的間距 */

    .status-filter {
      position: relative;
      display: inline-block;
      .status-select {
        appearance: none;
        background-color: #ffffff;
        border-radius: 20px;
        padding: 8px 36px 8px 16px;
        font-size: 16px;
        color: #535353;
        cursor: pointer;
        outline: none;
        transition: all 0.3s;
        min-width: 120px;

        &:hover {
          border-color: #e5a900;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &:focus {
          border-color: #e5a900;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        option {
          padding: 8px;
        }
      }
      .select-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        pointer-events: none;
        transform: translateY(-50%);
        color: #535353;
        font-size: 20px;
      }
    }

    .audit-record-button {
      border: 1px solid #b61359;
      color: #b61359;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
      font-weight: 500;

      &:hover {
        background-color: #b61359;
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }

  .search-container {
    display: flex;
    background-color: #ffffff;
    border-radius: 30px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 550px; /* 調整寬度以配合左側按鈕 */

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
