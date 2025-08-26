<template>
  <!-- 原生 dialog，外部用 v-model 控制 -->
  <dialog ref="dlg" class="dlg" @click="onBackdrop">
    <div class="panel">
      <form class="dlg-card" @submit.prevent="submitAddAccount">
        <div class="dlg-header">
          <div class="dlg-title">新增帳戶</div>
        </div>

        <div class="field">
          <label>帳戶名稱 <span class="req">*</span></label>
          <input
            v-model.trim="addForm.name"
            type="text"
            class="input"
            placeholder="例如：活存（臺幣）"
            maxlength="20"
            @input="validateAddName"
            required
          />
          <div class="hint error" v-if="addErrors.name">
            {{ addErrors.name }}
          </div>
        </div>

        <!-- 說明文 -->
        <div class="help">
          <ul>
            <li>
              帳戶名稱會顯示在列表與轉帳畫面，請使用易辨識名稱（例：薪轉、旅遊金）。
            </li>
            <li>
              限制 2–20 個字，允許：中文、英文、數字與「空格 / - _ ( )」。
            </li>
            <li>不要包含個資或敏感資訊（如身分證字號、電話）。</li>
            <li>建立後餘額為 0，可於「存提款」或「轉帳」進行後續操作。</li>
            <li>名稱重複不影響建立，但建議避免造成辨識混淆。</li>
          </ul>
        </div>

        <div class="dlg-actions">
          <button type="button" class="btn" @click="closeAdd">取消</button>
          <button type="submit" class="btn primary" :disabled="!canSubmitAdd">
            新增
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";

const memberStore = useMemberStore();
const mId = memberStore.mId;

/** Props 與 Emits（JS 版） */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mId: { type: [String, Number], default: null },
});

const emit = defineEmits(["update:modelValue", "submit"]);

/** 原生 dialog ref */
const dlg = ref(null);

/** v-model 控制開關 */
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      dlg.value?.showModal?.();
      addForm.value.name = "";
      addErrors.value.name = "";
    } else {
      dlg.value?.close?.();
    }
  }
);
function onBackdrop(e) {
  if (e.target === e.currentTarget) closeAdd();
}

// 新增帳戶 Dialog 狀態與表單
const addDlg = ref(null);
const addForm = ref({ name: "" });
const addErrors = ref({ name: "" });

const canSubmitAdd = computed(() => {
  return validateAddName();
});

function validateAddName() {
  const v = addForm.value.name || "";
  // 允許：中文、英文、數字、空格、- _ ( )，長度 2–20
  const ok = /^[\u4e00-\u9fa5A-Za-z0-9 \-_\(\)]{2,20}$/.test(v);
  addErrors.value.name = ok ? "" : "2–20 字，限中文/英文/數字與空格、- _ ( )";
  return ok;
}

function closeAdd() {
  emit("update:modelValue", false);
}

// 送出建立
const submitAddAccount = async () => {
  if (!validateAddName()) return;

  try {
    const payload = {
      mId: mId,
      accountName: addForm.value.name,
      currency: "NT",
    };

    const res = await request({
      url: "/account/insert",
      method: "POST",
      data: payload,
    });

    if (res === "新增成功") {
      alert(res);
      emit("submit");
    }

    closeAdd();
  } catch (e) {
    console.error("新增帳戶失敗", e);
    alert("新增失敗，請稍後再試");
  }
};
</script>

<style scoped>
/* 外層對話框 */
.dlg {
  border: 0;
  padding: 0;
  background: transparent; /* 背景透明，白底放在 .panel */
}

.dlg[open] {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw; /* ← 明確鋪滿 */
  height: 100vh;
  margin: 0; /* ← 取消 UA 的 auto margin */
  display: flex; /* ← 用 flex 最穩 */
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 水平置中 */
  z-index: 9999; /* 防止被頁面其他層壓住 */
}

.dlg::backdrop {
  background: rgba(0, 0, 0, 0.55);
}

/* 內層白色面板 */
.panel {
  position: relative; /* ← 關鍵：讓 close 以面板為參考 */
  width: min(96vw, 600px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin: 0;
  max-height: calc(100vh - 12vh); /* 視窗變小時避免溢出 */
  overflow: auto; /* 內容可卷動 */
}

.dlg-card {
  padding: 16px;
}
.dlg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.dlg-title {
  font-weight: 500;
  font-size: 24px;
}
.field {
  margin: 12px 10px;
}

.field .input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
}
.field .req {
  color: #ef4444;
}
.field label {
  font-weight: 400;
  font-size: 18px;
  margin-bottom: 6px;
  display: inline-block;
}
.hint {
  font-size: 14px;
  color: #6b7280;
  margin-top: 6px;
}
.hint.error {
  color: #dc2626;
}
.help {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  color: #374151;
}
.help ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
}
.dlg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* Primary 按鈕（沿用你的風格色） */
.btn.primary {
  background: transparent; /* 預設透明 */
  color: #ebb211; /* 文字黑色 */
  border: 2px solid #ebb211; /* 外框用品牌色 */
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.btn.primary:hover {
  background-color: #ebb211;
  color: #fff;
  box-shadow: 0 4px 14px rgba(235, 178, 17, 0.35);
  outline: none;
}
.btn {
  margin-right: 20px;
}
</style>
