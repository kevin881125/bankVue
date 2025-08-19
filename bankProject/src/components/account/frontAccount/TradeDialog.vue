<template>
  <!-- 原生 dialog，外部用 v-model 控制 -->
  <dialog ref="dlg" class="dlg" @click="onBackdrop">
    <div class="panel">
      <!-- 關閉（右上角白色圓鈕） -->
      <button class="close" aria-label="關閉" @click="close">×</button>

      <!-- Stepper（進度條） -->
      <div class="stepper">
        <div class="track">
          <div
            class="bar"
            :style="{ width: step === 1 ? '50%' : '100%' }"
          ></div>
        </div>
        <div class="dots">
          <div class="dot" :class="{ active: step >= 1 }">
            <span>1</span><em>輸入交易資料</em>
          </div>
          <div class="dot" :class="{ active: step === 2 }">
            <span>2</span><em>轉帳資訊確認</em>
          </div>
        </div>
      </div>

      <!-- 表單（第一步） -->
      <section v-if="step === 1" class="section">
        <!-- 轉出帳號 -->
        <label class="field">
          <span class="label">轉出帳號</span>
          <div class="field-body">
            <div class="row">
              <select v-model="form.accountId">
                <option
                  v-for="a in fromAccounts"
                  :key="a.accountId"
                  :value="a.accountId"
                >
                  {{ a.accountId }} {{ a.accountName || a.name || "" }}
                </option>
              </select>
            </div>
            <div v-if="currentFrom" class="hint">
              可用餘額：TWD
              {{ nf(currentFrom.available ?? currentFrom.balance) }}
            </div>
          </div>
        </label>

        <!-- 轉入帳號（分段：約定/常用｜輸入帳號） -->
        <label class="field">
          <span class="label">轉入帳號</span>

          <div class="field-body">
            <div class="seg tabs">
              <button
                class="seg-btn"
                :class="{ on: activeTab === 'saved' }"
                @click="activeTab = 'saved'"
              >
                約定/常用帳號
              </button>
              <button
                class="seg-btn"
                :class="{ on: activeTab === 'manual' }"
                @click="activeTab = 'manual'"
              >
                輸入帳號
              </button>
            </div>

            <!-- Saved -->
            <div v-if="activeTab === 'saved'" class="box mt-8">
              <div class="filters">
                <button
                  class="pill"
                  :class="{ on: payeeFilter === 'all' }"
                  @click="payeeFilter = 'all'"
                >
                  全部
                </button>
                <button
                  class="pill"
                  :class="{ on: payeeFilter === 'same' }"
                  @click="payeeFilter = 'same'"
                >
                  本人本行帳號
                </button>
                <button
                  class="pill"
                  :class="{ on: payeeFilter === 'fav' }"
                  @click="payeeFilter = 'fav'"
                >
                  常用帳號
                </button>
              </div>
              <div class="row">
                <select v-model="form.toAccountId">
                  <option disabled value="">請選擇</option>
                  <option
                    v-for="p in filteredPayees"
                    :key="p.accountId"
                    :value="p.accountId"
                  >
                    {{ p.bankCode }} {{ p.bankName }}　{{ p.accountId }}　{{
                      p.alias || ""
                    }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Manual -->
            <div v-else class="box mt-8">
              <div class="grid-2">
                <label class="subfield">
                  <span class="sub-label">轉入銀行</span>
                  <input
                    v-model="form.bankCode"
                    placeholder="銀行代碼（例如 013）"
                  />
                </label>
                <label class="subfield">
                  <span class="sub-label">轉入帳號</span>
                  <input
                    v-model="form.toAccountId"
                    placeholder="請輸入對方帳號"
                  />
                </label>
              </div>
            </div>
          </div>
        </label>

        <!-- 轉帳金額 -->
        <label class="field">
          <span class="label">轉帳金額</span>
          <div class="field-body">
            <div class="row">
              <span class="prefix">TWD</span>
              <input
                v-model.number="form.amount"
                inputmode="decimal"
                placeholder="0"
              />
            </div>
            <a class="fee-link" href="javascript:void(0)"
              >跨行轉帳手續費優惠查詢</a
            >
          </div>
        </label>

        <!-- 轉帳時間 -->
        <label class="field">
          <span class="label">轉帳時間</span>
          <div class="field-body">
            <div class="seg">
              <button
                class="seg-btn"
                :class="{ on: form.when === 'now' }"
                @click="form.when = 'now'"
              >
                即時
              </button>

              <!-- 👇 顯示但不啟用 -->
              <button
                class="seg-btn"
                disabled
                aria-disabled="true"
                title="預約功能尚未開放"
              >
                預約
              </button>
            </div>
          </div>
        </label>

        <div v-if="form.when === 'later'" class="grid-2 field field--inline">
          <label class="subfield">
            <span class="sub-label">日期</span>
            <input v-model="form.reserveDate" type="date" />
          </label>
          <label class="subfield">
            <span class="sub-label">時間</span>
            <input v-model="form.reserveTime" type="time" />
          </label>
        </div>

        <!-- 備註 -->
        <label class="field">
          <span class="label">備註</span>
          <div class="field-body">
            <input
              class="row-input"
              v-model="form.memo"
              maxlength="15"
              placeholder="（限輸入15個字，前6字可顯示於存摺上）"
            />
            <div class="subhint">前 6 字可顯示於存摺上</div>
            <label class="ck"
              ><input type="checkbox" /> 同時顯示於對方備註</label
            >
          </div>
        </label>

        <div class="actions">
          <button
            class="btn primary"
            :disabled="!canProceed || sending"
            @click="goConfirm"
          >
            確認轉帳資訊
          </button>
        </div>
      </section>

      <!-- STEP 2：確認頁 -->
      <section v-else class="section">
        <div class="warn">
          提醒您：尚未完成轉帳，必須按下方的「確定轉帳」，才會執行轉帳交易！
        </div>

        <div class="readonly">
          <div class="ro-row">
            <span>轉帳日期</span><b>{{ confirm.dateTime }}</b>
          </div>
          <div class="ro-row">
            <span>轉出帳號</span><b>{{ confirm.from }}</b>
          </div>
          <div class="ro-row">
            <span>轉入銀行</span><b>{{ confirm.bank }}</b>
          </div>
          <div class="ro-row">
            <span>轉入帳號</span><b>{{ confirm.to }}</b>
          </div>
          <div class="ro-row">
            <span>轉帳金額</span><b>TWD {{ nf(form.amount) }}</b>
          </div>
          <div class="ro-row">
            <span>備註</span><b>{{ form.memo || "—" }}</b>
          </div>
        </div>

        <div class="actions">
          <button class="btn ghost" @click="step = 1">返回修改</button>
          <button class="btn primary" :disabled="sending" @click="onSubmit">
            {{ sending ? "送出中…" : "確定轉帳" }}
          </button>
        </div>
      </section>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { formatDateOnly, formatDateTime } from "@/utils/DataUtil";

/** Props 與 Emits（JS 版） */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  accountId: { type: [String, Number], default: null },
  mId: { type: [String, Number], default: null },
});

const emit = defineEmits(["update:modelValue", "submit"]);
const step = ref(1);
const sending = ref(false);
const dlg = ref(null);

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      dlg.value?.showModal?.();
      document.body.style.overflow = "hidden";
      // 打開時載入帳戶清單（若尚未載入）
      if (!fromAccounts.value.length && props.mId) await loadAccounts();
      // 預選帶入 accountId
      if (props.accountId) form.value.fromAccountId = String(props.accountId);
    } else {
      dlg.value?.close?.();
      document.body.style.overflow = "";
    }
  }
);
function close() {
  emit("update:modelValue", false);
}
function onBackdrop(e) {
  if (e.target === e.currentTarget) close();
}

/* 資料 */
const fromAccounts = ref([]); // [{accountId, accountName, balance/available}]
const payees = ref([]); // 這裡先留空，之後你可接實際 API

async function loadAccounts() {
  try {
    const res = await request({
      url: `/account/getmemberaccounts/${props.mId}`,
      method: "GET",
    });
    fromAccounts.value = Array.isArray(res) ? res : [];
    payees.value = fromAccounts.value.map((a) => ({
      accountId: String(a.accountId),
      accountName: a.accountName || a.name || "", // ← 補上
      alias: a.accountName || a.name || "", // 仍保留 alias
      type: "same",
    }));
    if (!form.value.accountId && fromAccounts.value.length) {
      form.value.accountId = String(fromAccounts.value[0].accountId);
    }
  } catch (e) {
    console.error("載入帳戶失敗", e);
  }
}

const form = ref({
  accountId: "",
  transactionType: "內部轉帳",
  toAccountId: "",
  amount: null,
  when: "now", // 'now' | 'later'
  memo: "",
});

/* 狀態與計算 */
const activeTab = ref("saved"); // 'saved' | 'manual'
const payeeFilter = ref("all"); // 'all' | 'same' | 'fav'

const currentFrom = computed(() =>
  fromAccounts.value.find(
    (a) => String(a.accountId) === String(form.value.accountId)
  )
);
const filteredPayees = computed(() => {
  const f = payeeFilter.value;
  if (f === "same") return payees.value.filter((p) => p.type === "same");
  if (f === "fav") return payees.value.filter((p) => p.type === "fav");
  return payees.value;
});

const canProceed = computed(() => {
  const hasTo =
    !!form.value.toAccountId ||
    (activeTab.value === "manual" && form.value.bankCode);
  const hasAmt = Number(form.value.amount) > 0;
  const reserveOk =
    form.value.when === "now" ||
    (form.value.reserveDate && form.value.reserveTime);
  return !!form.value.accountId && hasTo && hasAmt && reserveOk;
});

/* 小工具 */
const nf = (n) => new Intl.NumberFormat("zh-TW").format(n || 0);

const selectedPayee = computed(() =>
  (payees.value || []).find(
    (p) => String(p.accountId) === String(form.value.toAccountId)
  )
);

function goConfirm() {
  if (!canProceed.value) return;

  // 若是 saved payee，沒填 bankCode 就幫補一下（本行可不送）
  if (activeTab.value === "saved" && selectedPayee.value) {
    form.value.bankCode ||= selectedPayee.value.bankCode || "";
  }
  step.value = 2;
}

const confirm = computed(() => {
  const dt =
    form.value.when === "now"
      ? formatDateTime
        ? formatDateTime(new Date())
        : new Date().toISOString().replace("T", " ").slice(0, 19)
      : `${form.value.reserveDate} ${form.value.reserveTime}`;

  const from =
    (currentFrom.value
      ? `${currentFrom.value.accountName || currentFrom.value.name || ""}（${
          currentFrom.value.accountId
        }）`
      : form.value.accountId) || "—";

  const bank = selectedPayee.value
    ? `${selectedPayee.value.bankName || "本行"}${
        selectedPayee.value.bankCode ? " " + selectedPayee.value.bankCode : ""
      }`
    : form.value.bankCode || "本行";

  const to = selectedPayee.value
    ? `${selectedPayee.value.accountName || selectedPayee.value.alias || ""}（${
        selectedPayee.value.accountId
      }）`
    : form.value.toAccountId || "—";

  return { dateTime: dt, from, bank, to };
});

async function onSubmit() {
  if (sending.value) return;
  try {
    sending.value = true;

    const payload = {
      accountId: String(form.value.accountId),
      toAccountId: String(form.value.toAccountId),
      transactionType: "內部轉帳",
      amount: Number(form.value.amount),
      memo: (form.value.memo || "").trim() || undefined,
    };

    const res = await request({
      url: "/account/transaction/internaltransfer", // ← 換成你的實際 API
      method: "PUT",
      data: payload,
    });

    console.log("轉帳成功", res);
    emit("update:modelValue", false); // 關掉 dialog
    step.value = 1; // 重置流程
  } catch (e) {
    console.error("轉帳失敗", e);
  } finally {
    sending.value = false;
  }
}
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
  width: min(96vw, 1100px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin: 0;
  max-height: calc(100vh - 12vh); /* 視窗變小時避免溢出 */
  overflow: auto; /* 內容可卷動 */

  /* ✨ 把CSS變數定義在面板本體 (scoped 也吃得到) */
  --brand: #ebb211;
  --accent: #ce1465;
  --ink: #222626;
  --line: #e5e7eb;
}

/* 關閉圓鈕（右上角） */
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  border: 1px solid var(--line, #e5e7eb);
}
:root {
  --brand: #ebb211; /* 黃 */
  --accent: #ce1465; /* 洋紅 */
  --ink: #222626; /* 深墨 */
  --line: #e5e7eb;
}

/* Stepper */
.stepper {
  padding: 30px 80px 0;
  background: #f8f8f4;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.track {
  height: 4px;
  background: #eef1f4;
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #ebb211;
}
.dots {
  display: flex;
  justify-content: space-between;
  padding: 8px 2px 12px;
}
.dot {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9aa0a6;
}
.dot span {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #cfd4dc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}
.dot em {
  font-style: normal;
  font-weight: 500;
}
.dot.active {
  color: #9aa0a6;
}

/* 內容區與欄位 */
.section {
  padding: 30px 80px 25px;
}
.field {
  display: grid;
  grid-template-columns: 120px 1fr;
  column-gap: 8px;
  align-items: start;
  margin: 10px 0 14px;
}
.label {
  grid-column: 1/2;
  margin: 10px 0 0;
  font-weight: 500;
  color: var(--ink);
}
.field-body {
  grid-column: 2/3;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 15px 15px;
  background: #fff;
  border: 1px solid var(--line, #e5e7eb);
}
.row select,
.row input {
  border: 0;
  outline: none;
  flex: 1;
  font-size: 16px;
}
.row-input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid var(--line, #e5e7eb);
}
.hint {
  color: #64748b;
  font-size: 13px;
  margin-top: 6px;
}
.subhint {
  color: #9aa0a6;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 400;
}
.prefix {
  font-weight: 700;
  color: #6b7280;
}

.fee-link {
  margin-left: 12px;
  font-size: 12px;
  color: #2c7a7b;
  text-decoration: underline;
}

/* 分段鈕 */
.seg {
  display: inline-flex;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1.5px solid var(--line, #e5e7eb);
}
.seg.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.seg-btn {
  padding: 10px 14px;
  background: #fff;
  border: 0;
  cursor: pointer;
  font-weight: 500;
  color: var(--ink);
}
.seg-btn.on {
  background: var(--brand);
  color: #fff;
}

/* Saved/Manual 容器與濾籤 */
.box {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  margin-top: 0px;
  border: 1px solid var(--line, #e5e7eb);
}
.mt-8 {
  margin-top: 8px;
}
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.pill {
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-weight: 500;
  border: 1px solid var(--line, #e5e7eb);
}
.pill.on {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgba(235, 178, 17, 0.16) inset;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.subfield {
  display: grid;
  row-gap: 6px;
}
.sub-label {
  font-weight: 500;
  color: #475569;
}
/* 只套在「手動輸入」區塊的兩個 input */
.box .grid-2 .subfield input {
  width: 100%;
  /* 高度感：用 padding 控制 */
  padding: 12px 2px 10px;
  min-height: 44px; /* 想再高就調大，例如 48/52 */
  font-size: 16px; /* iOS 免放大，字再清楚點 */

  /* 底線風格 */
  border: 0;
  border-bottom: 2px solid var(--line, #e5e7eb);
  border-radius: 0; /* 移除圓角，凸顯底線 */
  background: #fff;
  outline: none;
  transition: border-color 0.15s ease;
}

/* 聚焦狀態：底線與標籤變色 */
.box .grid-2 .subfield input:focus {
  border-bottom-color: var(--brand, #ebb211);
}
.box .grid-2 .subfield:focus-within .sub-label {
  color: var(--brand, #ebb211);
}

/* placeholder 顏色淡一點 */
.box .grid-2 .subfield input::placeholder {
  color: #94a3b8;
}

.ck {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #334155;
}
.seg-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
  color: #9aa0a6;
  pointer-events: none; /* 確保點不到 */
}
/* 底部動作 */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
.btn {
  appearance: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  border: 2px solid transparent;
}
.btn.primary {
  background: var(--brand);
  color: #fff;
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* RWD */
@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .field {
    grid-template-columns: 96px 1fr;
  }
}

.warn {
  background: #fff5e1;
  color: #a16207;
  border: 1px solid #fde68a;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-weight: 500;
}
.readonly {
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.ro-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  border-bottom: 1px dashed #eaecef;
}
.ro-row:last-child {
  border-bottom: 0;
}
.ro-row span {
  color: #6b7280;
}
.ro-row b {
  color: #525763;
  font-weight: 500;
}

/* 你已經有 .btn.primary；補一個 ghost */
.btn.ghost {
  background: #fff;
  color: #525763;
  border: 1px solid var(--line, #e5e7eb);
  margin-right: 10px;
}
</style>
