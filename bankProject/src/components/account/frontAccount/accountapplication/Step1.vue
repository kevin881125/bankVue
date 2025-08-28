<template>
  <h2 class="form-title">填寫我的身分證字號與手機號碼</h2>

  <!-- 身分證 -->
  <div class="form-group">
    <label class="field-label">身分證字號</label>
    <input
      v-model="form.idNo"
      type="text"
      placeholder="輸入我的身分證字號"
      class="input"
    />
    <div class="hint">請正確輸入身分證字號，送出後將無法修改</div>
  </div>

  <!-- 手機號碼 -->
  <div class="form-group">
    <label class="field-label">手機號碼</label>
    <div class="row-inline">
      <input
        v-model="form.phone"
        type="text"
        placeholder="輸入我的手機號碼（例：0912345678）"
        class="input"
        @input="phoneError = ''"
      />
      <button
        type="button"
        class="btn ghost"
        :disabled="sending || countdown > 0 || !validPhone"
        @click="sendOtp"
      >
        <span v-if="countdown === 0">發送驗證碼</span>
        <span v-else>{{ countdown }} 秒後可重發</span>
      </button>
    </div>
    <div class="hint error" v-if="phoneError">{{ phoneError }}</div>
  </div>

  <!-- OTP 驗證碼 -->
  <div class="form-group">
    <label class="field-label">簡訊驗證碼</label>
    <div class="row-inline">
      <input
        v-model="otp"
        maxlength="6"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="輸入 6 碼驗證碼"
        class="input"
        @input="otpError = ''"
      />
      <button
        type="button"
        class="btn primary"
        :disabled="verifying || otp.length !== 6"
        @click="verifyOtp"
      >
        驗證
      </button>
    </div>
    <div class="hint error" v-if="otpError">{{ otpError }}</div>
    <div class="hint success" v-if="otpPassed">驗證成功</div>
  </div>

  <!-- 驗證碼 -->
  <div class="form-group">
    <div class="field-label with-captcha">
      <span>網頁驗證碼</span>
      <div class="captcha-box">
        <img class="captcha-img" :src="captchaUrl" alt="請輸入圖片中的驗證碼" />
        <button type="button" class="refresh" @click="refreshCaptcha">⟳</button>
      </div>
    </div>
    <input
      v-model="form.captcha"
      type="text"
      placeholder="輸入右方數字"
      class="input"
    />
  </div>

  <!-- checkbox -->
  <div class="form-group">
    <label class="check">
      <input type="checkbox" v-model="form.twTaxResident" />
      <span>我只有中華民國稅務居民身分</span>
    </label>
    <label class="check">
      <input type="checkbox" v-model="form.noUsPerson" />
      <span>我沒有美國國籍</span>
    </label>
  </div>

  <!-- 下一步 -->
  <div class="btn-row">
    <button
      class="next-btn"
      :disabled="submitting || !canNext"
      @click="nextStep"
    >
      下一步
    </button>
  </div>

  <div class="warm">
    溫馨提醒：若將帳戶提供他人或不法集團使用，須自負相關法律責任，提醒妥善管理帳戶
  </div>
  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
  
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import ErrorMessage from "@/components/ErrorMessage.vue";
const form = ref({
  idNo: "",
  phone: "",
  captcha: "",
  twTaxResident: false,
  noUsPerson: false,
});

const emit = defineEmits(["next", "prev"]);
const showError = ref(false);
const errorMsg = ref("");
/* === SMS 驗證狀態 === */
const sending = ref(false);
const verifying = ref(false);
const countdown = ref(0); // 重發倒數
let timer = null;
const otp = ref("");
const otpPassed = ref(false);
const phoneError = ref("");
const otpError = ref("");
const captchaUrl = ref(getCaptchaUrl());
const submitting = ref(false);
const captchaError = ref("");
const memberStore = useMemberStore();
const mIdentity = memberStore.mIdentity.trim().toUpperCase();

const validPhone = computed(() => /^09\d{8}$/.test(form.value.phone)); // 台灣手機格式

function startCountdown(sec = 60) {
  countdown.value = sec;
  timer && clearInterval(timer);
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

async function sendOtp() {
  if (!validPhone.value) {
    phoneError.value = "手機格式不正確，例：0912345678";
    return;
  }
  phoneError.value = "";
  sending.value = true;
  otpPassed.value = false;
  otp.value = "";
  otpError.value = "";

  try {
    const res = await request({
      url: "/account/send",
      method: "POST",
      data: {
        phone: form.value.phone,
      },
    });

    console.log("sendOtp res =", res);

    if (res.status !== "sent") throw new Error(res?.error || "發送失敗");

    startCountdown(60); // 重發冷卻 60 秒
  } catch (e) {
    console.error(e);
    phoneError.value = e?.message || "發送驗證碼失敗，請稍後再試";
  } finally {
    sending.value = false;
  }
}

async function verifyOtp() {
  if (otp.value.length !== 6) {
    otpError.value = "請輸入 6 碼驗證碼";
    return;
  }
  verifying.value = true;
  otpError.value = "";
  try {
    const res = await request({
      url: "/account/verify",
      method: "POST",
      data: {
        phone: form.value.phone,
        code: otp.value,
      },
    });
    if (res.passed) {
      otpPassed.value = true;
    } else {
      otpError.value = "驗證碼不正確或已失效";
    }
  } catch (e) {
    console.error(e);
    otpError.value = "驗證失敗，請重新嘗試";
  } finally {
    verifying.value = false;
  }
}

const canNext = computed(
  () =>
    !!form.value.idNo &&
    !!form.value.phone &&
    !!form.value.captcha &&
    form.value.twTaxResident &&
    form.value.noUsPerson &&
    otpPassed.value // ✅ 必須通過簡訊驗證
);

const nextStep = async () => {
  if (submitting.value) return;

  // 基本欄位檢查
  if (!form.value.idNo || !form.value.phone || !form.value.captcha) {
    errorMsg.value = "請完成所有必填欄位";
    showError.value = true;
    return;
  }

  if (mIdentity !== form.value.idNo.trim().toUpperCase()) {
    errorMsg.value = "身分證字號與會員資料不符，請確認";
    showError.value = true;
    return;
  }

  if (!form.value.twTaxResident || !form.value.noUsPerson) {
    errorMsg.value = "請勾選『我只有中華民國稅務居民身分』與『我沒有美國國籍』";
    showError.value = true;
    return;
  }

  if (!otpPassed.value) {
    errorMsg.value = "請先完成簡訊驗證";
    showError.value = true;
    return;
  }

  // 圖形驗證
  submitting.value = true;
  try {
    const passed = await verifyCaptcha();
    console.log(passed, "圖形驗證結果");

    if (!passed) {
      submitting.value = false;
      errorMsg.value = "驗證碼不正確或已失效，請重新輸入";
      showError.value = true;
      return; // 驗證失敗，停止流程
    }

    emit("next"); // 通知父層進入下一步
  } finally {
    submitting.value = false;
  }
};

onUnmounted(() => {
  timer && clearInterval(timer);
});

function getCaptchaUrl() {
  return `http://localhost:8080/bank/captcha?${Date.now()}`;
}

function refreshCaptcha() {
  captchaUrl.value = getCaptchaUrl();
  form.value.captcha = "";
}

// 驗證 文字驗證碼
const verifyCaptcha = async () => {
  if (!form.value.captcha) {
    errorMsg.value = "請輸入驗證碼";
    showError.value = true;
    return false;
  }
  try {
    const res = await request({
      url: "/verifyCaptcha",
      method: "POST",
      data: {
        captcha: form.value.captcha,
      },
      withCredentials: true,
    });
    console.log("verifyCaptcha response:", res);

    // 走到這裡代表 HTTP 成功，因為攔截器已經回 data
    if (res?.passed === true) {
      form.value.captcha = "";
      refreshCaptcha();
      return true;
    }

    // 可能是 400 時攔截器直接丟錯（看你攔截器），保險提示
    captchaError.value = "驗證碼不正確或已失效";
    refreshCaptcha();
    return false;
  } catch (error) {
    // CORS 失敗、網路錯誤、或 4xx/5xx 被攔截器拋出
    errorMsg.value = error;
    showError.value = true;
    captchaError.value = "請求失敗（可能是 CORS / Session 未帶上）";
    refreshCaptcha();
    return false; // 驗證失敗
  }
};
</script>
<style scoped>
/* 右邊表單 */

.form-title {
  color: var(--ink);
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 20px;
}
.field-label {
  color: #696868;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
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
  color: var(--ink);
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
  margin-top: 12px;
}
.next-btn {
  min-width: 160px;
  border-radius: 999px;
  font-weight: 800;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}
.next-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  padding: 10px 16px;
  border: 1px solid var(--line);
  cursor: pointer;
  font-weight: 700;
}
.btn:disabled {
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
</style>
