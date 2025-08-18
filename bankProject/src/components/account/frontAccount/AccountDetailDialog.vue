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
            <input type="date" v-model="start" />
            <span class="dash">—</span>
            <input type="date" v-model="end" />
          </div>
        </label>

        <button class="btn primary" @click="onSearch">查詢</button>
      </section>

      <div class="quick">
        <button class="link" @click="onQuick('tip')">快速查詢</button>
        <div class="spacer"></div>
        <button class="chip" @click="onQuick('3m')">三個月</button>
        <button class="chip" @click="onQuick('6m')">半年</button>
        <button class="chip" @click="onQuick('1y')">一年</button>
        <button class="chip" @click="onQuick('2y')">兩年</button>
      </div>

      <!-- 摘要列 -->
      <div class="summary">
        帳戶：{{ accountId }}
        <span v-if="accountType"> {{ accountType }} </span>
        幣別：{{ currency }} 筆數：{{ total }} 筆
        <div class="spacer"></div>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>交易編號</th>
              <th>交易日期</th>
              <th>交易類型</th>
              <th class="num">交易金額</th>
              <th class="num">餘額</th>
              <th>交易資訊</th>
              <th>交易結果</th>
              <th>備註</th>
              <th>操作人員</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.txId">
              <td>{{ row.txId }}</td>
              <td>{{ row.txTime }}</td>
              <td>{{ row.txType }}</td>
              <td class="num">{{ money(row.amount) }}</td>
              <td class="num">{{ money(row.balance) }}</td>
              <td>{{ row.remark }}</td>
              <td>{{ row.status }}</td>
              <td>{{ row.note }}</td>
              <td>{{ row.operatorId }}</td>
            </tr>
            <tr v-if="!rows?.length">
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

<script setup lang="ts">
import { ref, watch, computed } from "vue";

/** Props 與 v-model（開關） */
const props = defineProps<{
  modelValue: boolean;
  accountId: string;
  currency: string;
  accountType?: string;
  rows: Array<{
    txId: string;
    txTime: string;
    txType: string;
    amount: number;
    balance: number;
    remark: string;
    status: string;
    note?: string;
    operatorId?: number | string;
  }>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (
    e: "search",
    payload: { start?: string; end?: string; quick?: "3m" | "6m" | "1y" | "2y" }
  ): void;
}>();

/** 原生 dialog ref */
const dlg = ref<HTMLDialogElement | null>(null);

/** v-model 控制開關 */
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      dlg.value?.showModal?.();
      document.body.style.overflow = "hidden";
    } else {
      dlg.value?.close?.();
      document.body.style.overflow = "";
    }
  }
);
function close() {
  emit("update:modelValue", false);
}
function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) close();
}

/** 日期區間與動作 */
const start = ref<string>("");
const end = ref<string>("");

function onSearch() {
  emit("search", {
    start: start.value || undefined,
    end: end.value || undefined,
  });
}
function onQuick(type: "3m" | "6m" | "1y" | "2y" | "tip") {
  if (type === "tip") return;
  const now = new Date();
  const endD = now.toISOString().slice(0, 10);
  const s = new Date(now);
  if (type === "3m") s.setMonth(s.getMonth() - 3);
  if (type === "6m") s.setMonth(s.getMonth() - 6);
  if (type === "1y") s.setFullYear(s.getFullYear() - 1);
  if (type === "2y") s.setFullYear(s.getFullYear() - 2);
  start.value = s.toISOString().slice(0, 10);
  end.value = endD;
  emit("search", { start: start.value, end: end.value, quick: type });
}

/** 表格與分頁 */
const page = ref(1);
const pageSize = ref(5);
const total = computed(() => props.rows?.length ?? 0);
const maxPage = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
);
watch([pageSize, () => props.rows], () => {
  page.value = 1;
}); // 換 pagesize 或 rows 時回到第 1 頁

const startIdx = computed(() =>
  total.value ? (page.value - 1) * pageSize.value : 0
);
const endIdx = computed(() =>
  total.value ? Math.min(total.value, startIdx.value + pageSize.value) : 0
);
const pagedRows = computed(() =>
  (props.rows || []).slice(startIdx.value, endIdx.value)
);

/** 顯示金額（NT 前綴） */
function money(n: number) {
  return `NT ${new Intl.NumberFormat("zh-TW").format(n || 0)}`;
}
</script>

<style scoped>
/* 外層對話框 */
.dlg {
  border: 0;
  padding: 0;
  width: min(96vw, 1280px);
}
.dlg::backdrop {
  background: rgba(0, 0, 0, 0.55);
}

/* 內層白色面板 */
.panel {
  position: relative;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin: 32px;
  overflow: hidden;
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
  gap: 12px;
}
.search__label-text {
  font-weight: 700;
  color: #374151;
}
.search__range {
  display: grid;
  grid-template-columns: 24px 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}
.search__range input {
  border: 0;
  outline: none;
  font-size: 14px;
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
.link {
  background: transparent;
  border: 0;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}
.chip {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.btn.primary {
  background: #2563eb;
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.btn.ghost {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
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
.table th,
.table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e5e7eb;
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
</style>
