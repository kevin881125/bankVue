<template>
  <!-- 原生 dialog，外部用 v-model 控制 -->
  <dialog ref="dlg" class="dlg" @click="onBackdrop">
    <div class="panel">
      <!-- 關閉（右上角白色圓鈕） -->
      <button class="close" aria-label="關閉" @click="close">×</button>

      <!-- 搜尋區 -->
      <section class="search">
        <label class="search__label">
          <span class="search__label-text">查詢日期</span>
          <div class="search__range">
            <span class="ico-cal" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M7 3v2M17 3v2M3 9h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <input type="date" v-model="startDate" />
            <span class="dash">—</span>
            <input type="date" v-model="endDate" />
          </div>
        </label>

        <button class="btn primary" @click="onSearch">查詢</button>
      </section>

      <div class="quick">
        <span class="quick-label">快速查詢：</span>
        <button class="chip" @click="onQuick('1d')">當日</button>
        <button class="chip" @click="onQuick('3d')">三天</button>
        <button class="chip" @click="onQuick('1w')">一周</button>
        <button class="chip" @click="onQuick('1m')">當月</button>
      </div>

      <!-- 摘要列 -->
      <div class="summary">
        帳戶：{{ accountId }} 幣別：NT 筆數：{{ total }} 筆
        <div class="spacer"></div>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>交易編號</th>
              <th>交易日期</th>
              <th class="center">交易類型</th>
              <th class="num">交易金額</th>
              <th class="num">餘額</th>
              <th>交易資訊</th>
              <th>交易結果</th>
              <th>備註</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.transactionId">
              <td>{{ row.transactionId }}</td>
              <td>{{ formatDateTime(row.txTime) }}</td>
              <td class="center">{{ row.transactionType }}</td>
              <td class="num">{{ money(row.amount) }}</td>
              <td class="num">{{ money(row.balanceAfter) }}</td>
              <td>{{ row.info }}</td>
              <td>{{ row.status }}</td>
              <td>{{ row.memo }}</td>
            </tr>
            <tr v-if="!transactionsList?.length">
              <td colspan="9" class="empty">無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div class="pager">
        <div class="perpage">
          Items per page：
          <select v-model.number="pageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>

        <div class="spacer"></div>

        <div class="range">{{ startIdx + 1 }}-{{ endIdx }} of {{ total }}</div>

        <div class="nav">
          <button class="icon" :disabled="page === 1" @click="page = 1">
            «
          </button>
          <button class="icon" :disabled="page === 1" @click="page--">‹</button>
          <button class="icon" :disabled="page === maxPage" @click="page++">
            ›
          </button>
          <button
            class="icon"
            :disabled="page === maxPage"
            @click="page = maxPage"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { formatDateOnly, formatDateTime } from "@/utils/DataUtil";

const transactionsList = ref([]);

/** Props 與 Emits（JS 版） */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  accountId: { type: [String, Number], default: null },
});

const emit = defineEmits(["update:modelValue"]);

/** 原生 dialog ref */
const dlg = ref(null);
/** 日期區間與動作 */
const startDate = ref("");
const endDate = ref("");

/** v-model 控制開關 */
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      dlg.value?.showModal?.();
      loadTransactionsRC(props.accountId);
      document.body.style.overflow = "hidden";
    } else {
      dlg.value?.close?.();
      document.body.style.overflow = "";
      // 關閉時清空資料
      transactionsList.value = [];
      startDate.value = "";
      endDate.value = "";
    }
  }
);
function close() {
  emit("update:modelValue", false);
}
function onBackdrop(e) {
  if (e.target === e.currentTarget) close();
}

function onQuick(type) {
  if (type === "tip") return;
  const now = new Date();
  const endD = now.toISOString().slice(0, 10);
  const s = new Date(now);
  if (type === "1d") s.setDate(s.getDate() - 1);
  if (type === "3d") s.setDate(s.getDate() - 3);
  if (type === "1w") s.setDate(s.getDate() - 7);
  if (type === "1m") s.setMonth(s.getMonth() - 1); // ← 修正為往前 1 個月
  startDate.value = s.toISOString().slice(0, 10);
  endDate.value = endD;
  console.log(startDate.value, endDate.value);

  loadTransactionsRC(props.accountId);
}

/** 點查詢：直接在子元件打 API */
function onSearch() {
  loadTransactionsRC(props.accountId);
}

/** 交易資料 */
watch(
  () => props.accountId,
  (newId) => {
    if (newId !== null && newId !== undefined && String(newId).trim() !== "") {
      loadTransactionsRC(newId);
    }
  },
  { immediate: true }
);

const loadTransactionsRC = async (id) => {
  try {
    const res = await request({
      url: "/account/transaction/getsuccesstxrecords",
      method: "GET",
      params: {
        accountId: id,
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
      },
    });
    transactionsList.value = (res || []).map((tx) => ({
      ...tx,
      info: `${tx.toBankCode || ""}-${tx.toAccountId || ""}`,
    }));
  } catch (error) {
    console.error("載入交易資料失敗", error);
  }
};
/** 表格與分頁 */
const page = ref(1);
const pageSize = ref(5);
const total = computed(() => (transactionsList.value || []).length);
const maxPage = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
);
watch([pageSize, transactionsList], () => {
  page.value = 1;
}); // 換 pagesize 或資料時回到第 1 頁

const startIdx = computed(() =>
  total.value ? (page.value - 1) * pageSize.value : 0
);
const endIdx = computed(() =>
  total.value ? Math.min(total.value, startIdx.value + pageSize.value) : 0
);
const pagedRows = computed(() =>
  (transactionsList.value || []).slice(startIdx.value, endIdx.value)
);

/** 顯示金額（NT 前綴） */
function money(n) {
  return `NT ${new Intl.NumberFormat("zh-TW").format(n || 0)}`;
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
}

/* 搜尋區塊 */
.search {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 24px 24px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}
.search__label {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 20px;
}
.search__label-text {
  font-weight: 700;
  color: #374151;
}
.search__range {
  display: grid;
  grid-template-columns: 24px 1fr auto 1fr;
  align-items: center;
  gap: 50px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}
.search__range input {
  border: 0;
  outline: none;
  font-size: 16px;
}
.ico-cal {
  color: #6b7280;
}
.dash {
  color: #9ca3af;
}

/* 快速查詢列 */
.quick {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px 16px;
  background: #f8fafc;
}
.quick-label {
  font-weight: 500;
  color: #374151;
}
.chip {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.btn.primary {
  background: #4c75ce;
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-weight: 500;
  cursor: pointer;
}

.spacer {
  flex: 1;
}

/* 摘要列 */
.summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

/* 表格 */
.table-wrap {
  padding: 0 16px 8px;
  overflow: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.table th {
  text-align: left;
  color: #6b7280;
  background: #fff;
  font-weight: 700;
}
.table td.num,
.table th.num {
  text-align: right;
}
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 0;
}

.table th,
.table td {
  padding: 12px 18px;
  border-bottom: 1px solid #e5e7eb;
} /* → 調大或調小第二個值 */

/* 表格：第三欄（交易類型）置中（保險：同時支援加 class 與 nth-child） */
.table th.center,
.table td.center {
  text-align: center;
}
.table th:nth-child(3),
.table td:nth-child(3) {
  text-align: center;
}
/* 分頁 */
.pager {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 16px;
}
.perpage select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.range {
  color: #6b7280;
}
.nav .icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}
.nav .icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
/* 讓表格整體視覺更居中一點 */
.table-wrap {
  margin: 0 auto;
}
</style>
