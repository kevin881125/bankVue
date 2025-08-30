<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <h3>貸款審核</h3>
          <div class="loan-id-badge">貸款代號：{{ localReview.loanId }}</div>
        </div>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="split-layout">
          <!-- 左欄：基本資料 + 證明文件 -->
          <div class="left-column">
            <!-- 貸款資訊 -->
            <div class="section">
              <div class="section-header">
                <h4>貸款資訊</h4>
              </div>
              <div class="section-content">
                <div class="info-grid">
                  <div class="info-item">
                    <label>貸款ID</label>
                    <span class="value">{{ localReview.loanId }}</span>
                  </div>
                  <div class="info-item">
                    <label>顧客姓名</label>
                    <span class="value">{{ localReview.mName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 財力證明 -->
            <div class="section" v-if="localReview.proofDocumentUrl">
              <div class="section-header">
                <div class="header-title">
                  <h4>財力證明</h4>
                </div>
                <button
                  class="download-btn"
                  @click="downloadFile"
                  title="下載財力證明"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 10.5L5.5 8L6.5 7L7.5 8V3H8.5V8L9.5 7L10.5 8L8 10.5Z"
                      fill="currentColor"
                    />
                    <path d="M3 11H13V12H3V11Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div class="section-content">
                <div class="document-preview">
                  <iframe
                    v-if="isPdf"
                    :src="previewUrl"
                    width="100%"
                    height="300px"
                    frameborder="0"
                    class="pdf-preview"
                  ></iframe>
                  <img
                    v-else
                    :src="previewUrl"
                    alt="財力證明預覽"
                    class="image-preview"
                  />
                </div>
              </div>
            </div>
            <div v-else class="section">
              <div class="section-header">
                <h4>財力證明</h4>
              </div>
              <div class="section-content">
                <div class="no-document">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                      fill="#9ca3af"
                    />
                  </svg>
                  <span>無證明文件</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右欄：審核決策 -->
          <div class="right-column">
            <div class="section">
              <div class="section-header">
                <h4>審核決策</h4>
              </div>
              <div class="section-content">
                <div class="form-group">
                  <label for="decision">審核狀態</label>
                  <div class="select-wrapper">
                    <select
                      id="decision"
                      v-model="localReview.decision"
                      required
                    >
                      <option value="">請選擇審核結果</option>
                      <option value="approved">審核通過</option>
                      <option value="rejected">拒絕</option>
                      <option value="supplement">補件中</option>
                      <option value="pending">待審核</option>
                    </select>
                    <svg
                      class="select-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div class="form-group">
                  <label for="notes">審核備註</label>
                  <textarea
                    id="notes"
                    v-model="localReview.notes"
                    rows="4"
                    placeholder="請輸入審核備註或說明..."
                  ></textarea>
                </div>

                <!-- 合約文件上傳 -->
                <div
                  v-if="localReview.decision === 'approved'"
                  class="form-group"
                >
                  <label>合約文件上傳</label>
                  <div class="file-upload-area">
                    <input
                      type="file"
                      @change="onContractFileChange"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      id="contract-file"
                      class="file-input"
                    />
                    <label for="contract-file" class="file-upload-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 3V12M10 12L7 9M10 12L13 9M4 17H16"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>{{
                        contractFileName || "選擇檔案或拖拽至此"
                      }}</span>
                    </label>
                  </div>
                  <div v-if="contractFileName" class="file-selected">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13.5 3.5L6 11L2.5 7.5"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    已選擇檔案：{{ contractFileName }}
                  </div>
                </div>

                <div class="info-item">
                  <label>更新時間</label>
                  <span class="value">{{ formattedReviewTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 按鈕區域 -->
        <div class="action-buttons">
          <button
            type="button"
            @click="submitReview"
            class="btn-primary"
            :disabled="!localReview.decision"
          >
            儲存審核結果
          </button>
          <button type="button" @click="close" class="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
  <SuccessAnim v-model="showOK" :message="successMsg" :duration="1400" />

  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SuccessAnim from "@/components/successAnim.vue";

const showOK = ref(false);
const successMsg = ref("");
const showError = ref(false);
const errorMsg = ref("");

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
    errorMsg.value = "無法下載檔案";
    showError.value = true;
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
    errorMsg.value = "請填寫審核狀態";
    showError.value = true;
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 38, 38, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(34, 38, 38, 0.15);
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f3f4;
  background: #fafbfc;
  border-radius: 16px 16px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #222626;
  letter-spacing: -0.5px;
}

.loan-id-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  background-color: #f3f4f6;
  color: #6b7280;
}

.close-btn {
  border: none;
  background: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #222626;
}

.modal-body {
  padding: 16px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

.split-layout {
  display: flex;
  gap: 32px;
}

.left-column,
.right-column {
  flex: 1;
}

.section {
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  height: fit-content;
  margin-bottom: 24px;
}

.section-header {
  background: transparent;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #222626;
  position: relative;
  padding-left: 12px;
}

.section-header h4::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #ebb211;
  border-radius: 2px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: #ebb211;
  border-color: #ebb211;
  color: white;
}

.section-content {
  padding: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.2px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #222626;
  letter-spacing: -0.2px;
  line-height: 1.4;
}

.document-preview {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.pdf-preview,
.image-preview {
  width: 100%;
  border-radius: 8px;
}

.image-preview {
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.no-document {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6b7280;
  justify-content: center;
  border: 1px dashed #d1d5db;
}

.form-group {
  margin-bottom: 13px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.2px;
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #222626;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-sizing: border-box;
}

select:focus {
  outline: none;
  border-color: #ebb211;
  box-shadow: 0 0 0 3px rgba(235, 178, 17, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
}

textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 400;
  color: #222626;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #ebb211;
  box-shadow: 0 0 0 3px rgba(235, 178, 17, 0.1);
}

textarea::placeholder {
  color: #9ca3af;
}

.file-upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f8f9fa;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.file-upload-label:hover {
  cursor: pointer;
  border-color: #ebb211;
  background: rgba(235, 178, 17, 0.05);
  color: #ebb211;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin-top: 8px; */
  padding: 8px 12px;
  background: rgba(5, 150, 105, 0.05);
  border-radius: 6px;
  color: #059669;
  font-size: 13px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f1f3f4;
}

.btn-primary {
  background: #ebb211;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
}

.btn-primary:hover:not(:disabled) {
  background: #d1a00f;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #9ca3af;
  color: #374151;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 1024px) {
  .split-layout {
    flex-direction: column;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-width: 100%;
  }

  .modal-header {
    padding: 20px 24px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .modal-body {
    padding: 24px;
    gap: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
