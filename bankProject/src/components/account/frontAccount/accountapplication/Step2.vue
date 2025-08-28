<template>
  <div class="step-two">
    <h2 class="form-title">上傳身分證件</h2>

    <!-- 身分證正面（必填） -->
    <div class="form-group">
      <label class="field-label">*身分證正面（必填）</label>
      <!-- 上排：自訂檔案按鈕 + 檔名 + 移除 -->
      <div class="uploader-row">
        <!-- 隱藏原生 input，改用 label 當漂亮按鈕 -->
        <input
          id="frontInput"
          ref="frontInput"
          class="file-input"
          type="file"
          accept="image/*"
          @change="onPick($event, 'front')"
        />
        <label class="file-btn" for="frontInput">選擇檔案</label>

        <span class="file-name" v-if="idFront">
          {{ idFront.name }}（{{ prettySize(idFront.size) }}）
        </span>

        <button
          v-if="idFront"
          type="button"
          class="btn ghost"
          @click="clearFile('front')"
        >
          移除
        </button>
      </div>

      <div class="hint error" v-if="errFront">{{ errFront }}</div>
      <div class="preview" v-if="frontPreview" style="margin-top: 8px">
        <img :src="frontPreview" alt="正面預覽" />
      </div>
    </div>

    <!-- 身分證反面（必填） -->
    <div class="form-group">
      <label class="field-label">*身分證反面（必填）</label>
      <div class="uploader-row">
        <input
          id="backInput"
          ref="backInput"
          class="file-input"
          type="file"
          accept="image/*"
          @change="onPick($event, 'back')"
        />
        <label class="file-btn" for="backInput">選擇檔案</label>

        <span class="file-name" v-if="idBack">
          {{ idBack.name }}（{{ prettySize(idBack.size) }}）
        </span>

        <button
          v-if="idBack"
          type="button"
          class="btn ghost"
          @click="clearFile('back')"
        >
          移除
        </button>
      </div>

      <div class="hint error" v-if="errBack">{{ errBack }}</div>
      <div class="preview" v-if="backPreview" style="margin-top: 8px">
        <img :src="backPreview" alt="反面預覽" />
      </div>
    </div>

    <!-- 第二證件（選填） -->
    <div class="form-group">
      <label class="field-label">第二證件（選填：健保卡/駕照）</label>
      <div class="uploader-row">
        <input
          id="secondInput"
          ref="secondInput"
          class="file-input"
          type="file"
          accept="image/*"
          @change="onPick($event, 'second')"
        />
        <label class="file-btn" for="secondInput">選擇檔案</label>

        <span class="file-name" v-if="secondId">
          {{ secondId.name }}（{{ prettySize(secondId.size) }}）
        </span>

        <button
          v-if="secondId"
          type="button"
          class="btn ghost"
          @click="clearFile('second')"
        >
          移除
        </button>
      </div>

      <div class="hint error" v-if="errSecond">{{ errSecond }}</div>
      <div class="preview" v-if="secondPreview" style="margin-top: 8px">
        <img :src="secondPreview" alt="第二證件預覽" />
      </div>
    </div>

    <!-- 導覽 -->
    <div class="btn-row" style="justify-content: space-between">
      <button type="button" class="next-btn" @click="emit('prev')">
        上一步
      </button>
      <button
        type="button"
        class="next-btn"
        :disabled="submitting || !canNext"
        @click="goNext"
      >
        下一步
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";

const emit = defineEmits(["prev", "next"]);
const memberStore = useMemberStore();

/** 檔案＆預覽 */
const idFront = ref(null);
const idBack = ref(null);
const secondId = ref(null);
const frontPreview = ref("");
const backPreview = ref("");
const secondPreview = ref("");
const frontInput = ref(null);
const backInput = ref(null);
const secondInput = ref(null);

/** 錯誤 */
const errFront = ref("");
const errBack = ref("");
const errSecond = ref("");

const submitting = ref(false);

/** 必填條件：正面+反面皆存在且無錯  
    ! = 反轉真假
    !! = 轉成布林值 (true/false)
*/
const canNext = computed(
  () =>
    !!idFront.value &&
    !!idBack.value &&
    !errFront.value &&
    !errBack.value &&
    !errSecond.value
);

function onPick(e, which) {
  // 獲得照片 (因為是file 所以會是陣列，但只允許選一個檔案所以直接[0])
  const f = e.target.files?.[0];
  if (!f) return;

  /* 
    正則表達式 / / 兩個斜線裡面是規則 ^ 開頭 $ 結尾 i 忽略大小寫 
    (png|jpe?g|webp) → 群組，三種可能：png jpe?g → jpg 或 jpeg webp
    ex "image/png" ,"image/jpg" ...  .test( f.type) → 檢查檔案類型 回傳布林值
  */
  const okType = /^image\/(png|jpe?g|webp)$/i.test(f.type);
  // 5MB 1024 Bytes = 1 KB, 1024 KB = 1 MB
  const okSize = f.size <= 5 * 1024 * 1024;
  const errMsg = !okType
    ? "僅支援 PNG/JPG/WEBP"
    : !okSize
    ? "檔案需小於 5MB"
    : "";

  // 先定義 setFile 函式，根據 which 參數決定要設定哪個檔案
  const setFile = (fileRef, prevRef, errRef) => {
    // 清舊預覽
    if (prevRef.value) URL.revokeObjectURL(prevRef.value);
    fileRef.value = null;
    errRef.value = errMsg;
    if (!errMsg) {
      // 把圖片檔案放入 fileRef
      fileRef.value = f;
      //URL.createObjectURL(f) 會產生一個暫時的圖片網址，讓 <img> 可以直接顯示本地檔案。
      prevRef.value = URL.createObjectURL(f);
    } else {
      prevRef.value = "";
    }
  };

  if (which === "front") setFile(idFront, frontPreview, errFront);
  if (which === "back") setFile(idBack, backPreview, errBack);
  if (which === "second") setFile(secondId, secondPreview, errSecond);
}

function clearFile(which) {
  const clear = (fileRef, prevRef, errRef, inputRef) => {
    if (prevRef.value) {
      try {
        URL.revokeObjectURL(prevRef.value);
      } catch {}
    }
    fileRef.value = null;
    prevRef.value = "";
    errRef.value = "";
    // 「再次選同一檔案」也會觸發 change
    if (inputRef?.value) inputRef.value.value = "";
  };
  if (which === "front") clear(idFront, frontPreview, errFront);
  if (which === "back") clear(idBack, backPreview, errBack);
  if (which === "second") clear(secondId, secondPreview, errSecond);
}

// 「Bytes → KB / MB」的轉換器
function prettySize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  // toFixed(1) 把數字格式化成「小數點後 1 位」。ex 2.345.toFixed(1) → "2.3"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function goNext() {
  if (!canNext.value) {
    alert("請上傳身分證正反面");
    return;
  }
  if (submitting.value) return; // 防止重複提交
  // 準備上傳檔案
  submitting.value = true;
  try {
    // 建一個可裝多段資料（文字/檔案）的容器。瀏覽器會把它序列化成 multipart/form-data 格式。
    const fd = new FormData();
    fd.append("idfront", idFront.value);
    fd.append("idback", idBack.value);
    if (secondId.value) fd.append("secDoc", secondId.value);

    // 其他非檔案欄位
    fd.append("mid", memberStore.mId);
    fd.append("mName", memberStore.mName);
    fd.append("mEmail", memberStore.mEmail);

    const res = await request({
      url: "/account/application/insert",
      method: "POST",
      data: fd,
    });

    console.log(res, "上傳結果");
    if (res.success) {
      emit("next", { appId: res.appId }); // 通知父層進入下一步，並傳遞申請 ID
    }
  } catch (err) {
    console.error(err);
    alert("上傳失敗，請稍後再試");
  } finally {
    submitting.value = false;
  }
}

/** 清理預覽 URL，避免記憶體外洩 */
onUnmounted(() => {
  [frontPreview, backPreview, secondPreview].forEach((p) => {
    if (p.value) URL.revokeObjectURL(p.value);
  });
});
</script>
<style scoped>
/* 右邊表單 */

.step-two {
  margin: 4px 24px 4px 24px;
}

.form-title {
  color: var(--ink);
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 8px;
}
.form-group {
  width: 500px;
  margin-bottom: 20px;
}
.field-label {
  color: #696868;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
  padding: 8px 0 8px 0;
}
.hint {
  color: #6b7f95;
  font-size: 12px;
  margin-top: 6px;
}
.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.with-captcha {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.captcha-box {
  display: flex;
  align-items: center;
  gap: 8px;
}
.captcha-img {
  width: 96px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 6px;
}
.refresh {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--brand);
  font-size: 18px;
}
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--ink);
  font-size: 14px;
}
.btn-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.next-btn {
  width: 150px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  opacity: 0.85;
  transition: opacity 0.2s;
  margin-top: 8px;
}
.next-btn:disabled {
  cursor: not-allowed;
}
.next-btn:hover {
  opacity: 1;
}
.warm {
  margin-top: 12px;
  font-size: 12px;
  color: var(--accent);
}

/* 橫向並排 */
.row-inline {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

/* 按鈕 */
.btn {
  border-radius: 999px;
  padding: 4px 16px;
  border: 1px solid #696868;
  cursor: pointer;
  color: #696868;
  font-weight: 500;
  opacity: 0.65;
}
.btn:hover {
  opacity: 1;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.ghost {
  background: #fff;
  color: var(--ink);
  border-color: var(--line);
}
.btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* 訊息 */
.hint.error {
  color: #c0392b;
}
.hint.success {
  color: #2e7d32;
}

/* 隱藏原生 <input type="file">，用自訂按鈕觸發 */
.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 上排排版：按鈕、檔名、移除 */
.uploader-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

/* 自訂「選擇檔案」按鈕 */
.file-btn {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 999px;

  border-radius: 999px;
  font-weight: 500;
  background: #fff;
  color: var(--accent);
  border: 1px solid var(--accent);
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}
.file-btn:hover {
  background: var(--accent);
  color: #fff;
}

.file-name {
  color: #6b7f95;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 預覽容器：置中 + 固定比例 + 圓角邊框 */
.preview {
  margin-top: 10px;
  display: flex;
  justify-content: center; /* 水平置中 */
}
.preview img {
  width: 216px; /* 想大一點就調這裡 */
  max-width: 100%;
  aspect-ratio: 4 / 3; /* 固定外框比例（可改 3/2 或 1/1） */
  object-fit: contain; /* 以裁切方式塞滿框 */
  border: 1px solid var(--line);
  border-radius: 12px;
  display: block;
  background: #f7f8fa;
}
</style>
