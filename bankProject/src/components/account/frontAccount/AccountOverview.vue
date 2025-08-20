<template>
  <div class="container">
    <!-- 概覽 -->
    <section class="card mb-24">
      <header class="card-title row center">
        <div class="subtitle">臺幣帳戶總覽</div>
      </header>
      <div class="divider"></div>
      <!-- 有帳戶：顯示餘額 + 回饋報告 -->
      <div v-if="hasTwdAccount" class="overview">
        <!-- 左：帳戶餘額 -->
        <div class="balance-block">
          <div class="title-row">
            <span class="title">臺幣帳戶總額</span>
            <button
              class="icon-btn"
              :title="showAmount ? '隱藏金額' : '顯示金額'"
              @click="showAmount = !showAmount"
            >
              <!-- 眼睛 / 遮眼 SVG -->
              <!-- 小眼睛圖示（SVG，不用套件） -->
              <svg
                v-if="showAmount"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
                  stroke="#0ea5a8"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#0ea5a8"
                  stroke-width="1.6"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 3l18 18"
                  stroke="#0ea5a8"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M10.6 6.1A11 11 0 0 1 12 6c6.5 0 10 6 10 6a18.2 18.2 0 0 1-5.1 5.1M6.2 8.2C4 9.7 2 12 2 12s3.5 6 10 6c1 0 2-.1 3-.4"
                  stroke="#0ea5a8"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#0ea5a8"
                  stroke-width="1.6"
                />
              </svg>
            </button>
          </div>

          <div class="amount">
            {{ showAmount ? formatCurrency(totalTWD) : "••••" }}
          </div>
        </div>

        <!-- 右：回饋報告 -->
        <div class="report-block">
          <div class="report-title">
            {{ monthLabel }} 回饋報告
            <span class="qmark" title="當月免費次數與利息累計（示意數）"
              >？</span
            >
          </div>

          <div class="report-grid">
            <div class="item">
              <div class="value">{{ perks.freeTransfers }}</div>
              <div class="label">免費跨轉</div>
            </div>
            <div class="vline" aria-hidden="true"></div>
            <div class="item">
              <div class="value">{{ perks.freeWithdrawals }}</div>
              <div class="label">免費跨提</div>
            </div>
            <div class="vline" aria-hidden="true"></div>
            <div class="item">
              <div class="value">{{ formatCurrency(perks.interestTotal) }}</div>
              <div class="label">累計利息(約)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 沒帳戶：標題 + 置中 CTA -->
      <div v-else class="overview no-account">
        <div class="balance-block">
          <div class="title-row"><span class="title">臺幣帳戶總額</span></div>
        </div>

        <!-- 橫跨整列並置中 -->
        <div class="cta-center">
          <button
            class="apply-button"
            @click="$router.push('/yuzubank/openAccount')"
          >
            我要開戶
          </button>
        </div>
      </div>
    </section>

    <!-- 活期存款清單（TWD） -->
    <section class="card mb-16">
      <header class="card-title row center">
        <div class="subtitle">活期存款</div>
        <span class="chip dark ml-8">幣別：TWD</span>
      </header>

      <div class="divider"></div>

      <div class="card-body">
        <div v-if="!twdAccounts.length" class="empty">
          <p class="mb-12">目前沒有臺幣帳戶</p>
        </div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>帳戶別名</th>
                <th class="num">帳戶餘額</th>
                <th class="num">可用餘額</th>
                <th class="end">功能</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in twdAccounts" :key="item.accountId">
                <td>
                  <div class="cell-account">
                    <i
                      class="mdi mdi-fruit-pear bank-icon"
                      aria-hidden="true"
                    ></i>
                    <div class="col">
                      <div class="name">
                        {{ item.accountName || item.type }}
                      </div>
                      <a
                        href="#"
                        class="acct"
                        @click.prevent="openDetailDialog(item.accountId)"
                        >{{ item.accountId }}</a
                      >
                    </div>
                  </div>
                </td>
                <td class="num">{{ formatCurrency(item.balance) }}</td>
                <td class="num">{{ formatCurrency(item.balance) }}</td>
                <td class="end">
                  <button class="txbutton" @click="openTranserDialog(item)">
                    轉帳
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 說明（與截圖一致） -->
    <section class="note-card">
      <div class="note-header">
        <span class="note-title">說明</span>
        <button class="note-toggle" @click="noteOpen = !noteOpen">
          {{ noteOpen ? "—" : "+" }}
        </button>
      </div>

      <div v-show="noteOpen" class="note-body">
        <ol class="note-list">
          <li>點選活期存款帳戶號碼可查詢近 30 日交易明細。</li>
          <li>
            「帳戶餘額」包含本交金額（本日交換支票金額）、特約商店尚未請款之簽帳金融卡消費金額與圈存金額；不含透支金額（使用簽帳金融卡簽帳消費但特約商店尚未請款之金額，該款項之權利於簽帳消費之同時即已移轉予特約商店，故您無法提領該筆款項）。
          </li>
          <li>
            「可用餘額」包含透支金額，不含本交金額、簽帳金融卡簽帳消費但特約商店尚未請款之金額與圈存金額。
          </li>
          <li>
            若您帳戶已辦理銷戶，該帳戶之金融卡於銷戶後即無法使用，系統將於銷戶次日自動刪除該筆帳號資料。
          </li>
          <li>點選定期存款帳號可查詢「存單明細」、「領息明細」。</li>
        </ol>
      </div>
    </section>
  </div>

  <AccountDetailDialog
    v-model="detailDialog"
    :account-id="selectedAccountId"
    @close="detailDialog = false"
  >
  </AccountDetailDialog>

  <TradeDialog
    v-model="tradeDialog"
    :account-id="selectedAccountId"
    :m-id="selectedmId"
    @close="tradeDialog = false"
    @submit="refreshAccounts()"
  >
  </TradeDialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import AccountDetailDialog from "./AccountDetailDialog.vue";
import TradeDialog from "./TradeDialog.vue";

const memberStore = useMemberStore();
const mId = memberStore.mId;
const noteOpen = ref(true);
const detailDialog = ref(false);
const tradeDialog = ref(false);
const selectedAccountId = ref("");
const selectedmId = ref("");

// 顯示/隱藏金額
const showAmount = ref(true);

const hasTwdAccount = computed(() => twdAccounts.value.length > 0);

const memberAccounts = ref([]);

const twdAccounts = computed(() =>
  memberAccounts.value.filter((a) => a.currency === "NT")
);
console.log("twdAccounts:" + twdAccounts.value);

const totalTWD = computed(() =>
  twdAccounts.value.reduce((s, a) => s + (a.balance || 0), 0)
);

// 回饋報告數值（先放靜態，之後可從 API 取）
const perks = ref({
  freeTransfers: 5,
  freeWithdrawals: 5,
  interestTotal: 0,
});
const monthLabel = computed(() => {
  const d = new Date();
  return `${d.getMonth() + 1}月`;
});

function formatCurrency(n) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

// 刷新資料
const refreshAccounts = async () => {
  try {
    memberAccounts.value = await request({
      url: "/account/getmemberaccounts/" + mId,
      method: "GET",
    });

    console.log(memberAccounts.value);
  } catch (error) {
    console.error("載入帳戶失敗", error);
  }
};

// 掛載時取資料
onMounted(refreshAccounts);

const openDetailDialog = (accountId) => {
  selectedAccountId.value = accountId;
  console.log("開啟帳戶明細對話框，帳戶ID:", accountId);
  detailDialog.value = true;
};

const openTranserDialog = (item) => {
  console.log("開啟轉帳對話框，帳戶:", item);
  selectedAccountId.value = item.accountId;
  selectedmId.value = item.mId;
  tradeDialog.value = true;
};
</script>

<style scoped>
/* 讓 CTA 橫跨整個 grid 並水平置中 */
.overview.no-account .cta-center {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 72px; /* 可調，讓卡片看起來不會太扁 */
}

/* 行動裝置時也無腦置中（已有一欄時也適用） */
@media (max-width: 960px) {
  .overview.no-account .cta-center {
    min-height: 64px;
  }
}

/* 基礎 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif;
}
.mb-24 {
  margin-bottom: 24px;
}
.mb-16 {
  margin-bottom: 16px;
}
.ml-8 {
  margin-left: 8px;
}
.row {
  display: flex;
  align-items: center;
}
.center {
  align-items: center;
}
.spacer {
  flex: 1;
}

/* 卡片 */
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.card-title {
  padding: 14px 16px;
  font-weight: 600;
}
.card-body {
  padding: 16px;
}
.divider {
  height: 1px;
  background: #e5e7eb;
}

/* 概覽區 */
.overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 16px;
}
.balance-block .title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.icon-btn {
  border: 0;
  background: transparent;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
}
.icon-btn:hover {
  background: #f0fdfd;
}
.amount {
  font-size: 40px;
  font-weight: 800;
  margin: 8px 0 10px;
}

.qmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0ea5a8;
  color: #fff;
  font-size: 12px;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  align-items: center;
  background: #fff;
}
.vline {
  width: 1px;
  height: 56px;
  background: #e5e7eb;
  justify-self: center;
}
.item {
  text-align: center;
}
.value {
  font-size: 36px;
  font-weight: 800;
}
.label {
  color: #6b7280;
  margin-top: 4px;
}

/* 標籤/按鈕/表格（沿用舊版） */
.chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
}
.chip.dark {
  background: #4b5563;
  color: #fff;
}

.btn {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  color: #111827;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn.outline {
  border-color: #2563eb;
  color: #2563eb;
  background: #fff;
}
.btn.link {
  color: #2563eb;
  padding-left: 0;
  padding-right: 0;
}

.table-wrap {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}
.table th,
.table td {
  padding: 12px 18px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}
.table th {
  text-align: left;
  color: #6b7280;
  font-weight: 600;
  font-size: 18px;
  background: #fafafa;
}
.table td.num,
.table th.num {
  text-align: right;
  font-size: 18px;
}
.table td.end,
.table th.end {
  text-align: right;
}

.cell-account {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bank-icon {
  font-size: 25px;
}
.name {
  font-size: 20px;
  font-weight: 500;
}
.acct {
  font-size: 18px;
  color: #8b8c8d;
  text-decoration: none;
}
.acct:hover {
  text-decoration: underline;
}

.empty {
  text-align: center;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.apply-button {
  margin-top: 40px; /* 與步驟分開 */
  background-color: #ebb211;
  font-size: 16px;
  color: #ffffff;
  padding: 16px 32px;
  text-decoration: none;
  border: none;
  border-radius: 32px;
}

.txbutton {
  background: transparent; /* 預設透明 */
  color: #ebb211; /* 文字黑色 */
  border: 2px solid #ebb211; /* 外框用品牌色 */
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

/* 滑過 / 聚焦：填滿顏色、文字白色 */
.txbutton:hover,
.txbutton:focus-visible {
  background-color: #ebb211;
  color: #fff;
  box-shadow: 0 4px 14px rgba(235, 178, 17, 0.35);
  outline: none;
}

.bank-icon {
  font-size: 30px;
  color: #16a34a;
  vertical-align: -2px;
}

/* 說明卡片樣式（與截圖一致） */
.note-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 16px;
}
.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.note-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}
.note-toggle {
  appearance: none;
  border: 0;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
}
.note-toggle:hover {
  color: #111827;
}

.note-body {
  padding: 16px;
}
.note-list {
  margin: 0;
  padding-left: 20px; /* 編號縮排 */
  color: #374151; /* 次要灰 */
  line-height: 1.9; /* 與截圖相近的行高 */
  font-size: 14px;
}
.note-list li {
  margin: 4px 0;
}

@media (max-width: 960px) {
  .overview {
    grid-template-columns: 1fr;
  }
  .value {
    font-size: 30px;
  }
  .amount {
    font-size: 36px;
  }
}
</style>
