<template>
  <div v-if="visible" class="modal" @click.self="close">
    <div class="loan-card" @click.stop>
      <div class="loan-header">
        <h3>貸款審核</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="split-layout">
        <!-- 左欄：基本資料 + 證明文件 -->
        <div class="left-cols">
          <div class="info-group">
            <h4>貸款資訊</h4>
            <p><strong>貸款ID：</strong> {{ localReview.loanId }}</p>
            <p><strong>顧客姓名：</strong> {{ localReview.mName }}</p>
          </div>

          <div class="info-group" v-if="localReview.proofDocumentUrl">
            <div class="title-with-icon">
              <h4>財力證明</h4>
              <button
                class="icon-button"
                @click="downloadFile"
                aria-label="下載證明文件"
                title="下載證明文件"
                type="button"
              >
                <v-icon size="20">mdi-download</v-icon>
              </button>
            </div>

            <iframe
              v-if="isPdf"
              :src="previewUrl"
              width="100%"
              height="300px"
              frameborder="0"
            ></iframe>
            <img
              v-else
              :src="previewUrl"
              alt="預覽圖片"
              style="max-width: 100%; max-height: 400px; object-fit: contain"
            />
          </div>
          <div v-else>
            <h4>證明文件</h4>
            <p>無證明文件</p>
          </div>
        </div>

        <!-- 右欄：審核決策 -->
        <div class="right-col">
          <div class="info-group">
            <h4>審核結果</h4>
            <label for="decision">狀態</label>
            <div class="select-wrapper">
              <select id="decision" v-model="localReview.decision" required>
                <option value="">請選擇</option>
                <option value="approved">審核通過</option>
                <option value="rejected">拒絕</option>
                <option value="supplement">補件中</option>
                <option value="pending">待審核</option>
              </select>
              <v-icon class="select-arrow" size="24">mdi-menu-down</v-icon>
            </div>

            <label for="notes">備註</label>
            <textarea
              id="notes"
              v-model="localReview.notes"
              rows="3"
              placeholder="輸入備註"
            ></textarea>

            <div v-if="localReview.decision === 'approved'" class="info-group">
              <h4>合約文件上傳</h4>
              <input
                type="file"
                @change="onContractFileChange"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <p v-if="contractFileName">已選擇檔案：{{ contractFileName }}</p>
            </div>

            <p><strong>更新時間：</strong> {{ formattedReviewTime }}</p>
          </div>
        </div>
      </div>

      <!-- 按鈕置中 -->
      <div class="buttons">
        <button
          type="button"
          @click="submitReview"
          class="btn-save"
          :disabled="!localReview.decision"
        >
          儲存
        </button>
        <button type="button" @click="close" class="btn-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { VIcon } from "vuetify/components";

const props = defineProps({
  visible: Boolean,
  review: Object,
});

const emit = defineEmits(["close", "save"]);

const localReview = ref({});

// watch props.review 複製到 localReview，避免直接修改 props
watch(
  () => props.review,
  (newVal) => {
    localReview.value = newVal ? { ...newVal } : {};
  },
  { immediate: true }
);

// 合約上傳檔案物件
const contractFile = ref(null);
const contractFileName = computed(() => contractFile.value?.name || "");

function onContractFileChange(e) {
  contractFile.value = e.target.files[0];
}

// 下載與預覽相關
const fileName = computed(() => {
  if (!localReview.value?.proofDocumentUrl) return "";
  return localReview.value.proofDocumentUrl.split("/").pop();
});
const fileUrl = computed(() => {
  if (!fileName.value) return "";
  return `http://localhost:8080/bank/download/loanImg/${fileName.value}`;
});
const previewUrl = computed(() => {
  if (!fileName.value) return "";
  return `http://localhost:8080/bank/uploadImg/loanImg/${fileName.value}`;
});
const isPdf = computed(() => {
  return localReview.value?.proofDocumentUrl?.toLowerCase().endsWith(".pdf");
});
function downloadFile() {
  if (!fileUrl.value) {
    alert("無法下載檔案");
    return;
  }
  const link = document.createElement("a");
  link.href = fileUrl.value;
  link.download = fileName.value || "proof-file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function close() {
  emit("close");
}

function submitReview() {
  if (!localReview.value.loanId || !localReview.value.decision) {
    alert("請填寫審核狀態");
    return;
  }
  emit("save", {
    loanId: localReview.value.loanId,
    decision: localReview.value.decision,
    notes: localReview.value.notes || "",
    reviewerId: localReview.value.reviewerId || "",
    contractFile: contractFile.value || null,
  });
}

const formattedReviewTime = computed(() => {
  if (!localReview.value.reviewTime) return "尚未審核";
  return new Date(localReview.value.reviewTime).toLocaleString();
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: "Noto Sans TC", sans-serif;
}

.loan-card {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  padding: 24px 32px;
  box-sizing: border-box;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
}

.loan-header h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s ease;
}
.close-btn:hover {
  color: #222;
}

.split-layout {
  display: flex;
  gap: 32px;
}

.left-cols,
.right-col {
  flex: 1;
}

.info-group {
  font-size: 16px;
  color: #333;
}

.info-group h4 {
  margin-bottom: 6px;
  font-weight: 700;
  border-bottom: 2px solid #ddd;
  padding-bottom: 6px;
  color: #444;
}

.info-group p {
  margin: 8px 0;
}

select,
textarea {
  width: 100%;
  margin: 8px 0 16px 0;
  padding: 8px;
  font-size: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  cursor: pointer;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 300px;
}

.select-arrow {
  position: absolute;
  right: 8px;
  top: 44%; /* 微調箭頭垂直位置 */
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
}

label {
  font-weight: 600;
  display: block;
  margin-top: 12px;
  color: #555;
}

.info-group {
  margin-bottom: 32px; /* 拉大區塊間距 */
}

/* 證明文件區塊 */
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 6px;
  color: #444;
}

.title-with-icon h4 {
  margin: 0;
  white-space: nowrap; /* 避免換行 */
  border-bottom: none; /* 確保 h4 沒有底線 */
  line-height: 1;
}

.icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  color: #7f7f7f;
  border-radius: 6px;
}

.icon-button:hover {
  color: #d6a70f;
}

.proof-doc img {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: flex;
  justify-content: center; /* 按鈕置中 */
  gap: 16px;
  margin-top: 8px;
}

button {
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  font-family: inherit;
}

.btn-save {
  background-color: #4caf50;
  color: white;
}
.btn-save:hover {
  background-color: #3a9a38;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}
.btn-cancel:hover {
  background-color: #c13027;
}
</style>
