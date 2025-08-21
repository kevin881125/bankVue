<template>
  <h2 class="form-title">上傳身分證件</h2>

  <!-- 身分證正面（必填） -->
  <div class="form-group">
    <label class="field-label">身分證正面（必填）</label>
    <div class="row-inline">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        @change="onPick($event, 'front')"
      />
      <button
        v-if="idFront"
        type="button"
        class="btn"
        @click="clearFile('front')"
      >
        移除
      </button>
    </div>
    <div class="hint" v-if="idFront">
      已選：{{ idFront.name }}（{{ prettySize(idFront.size) }}）
    </div>
    <div class="hint error" v-if="errFront">{{ errFront }}</div>
    <div v-if="frontPreview" style="margin-top: 8px">
      <img
        :src="frontPreview"
        alt="正面預覽"
        style="
          width: 180px;
          height: auto;
          border: 1px solid var(--line);
          border-radius: 6px;
        "
      />
    </div>
  </div>

  <!-- 身分證反面（必填） -->
  <div class="form-group">
    <label class="field-label">身分證反面（必填）</label>
    <div class="row-inline">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        @change="onPick($event, 'back')"
      />
      <button
        v-if="idBack"
        type="button"
        class="btn"
        @click="clearFile('back')"
      >
        移除
      </button>
    </div>
    <div class="hint" v-if="idBack">
      已選：{{ idBack.name }}（{{ prettySize(idBack.size) }}）
    </div>
    <div class="hint error" v-if="errBack">{{ errBack }}</div>
    <div v-if="backPreview" style="margin-top: 8px">
      <img
        :src="backPreview"
        alt="反面預覽"
        style="
          width: 180px;
          height: auto;
          border: 1px solid var(--line);
          border-radius: 6px;
        "
      />
    </div>
  </div>

  <!-- 第二證件（選填） -->
  <div class="form-group">
    <label class="field-label">第二證件（選填：健保卡/駕照）</label>
    <div class="row-inline">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        @change="onPick($event, 'second')"
      />
      <button
        v-if="secondId"
        type="button"
        class="btn"
        @click="clearFile('second')"
      >
        移除
      </button>
    </div>
    <div class="hint" v-if="secondId">
      已選：{{ secondId.name }}（{{ prettySize(secondId.size) }}）
    </div>
    <div class="hint error" v-if="errSecond">{{ errSecond }}</div>
    <div v-if="secondPreview" style="margin-top: 8px">
      <img
        :src="secondPreview"
        alt="第二證件預覽"
        style="
          width: 180px;
          height: auto;
          border: 1px solid var(--line);
          border-radius: 6px;
        "
      />
    </div>
  </div>

  <!-- 導覽 -->
  <div class="btn-row" style="justify-content: space-between">
    <button type="button" class="btn" @click="$emit('prev')">上一步</button>
    <button
      type="button"
      class="next-btn"
      :disabled="submitting || !canNext"
      @click="goNext"
    >
      {{ submitting ? "上傳中…" : "下一步" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";

const emit = defineEmits(["prev", "next"]);

/** 直接上傳到後端？不要的話改成 false（就只驗證→下一步） */
const UPLOAD_IMMEDIATELY = true;

/** 檔案＆預覽 */
const idFront = ref(null);
const idBack = ref(null);
const secondId = ref(null);
const frontPreview = ref("");
const backPreview = ref("");
const secondPreview = ref("");

/** 錯誤 */
const errFront = ref("");
const errBack = ref("");
const errSecond = ref("");

const submitting = ref(false);

/** 必填條件：正面+反面皆存在且無錯 */
const canNext = computed(
  () =>
    !!idFront.value &&
    !!idBack.value &&
    !errFront.value &&
    !errBack.value &&
    !errSecond.value
);

function onPick(e, which) {
  const f = e.target.files?.[0];
  if (!f) return;
  const okType = /^image\/(png|jpe?g|webp)$/i.test(f.type);
  const okSize = f.size <= 5 * 1024 * 1024; // 5MB
  const errMsg = !okType
    ? "僅支援 PNG/JPG/WEBP"
    : !okSize
    ? "檔案需小於 5MB"
    : "";

  const setFile = (fileRef, prevRef, errRef) => {
    // 清舊預覽
    if (prevRef.value) URL.revokeObjectURL(prevRef.value);
    fileRef.value = null;
    errRef.value = errMsg;
    if (!errMsg) {
      fileRef.value = f;
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
  const clear = (fileRef, prevRef, errRef) => {
    if (prevRef.value) URL.revokeObjectURL(prevRef.value);
    fileRef.value = null;
    prevRef.value = "";
    errRef.value = "";
  };
  if (which === "front") clear(idFront, frontPreview, errFront);
  if (which === "back") clear(idBack, backPreview, errBack);
  if (which === "second") clear(secondId, secondPreview, errSecond);
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function goNext() {
  if (!canNext.value) {
    alert("請上傳身分證正反面");
    return;
  }

  if (!UPLOAD_IMMEDIATELY) {
    emit("next");
    return;
  }

  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append("idFront", idFront.value);
    fd.append("idBack", idBack.value);
    if (secondId.value) fd.append("secondId", secondId.value);

    // TODO: 換成你的實際 API 路徑，後端要能接 multipart/form-data
    await request({
      url: "/account/uploadDocs",
      method: "POST",
      data: fd,
      // 不要手動設 Content-Type；讓瀏覽器帶 boundary
      withCredentials: true,
    });

    emit("next");
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
