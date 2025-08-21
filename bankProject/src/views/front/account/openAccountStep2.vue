<template>
  <div class="page-wrap">
    <div class="open-layout">
      <!-- 左側步驟流程 -->
      <aside class="steps">
        <ol class="step-list">
          <li class="step active">
            <div class="icon">
              <span class="mdi mdi-cellphone-check step-icon"></span>
            </div>
            <div class="text">
              <div class="title">嗨，第一次見面</div>
              <div class="bold">1. 綁定手機號碼</div>
            </div>
          </li>
          <li class="step">
            <div class="icon">
              <span class="mdi mdi-image-multiple step-icon"></span>
            </div>
            <div class="text">
              <div class="muted">準備好，亮出證件</div>
              <div class="bold">2. 填寫開戶資料</div>
            </div>
          </li>
          <li class="step">
            <div class="icon">
              <span
                class="mdi mdi-file-document-arrow-right-outline step-icon"
              ></span>
            </div>
            <div class="text">
              <div class="muted">送出審核申請</div>
              <div class="bold">3. 完成開戶申請</div>
            </div>
          </li>
        </ol>
      </aside>

      <!-- 右側表單卡片 -->
      <main class="form-area">
        <div class="form-card">
          <div class="padded">
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
              <div class="hint success" v-if="otpPassed">✅ 驗證成功</div>
            </div>

            <!-- 驗證碼 -->
            <div class="form-group">
              <div class="field-label with-captcha">
                <span>網頁驗證碼</span>
                <div class="captcha-box">
                  <img
                    class="captcha-img"
                    :src="captchaUrl"
                    alt="請輸入圖片中的驗證碼"
                  />
                  <button type="button" class="refresh" @click="refreshCaptcha">
                    ⟳
                  </button>
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
                {{ submitting ? "處理中…" : "下一步" }}
              </button>
            </div>

            <div class="warm">
              溫馨提醒：若將帳戶提供他人或不法集團使用，須自負相關法律責任，提醒妥善管理帳戶
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import router from "@/router";
const form = ref({
  idNo: "",
  phone: "",
  captcha: "",
  twTaxResident: false,
  noUsPerson: false,
});

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
    alert("請完成所有必填欄位");
    return;
  }

  if (mIdentity !== form.value.idNo.trim().toUpperCase()) {
    alert("身分證字號與會員資料不符，請確認");
    return;
  }

  if (!form.value.twTaxResident || !form.value.noUsPerson) {
    alert("請勾選『我只有中華民國稅務居民身分』與『我沒有美國國籍』");
    return;
  }

  if (!otpPassed.value) {
    alert("請先完成簡訊驗證");
    return;
  }

  // 圖形驗證
  submitting.value = true;
  try {
    const passed = await verifyCaptcha();
    if (!passed) {
      submitting.value = false;
      alert("驗證碼不正確或已失效，請重新輸入");
      return; // 驗證失敗，停止流程
    }

    router.push("yuzubank/openAccountStep2");
  } finally {
    submitting.value = false;
  }

  verifyCaptcha();
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
    alert("請輸入驗證碼");
    return;
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
  } catch (e) {
    // CORS 失敗、網路錯誤、或 4xx/5xx 被攔截器拋出
    console.error("verifyCaptcha error:", e);
    captchaError.value = "請求失敗（可能是 CORS / Session 未帶上）";
    refreshCaptcha();
    return false; // 驗證失敗
  }
};
</script>

<style scoped>
.page-wrap {
  --brand: #ebb211;
  --accent: #ce1465;
  --ink: #222626;
  --line: #e5e7eb;

  min-height: 100vh;
  background: linear-gradient(135deg, var(--ink) 0%, #333 100%);
  padding: 48px 24px;
  color: var(--line);
}

.open-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 32px;
}

/* 左側步驟 */
.step-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.step {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding-bottom: 28px; /* 下一顆 icon 的間距 */
  --seg-progress: 0; /* 預設 0（未開始） */
}
/* 灰底全長線（到下一顆 icon 頂端） */
.step:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 20px; /* icon 正中 */
  top: 40px; /* 從圓圈底部開始 */
  width: 2px;
  height: calc(100% - 40px);
  background: var(--line);
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

/* 彩色進度線：先畫滿，再用 scaleY 按比例縮放（0~1）*/
.step:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 40px;
  width: 2px;
  height: calc(100% - 12px);
  background: var(--brand);
  transform-origin: top;
  transform: scaleY(var(--seg-progress));
  z-index: 1; /* 疊在灰線上 */
  pointer-events: none;
}

/* 狀態：完成＝全亮、目前＝亮一半 */
.step.completed {
  --seg-progress: 1;
}
.step.active {
  --seg-progress: 0.3;
}

/* 預設（未開始） */
.icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--line);
  border-color: var(--brand);
  background: var(--brand);
  opacity: 0.75;
}
.step-icon {
  font-size: 24px;
  color: var(--line);
  transition: color 0.3s;
}
/* 當前步驟 */
.step.active .icon {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--ink);
  opacity: 1;
}
.step.active .step-icon {
  font-size: 24px;
}

.step.active .text .title,
.step.active .text .bold,
.step.active .text .muted {
  opacity: 1;
}

.text .title,
.text .bold,
.text .muted {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.text .title {
  font-size: 14px;
  margin-bottom: 4px;
}
.text .bold {
  font-weight: 500;
  font-size: 20px;
  color: var(--line);
}
.text .muted {
  color: var(--line);
}

/* 右邊表單 */
.form-card {
  width: 90%;
  border-radius: 24px;
  background: #fff;
}
.padded {
  padding: 32px 40px 28px 40px;
}
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
</style>
