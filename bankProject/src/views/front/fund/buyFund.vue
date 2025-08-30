<template>
  <div class="fund-management-page">

    <!-- 操作區 -->
    <div class="action-bar">
      <div class="search-box">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchKeyword" type="text" placeholder="搜尋基金名稱或代碼..." class="search-input" />
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-card-primary">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">可申購基金</div>
          <div class="stat-value">{{ availableFundsCount }}</div>
        </div>
      </div>

      <div class="stat-card stat-card-success">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">總基金檔數</div>
          <div class="stat-value">{{ funds.length }}</div>
        </div>
      </div>

      <div class="stat-card stat-card-warning">
        <div class="stat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">平均手續費</div>
          <div class="stat-value">{{ averageBuyFee }}%</div>
        </div>
      </div>
    </div>

    <!-- 基金清單表格 -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="fund-table">
          <thead>
            <tr>
              <th>基金代碼</th>
              <th>基金名稱</th>
              <th>基金類型</th>
              <th>風險等級</th>
              <th>最新淨值</th>
              <th>淨值日期</th>
              <th>手續費</th>
              <th>狀態</th>
              <th>申購</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fund in filteredFunds" :key="fund.fundId" class="table-row">
              <td class="fund-code">{{ fund.fundCode || 'N/A' }}</td>
              <td class="fund-name">{{ fund.fundName || '未知基金' }}</td>
              <td class="fund-type">{{ getFundTypeLabel(fund.fundType) }}</td>
              <td class="risk-level">
                <span :class="getRiskLevelClass(fund.riskLevel)">
                  {{ getRiskLevelText(fund.riskLevel) }}
                </span>
              </td>
              <td class="nav-price">{{ formatCurrency(fund.latestNav) }}</td>
              <td class="nav-date">{{ formatDate(fund.navDate) }}</td>
              <td class="buy-fee">{{ formatPercentage(fund.buyFee) }}</td>
              <td class="status">
                <span :class="getStatusClass(fund.status)">
                  {{ getStatusText(fund.status) }}
                </span>
              </td>
              <td class="actions">
                <div class="action-buttons">
                  <button class="btn-buy" @click="openTradeDialog(fund, 'buy')" :disabled="!canBuyFund(fund.status)"
                    title="申購">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空狀態 -->
      <div v-if="filteredFunds.length === 0 && !loading" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="empty-title">沒有找到基金</p>
        <p class="empty-subtitle">{{ searchKeyword ? '試試其他搜尋關鍵字' : '基金資料載入中或暫無基金' }}</p>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>載入基金清單中...</p>
      </div>
    </div>

    <!-- 交易彈窗 -->
    <div v-if="tradeDialogVisible" class="modal-overlay">
      <div class="modal trade-modal">
        <div class="modal-header">
          <h3 class="modal-title">基金申購</h3>
          <button class="modal-close" @click="tradeDialogVisible = false">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="trade-info">
            <h4>{{ selectedFund.fundName }}</h4>
            <p class="fund-details">{{ selectedFund.fundCode }} | {{ getFundTypeLabel(selectedFund.fundType) }}</p>
            <p class="fund-details">風險等級：{{ getRiskLevelText(selectedFund.riskLevel) }}</p>
            <p class="nav-info">最新淨值：{{ formatCurrency(selectedFund.latestNav) }}</p>
            <p class="fee-info">手續費：{{ formatPercentage(selectedFund.buyFee) }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">申購金額 (元) <span class="required">*</span></label>
            <input type="number" v-model.number="tradeAmount" class="form-input" placeholder="請輸入申購金額" min="1000"
              step="100" />
            <p class="form-help">建議最低申購金額：NT$ 1,000</p>
          </div>

          <!-- 費用試算 -->
          <div class="trade-summary" v-if="tradeAmount > 0">
            <h5>費用試算</h5>
            <div class="summary-row">
              <span>申購金額：</span>
              <span class="amount">{{ formatCurrency(tradeAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>手續費：</span>
              <span class="fee">{{ formatCurrency(calculatedFee) }}</span>
            </div>
            <div class="summary-row total">
              <span>實際投資金額：</span>
              <span class="total-amount">{{ formatCurrency(actualInvestAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>可購得單位數（概估）：</span>
              <span class="units">{{ calculatedUnits }} 單位</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="tradeDialogVisible = false">取消</button>
          <button class="btn-primary" @click="executeTrade" :disabled="!tradeAmount || tradeAmount <= 0 || submitting">
            <div v-if="submitting" class="loading"></div>
            <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ submitting ? '處理中...' : '確認申購' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const funds = ref([]);
const searchKeyword = ref('');
const loading = ref(false);
const submitting = ref(false);

const props = defineProps({
  fundAccId: {
    type: Number,
    required: true
  }
});

const apiUrl = "http://localhost:8080/bank/fund";

// 交易彈窗相關
const tradeDialogVisible = ref(false);
const selectedFund = ref({});
const tradeAmount = ref(0);

// 計算屬性
const availableFundsCount = computed(() => {
  return funds.value.filter(fund => canBuyFund(fund.status)).length;
});

const averageBuyFee = computed(() => {
  if (funds.value.length === 0) return '0.00';
  const totalFee = funds.value.reduce((sum, fund) => sum + (parseFloat(fund.buyFee) || 0), 0);
  return (totalFee / funds.value.length).toFixed(2);
});

const filteredFunds = computed(() => {
  if (!searchKeyword.value) return funds.value;

  const keyword = searchKeyword.value.toLowerCase();
  return funds.value.filter(fund =>
    fund.fundName?.toLowerCase().includes(keyword) ||
    fund.fundCode?.toLowerCase().includes(keyword) ||
    fund.fundType?.toLowerCase().includes(keyword)
  );
});

// 費用計算
const calculatedFee = computed(() => {
  if (!tradeAmount.value || !selectedFund.value.buyFee) return 0;
  return tradeAmount.value * (parseFloat(selectedFund.value.buyFee) / 100);
});

const actualInvestAmount = computed(() => {
  return tradeAmount.value - calculatedFee.value;
});

const calculatedUnits = computed(() => {
  if (!actualInvestAmount.value || !selectedFund.value.latestNav) return '0';
  const units = actualInvestAmount.value / parseFloat(selectedFund.value.latestNav);
  return units.toFixed(4);
});

// 載入基金清單
const fetchFunds = async () => {
  try {
    loading.value = true;
    const res = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('基金清單 API 回應:', res.data);

    // 處理不同的回應格式
    if (res.data) {
      if (Array.isArray(res.data)) {
        funds.value = res.data.map(fund => processFundData(fund));
      } else if (res.data.data && Array.isArray(res.data.data)) {
        funds.value = res.data.data.map(fund => processFundData(fund));
      } else if (res.data.funds && Array.isArray(res.data.funds)) {
        funds.value = res.data.funds.map(fund => processFundData(fund));
      } else {
        funds.value = [];
      }
    } else {
      funds.value = [];
    }

    console.log('處理後的基金資料:', funds.value);
  } catch (error) {
    console.error('載入基金清單失敗:', error);
    funds.value = [];
  } finally {
    loading.value = false;
  }
};

// 處理基金資料 - 對應 FundDto 結構
const processFundData = (fund) => {
  return {
    fundId: fund.fundId,
    fundCode: fund.fundCode || 'N/A',
    fundName: fund.fundName || '未知基金',
    latestNav: parseFloat(fund.latestNav || 0),
    navDate: fund.latestNavDate,
    fundType: fund.fundType,
    riskLevel: fund.riskLevel || 1,
    buyFee: parseFloat(fund.buyFee || 0),
    status: fund.status || 'UNKNOWN'
  };
};

// 格式化函數
const formatDate = (dateTime) => {
  if (!dateTime) return "N/A";
  try {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return "N/A";
  }
};

const formatCurrency = (amount) => {
  if (!amount || amount === 0 || isNaN(amount)) return 'NT$ 0';
  return 'NT$ ' + Number(amount).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0.00%';
  }
  return parseFloat(percentage).toFixed(2) + '%';
};

// 基金類型標籤轉換
const getFundTypeLabel = (fundType) => {
  const typeMap = {
    'EQUITY': '股票型',
    'BOND': '債券型',
    'BALANCED': '平衡型',
    'MONEY_MARKET': '貨幣市場型',
    'INDEX': '指數型',
    'ETF': 'ETF',
    'REIT': '不動產型'
  };
  return typeMap[fundType] || fundType || 'N/A';
};

// 風險等級樣式和文字
const getRiskLevelClass = (level) => {
  const classes = {
    1: 'risk-level-1',
    2: 'risk-level-2',
    3: 'risk-level-3',
    4: 'risk-level-4',
    5: 'risk-level-5'
  };
  return classes[level] || 'risk-level-1';
};

const getRiskLevelText = (level) => {
  const texts = {
    1: 'RR1',
    2: 'RR2',
    3: 'RR3',
    4: 'RR4',
    5: 'RR5'
  };
  return texts[level] || 'RR1';
};

// 狀態樣式和文字
const getStatusClass = (status) => {
  const statusMap = {
    'OPEN': 'status-open',
    'CLOSED': 'status-closed',
    '上架中': 'status-open',
    '已下架': 'status-closed'
  };
  return statusMap[status] || 'status-unknown';
};

const getStatusText = (status) => {
  const statusMap = {
    'OPEN': '可申購',
    'CLOSED': '已停售',
    '上架中': '可申購',
    '已下架': '已停售'
  };
  return statusMap[status] || status || '未知狀態';
};

// 判斷基金是否可申購
const canBuyFund = (status) => {
  return status === 'OPEN' || status === '上架中';
};

// 交易彈窗操作
const openTradeDialog = (fund) => {
  if (!canBuyFund(fund.status)) {
    alert('此基金目前無法申購');
    return;
  }

  selectedFund.value = fund;
  tradeAmount.value = 1000; // 設定預設金額
  tradeDialogVisible.value = true;
};

const executeTrade = async () => {
  if (!tradeAmount.value || tradeAmount.value <= 0) {
    alert("請輸入有效的申購金額");
    return;
  }

  if (tradeAmount.value < 1000) {
    alert("申購金額不能低於 NT$ 1,000");
    return;
  }

  try {
    submitting.value = true;

    const payload = {
      amount: tradeAmount.value,
      fundAccount: {
        fundAccId: props.fundAccId,
      },
      fund: {
        fundId: selectedFund.value.fundId,
      },
    };

    console.log('申購請求 payload:', payload);

    const response = await axios.post(`${apiUrl}Transaction/buy`, payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('申購回應:', response.data);
    alert("申購成功！");
    tradeDialogVisible.value = false;

    // 重置表單
    tradeAmount.value = 0;

  } catch (error) {
    console.error('申購失敗:', error);
    let errorMessage = "申購失敗";

    if (error.response?.data?.message) {
      errorMessage += "：" + error.response.data.message;
    } else if (error.response?.status === 400) {
      errorMessage += "：請求參數錯誤";
    } else if (error.response?.status === 500) {
      errorMessage += "：系統錯誤，請稍後再試";
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage += "：無法連接到後端服務";
    } else {
      errorMessage += "：" + error.message;
    }

    alert(errorMessage);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchFunds();
});
</script>

<style scoped>
/* 基礎樣式 */
.fund-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* 統計卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.stat-card-primary {
  border-left-color: #3b82f6;
}

.stat-card-success {
  border-left-color: #10b981;
}

.stat-card-warning {
  border-left-color: #f59e0b;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-card-primary .stat-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-card-success .stat-icon {
  background: #f0fdf4;
  color: #10b981;
}

.stat-card-warning .stat-icon {
  background: #fefbf3;
  color: #f59e0b;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

/* 操作區 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  max-width: 400px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 按鈕樣式 */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

/* 表格容器 */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.fund-table {
  width: 100%;
  border-collapse: collapse;
}

.fund-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.fund-table td {
  padding: 1rem 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row:hover {
  background: #f8fafc;
}

.fund-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
}

.fund-name {
  font-weight: 500;
  color: #1f2937;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fund-type {
  color: #6b7280;
}

.nav-price {
  font-weight: 600;
  color: #059669;
}

.nav-date {
  color: #6b7280;
  font-size: 0.8rem;
}

/* 風險等級樣式 */
.risk-level-1,
.risk-level-2,
.risk-level-3,
.risk-level-4,
.risk-level-5 {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.risk-level-1 {
  background: #dcfce7;
  color: #166534;
}

.risk-level-2 {
  background: #fef3c7;
  color: #92400e;
}

.risk-level-3 {
  background: #fed7aa;
  color: #c2410c;
}

.risk-level-4 {
  background: #fecaca;
  color: #dc2626;
}

.risk-level-5 {
  background: #fce7f3;
  color: #be185d;
}

/* 狀態樣式 */
.status-open,
.status-closed,
.status-unknown {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-open {
  background: #dcfce7;
  color: #166534;
}

.status-closed {
  background: #fee2e2;
  color: #dc2626;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* 操作按鈕 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-buy {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0fdf4;
  color: #16a34a;
}

.btn-buy:hover:not(:disabled) {
  background: #dcfce7;
  transform: scale(1.1);
}

.btn-buy:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-buy svg {
  width: 1rem;
  height: 1rem;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin: 0 auto 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 彈窗樣式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.trade-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-close svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  border-top: 1px solid #f3f4f6;
  background: #f8fafc;
}

/* 表單樣式 */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc2626;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* 交易資訊 */
.trade-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.trade-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.fund-details {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.nav-info {
  color: #059669;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.fee-info {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.trade-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.trade-summary h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.amount,
.fee {
  color: #6b7280;
}

.total-amount {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.units {
  color: #059669;
  font-weight: 500;
}

/* 載入狀態按鈕 */
.loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fund-management-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .modal {
    max-width: none;
    margin: 0;
    border-radius: 0;
    height: 100vh;
  }

  .fund-table th,
  .fund-table td {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .fund-name {
    max-width: 150px;
  }
}

@media (max-width: 640px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .table-wrapper {
    font-size: 0.75rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fund-table tbody tr {
  animation: fadeIn 0.3s ease-out;
}

.modal {
  animation: fadeIn 0.2s ease-out;
}
</style>