<<template>
  <div>
    <!-- 搜尋與狀態篩選 -->
    <div class="search-wrapper">
      <div class="left-buttons">
        <div class="status-filter">
          <select v-model="selectedStatus" @change="onFilterChange" class="status-select">
            <option value="">全部狀態</option>
            <option value="pending">待審核</option>
            <option value="supplement">補件中</option>
            <option value="approved">審核通過</option>
            <option value="rejected">拒絕申請</option>
          </select>
          <v-icon class="select-icon" small>mdi-menu-down</v-icon>
        </div>
        <button @click="openAuditRecord" class="audit-record-button">審核紀錄</button>
      </div>

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

    <!-- 貸款列表 -->
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
          />
        </tbody>
      </table>
    </div>

    <!-- 各種 Modal -->
    <LoanDetailModal
      :show="showDetailModal"
      :data="loanDetail"
      @close="showDetailModal = false"
    />
    <LoanReviewModal
      :visible="isReviewModalVisible"
      :review="currentReview"
      @close="closeReviewModal"
      @save="handleSaveReview"
    />
    <LoanReviewLogsModal
      :show="isAuditModalVisible"
      :records="auditRecords"
      @close="isAuditModalVisible = false"
    />
    <ConfirmModal
      :visible="isConfirmVisible"
      message="確定要儲存審核結果嗎？"
      @confirm="onConfirmSave"
      @cancel="onCancelSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { useWorkerStore } from "@/stores/Worker";

import loanRow from "@/components/loan/loanRow.vue";
import LoanDetailModal from "@/components/loan/loanDetail/loanDetailModal.vue";
import LoanReviewModal from "@/components/loan/loanReview/loanReviewModal.vue";
import LoanReviewLogsModal from "@/components/loan/loanReview/loanReviewLogsModal.vue";
import ConfirmModal from "@/components/loan/confirm/confirmModal.vue";

// 資料
const loans = ref([]);
const searchKeyword = ref("");
const selectedStatus = ref("");

// 審核紀錄
const auditRecords = ref([]);
const isAuditModalVisible = ref(false);

// 詳細資料 Modal
const loanDetail = ref({});
const showDetailModal = ref(false);

// 審核 Modal
const isReviewModalVisible = ref(false);
const currentReview = ref(null);

// 確認 Modal
const isConfirmVisible = ref(false);
let reviewToSave = null;

const workerStore = useWorkerStore();
const workerId = workerStore.wId;

// 載入貸款清單 (依關鍵字和狀態篩選)
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
  fetchLoans();
});

function onSearch() {
  fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
}
function onFilterChange() {
  fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
}

// 審核紀錄
async function openAuditRecord() {
  try {
    const data = await request({
      url: "/review/all",
      method: "GET",
    });
    auditRecords.value = data;
    isAuditModalVisible.value = true;
  } catch (error) {
    alert("取得審核紀錄失敗");
    console.error(error);
  }
}

// 貸款詳細資料
async function handleOpenDetail(loanId) {
  try {
    const res = await request({
      url: `/loans/${loanId}`,
      method: "GET",
    });
    loanDetail.value = res;
    showDetailModal.value = true;
  } catch (error) {
    alert("取得詳細資料失敗");
    console.error(error);
  }
}

// 開啟審核 Modal 並載入資料
async function openReviewModal(loanId) {
  try {
    const loan = await request({ url: `/loans/${loanId}`, method: "GET" });
    const document = await request({
      url: `/loans/${loanId}/latest-review`,
      method: "GET",
    });

    currentReview.value = {
      loanId: loan.loanId,
      mName: loan.mName || loan.mname || "",
      reviewerId: workerId,
      reviewTime: document?.reviewTime || new Date().toISOString(),
      decision: document?.decision || "",
      notes: document?.notes || "",
      proofDocumentUrl: document?.proofDocumentUrl || null,
    };

    isReviewModalVisible.value = true;
  } catch (error) {
    alert("無法取得審核資料");
    console.error(error);
  }
}

// 儲存審核 - 先存基本資料，若有合約檔案再上傳
async function saveReviewSimple({ loanId, reviewerId, decision, notes }) {
  try {
    await request({
      url: `/loans/${loanId}/review`,
      method: "POST",
      data: { reviewerId, decision, notes },
    });
  } catch (error) {
    alert("送出審核失敗");
    throw error;
  }
}

async function saveReviewWithContract(contractFile, loanId) {
  const formData = new FormData();
  formData.append("file", contractFile);

  try {
    await request({
      url: `/loans/${loanId}/upload-contract`,
      method: "POST",
      data: formData,
    });
  } catch (error) {
    alert("合約檔案上傳失敗");
    throw error;
  }
}

// 觸發儲存，先跳確認框
function handleSaveReview(reviewData) {
  reviewToSave = reviewData;
  isConfirmVisible.value = true;
}

// 確認送出
async function onConfirmSave() {
  isConfirmVisible.value = false;
  if (!reviewToSave) return;

  try {
    await saveReviewSimple(reviewToSave);

    if (
      reviewToSave.decision === "approved" &&
      reviewToSave.contractFile instanceof File
    ) {
      await saveReviewWithContract(reviewToSave.contractFile, reviewToSave.loanId);
    }

    // 關閉 Modal 與更新清單
    isReviewModalVisible.value = false;
    reviewToSave = null;
    await fetchLoans(searchKeyword.value.trim(), selectedStatus.value);
  } catch {
    // 失敗時可適度提示，已在 catch 處理
  }
}

// 取消儲存
function onCancelSave() {
  isConfirmVisible.value = false;
  reviewToSave = null;
}

function closeReviewModal() {
  isReviewModalVisible.value = false;
  currentReview.value = null;
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
