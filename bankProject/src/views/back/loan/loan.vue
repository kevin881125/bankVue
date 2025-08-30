<template>
  <div>
    <!-- 貸款水門 -->
    <LoanSummaryDoughnuts
      :totalAmount="totalAmount"
      :totalThreshold="totalThreshold"
      :loans="categorizedLoans"
    />

    <!-- 搜尋與狀態篩選 -->
    <div class="search-wrapper">
      <div class="left-buttons">
        <div class="status-filter">
          <select
            v-model="selectedStatus"
            @change="onSearchOrFilterChange"
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
        <button @click="openAuditRecord" class="audit-record-button">
          審核紀錄
        </button>
      </div>

      <form @submit.prevent="onSearchOrFilterChange" class="search-container">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="請輸入用戶名稱"
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
            <th>申請人</th>
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
            v-for="l in filteredLoans"
            :key="l.loanId"
            :loan="l"
            @open-detail="handleOpenDetail"
            @edit-review="openReviewModal"
            @open-repayment="openRepaymentDetail"
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
    <RepaymentDetilModal
      :show="isRepaymentModalVisible"
      :payments="repaymentPayments"
      @close="isRepaymentModalVisible = false"
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
  <SuccessAnim v-model="showOK" :message="successMsg" :duration="1400" />

  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { request } from "@/utils/BackAxiosUtil";
import { useWorkerStore } from "@/stores/Worker";

import loanRow from "@/components/loan/loanRow.vue";
import LoanDetailModal from "@/components/loan/loanDetail/loanDetailModal.vue";
import LoanReviewModal from "@/components/loan/loanReview/loanReviewModal.vue";
import LoanReviewLogsModal from "@/components/loan/loanReview/loanReviewLogsModal.vue";
import RepaymentDetilModal from "@/components/loan/loanDetail/RepaymentDetilModal.vue";
import ConfirmModal from "@/components/loan/confirm/confirmModal.vue";
import LoanSummaryDoughnuts from "@/components/loan/chart/loanSummaryDoughnuts.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SuccessAnim from "@/components/successAnim.vue";

// 全部貸款資料
const allLoans = ref([]);

// 篩選後用於顯示的資料
const filteredLoans = ref([]);

// 搜尋關鍵字與狀態
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

// 繳款明細 Modal
const isRepaymentModalVisible = ref(false);
const repaymentPayments = ref([]);

// 確認 Modal
const isConfirmVisible = ref(false);
let reviewToSave = null;

const workerStore = useWorkerStore();
const workerId = workerStore.wId;

// 總貸款門檻
const totalThreshold = ref(32000000);

// 成功狀態視窗
const showOK = ref(false);
const successMsg = ref("");

// 失敗狀態視窗
const showError = ref(false);
const errorMsg = ref("");

// 總貸款金額計算（所有貸款金額加總）
const totalAmount = computed(() => {
  return allLoans.value.reduce(
    (acc, cur) => acc + Number(cur.loanAmount || 0),
    0
  );
});

// 分類貸款資料與門檻設定（示範車貸、房貸、學貸）
const categorizedLoans = computed(() => {
  const thresholds = {
    車貸: 20000000,
    房貸: 20000000,
    學貸: 20000000,
  };

  const amounts = { 車貸: 0, 房貸: 0, 學貸: 0 };

  allLoans.value.forEach((loan) => {
    if (loan.loanTypeName && amounts.hasOwnProperty(loan.loanTypeName)) {
      amounts[loan.loanTypeName] += Number(loan.loanAmount || 0);
    }
  });

  return Object.entries(amounts).map(([label, amount]) => ({
    label,
    amount,
    threshold: thresholds[label],
  }));
});

// 載入全部貸款資料
async function loadLoans() {
  try {
    const data = await request({ url: "/loans", method: "GET" });

    // 依 createdAt 由新到舊排序
    allLoans.value = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    filterLoans(); // 初次載入後直接篩選一次
  } catch (error) {
    errorMsg.value = "取得貸款資料失敗";
    showError.value = true;
    console.error(error);
  }
}

// 依關鍵字和狀態篩選
function filterLoans() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const status = selectedStatus.value;

  filteredLoans.value = allLoans.value.filter((loan) => {
    const matchesKeyword =
      !keyword ||
      (loan.mname && loan.mname.toLowerCase().includes(keyword)) ||
      (loan.loanTypeName && loan.loanTypeName.toLowerCase().includes(keyword));

    const matchesStatus = !status || loan.approvalStatus === status;

    return matchesKeyword && matchesStatus;
  });
}

function onSearchOrFilterChange() {
  filterLoans();
}

// 審核紀錄
async function openAuditRecord() {
  try {
    const data = await request({
      url: "/review/all",
      method: "GET",
    });
    auditRecords.value = data.sort(
      (a, b) => new Date(b.reviewTime) - new Date(a.reviewTime)
    );
    isAuditModalVisible.value = true;
  } catch (error) {
    errorMsg.value = "取得審核紀錄失敗";
    showError.value = true;
    console.error(error);
  }
}

// 顯示貸款詳細資料
async function handleOpenDetail(loanId) {
  try {
    const res = await request({
      url: `/loans/${loanId}`,
      method: "GET",
    });
    loanDetail.value = res;
    showDetailModal.value = true;
  } catch (error) {
    errorMsg.value = "取得詳細資料失敗";
    showError.value = true;
    console.error(error);
  }
}

// 開啟審核 Modal
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
      proofDocumentUrl: loan.proofDocumentUrl || null,
    };

    isReviewModalVisible.value = true;
  } catch (error) {
    errorMsg.value = "無法取得審核資料";
    showError.value = true;
    console.error(error);
  }
}

// 儲存審核資料(不含合約檔案)
async function saveReviewSimple({ loanId, reviewerId, decision, notes }) {
  try {
    await request({
      url: `/loans/${loanId}/status`,
      method: "POST",
      data: {
        newStatus: decision, // 使用 newStatus 參數名
        reviewerId: reviewerId,
        notes: notes || "",
      },
    });

    console.log(`貸款 ${loanId} 狀態更新成功：${decision}`);
  } catch (error) {
    console.error("狀態更新失敗:", error);
    errorMsg.value = "送出審核失敗";
    showError.value = true;
    throw error;
  }
}

// 上傳合約檔案
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
    errorMsg.value = "合約檔案上傳失敗";
    showError.value = true;
    throw error;
  }
}

// 開啟繳款明細
async function openRepaymentDetail(loanId) {
  try {
    const data = await request({
      url: `/loans/${loanId}/payments_dto`,
      method: "GET",
    });

    repaymentPayments.value = data;
    isRepaymentModalVisible.value = true;
  } catch (error) {
    errorMsg.value = "取得繳款明細失敗";
    showError.value = true;
    console.error(error);
  }
}

// 觸發儲存(跳確認框)
function handleSaveReview(reviewData) {
  reviewToSave = reviewData;
  isConfirmVisible.value = true;
}

// 確認送出
async function onConfirmSave() {
  isConfirmVisible.value = false;
  if (!reviewToSave) return;

  try {
    // 1. 更新貸款狀態（會自動發送郵件通知）
    await saveReviewSimple(reviewToSave);

    // 2. 如果是審核通過且有合約檔案，則上傳合約
    if (
      reviewToSave.decision === "approved" &&
      reviewToSave.contractFile instanceof File
    ) {
      await saveReviewWithContract(
        reviewToSave.contractFile,
        reviewToSave.loanId
      );
    }

    // 3. 關閉 Modal 並清理資料
    isReviewModalVisible.value = false;
    reviewToSave = null;

    // 4. 重新載入清單以顯示最新狀態
    await loadLoans();

    // 5. 顯示成功訊息（包含郵件通知）
    successMsg.value = "已發送通知信件給客戶。";
    showOK.value = true;
  } catch (error) {
    console.error("儲存審核結果失敗:", error);
    // 錯誤已在 saveReviewSimple 中提示
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

onMounted(async () => {
  await loadLoans();
});
</script>

<style scoped>
.search-wrapper {
  display: flex;
  justify-content: space-between;
  /* 左右分散排列 */
  align-items: center;
}

.search-wrapper .left-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-filter {
  position: relative;
  display: inline-block;
}

.status-select {
  appearance: none;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 9px 36px 9px 16px;
  font-size: 16px;
  color: #535353;
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
  min-width: 120px;
}

.status-select:hover,
.status-select:focus {
  border-color: #e5a900;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.audit-record-button {
  border: 1px solid #b61359;
  color: #b61359;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  font-weight: 500;
}

.audit-record-button:hover {
  background-color: #b61359;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.audit-record-button:active {
  transform: translateY(1px);
}

.search-container {
  display: flex;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 550px;
}

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
}

.search-button:hover {
  background-color: #e5a900;
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

.table th {
  background-color: #ffffff;
  color: #444848;
  font-weight: 600;
  text-align: center;
  padding: 14px 10px;
  font-size: 16px;
}

.table tr:hover {
  background-color: #f9f9f9;
}
</style>
