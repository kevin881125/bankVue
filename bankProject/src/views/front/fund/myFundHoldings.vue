<!-- 會員持有基金 myFundHoldings.vue - 更新後的樣式-->
<template>
  <div class="fund-holdings-container">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入持有基金資料中...</p>
    </div>

    <!-- 無持有基金 -->
    <div v-else-if="!holdings || holdings.length === 0" class="no-holdings">
      <div class="no-holdings-content">
        <i class="fas fa-chart-pie no-holdings-icon"></i>
        <h3>目前沒有持有基金</h3>
        <p>開始您的第一筆基金投資吧！</p>
      </div>
    </div>

    <!-- 有持有基金 -->
    <div v-else class="holdings-content">
      <!-- 基金清單 -->
      <div class="holdings-list">

        <div class="holdings-table">
          <div class="table-header">
            <div class="col-fundCode">基金代碼</div>
            <div class="col-fund">基金名稱</div>
            <div class="col-fundType">基金類型</div>
            <div class="col-riskType">風險等級</div>
            <div class="col-units">持有單位數</div>
            <div class="col-nav">淨值</div>
            <div class="col-value">市值</div>
            <div class="col-actions">操作</div>
          </div>

          <div class="table-body">
            <div v-for="holding in holdings" :key="holding.holdingId" class="table-row">
              <div class="col-fundCode" data-label="基金代碼">
                <span class="fund-code">{{ holding.fundCode || holding.fundId }}</span>
              </div>
              <div class="col-fund" data-label="基金名稱">
                <div class="fund-name">{{ holding.fundName || '未知基金' }}</div>
              </div>
              <div class="col-fundType" data-label="基金類型">
                <span class="fund-type">{{ getFundTypeLabel(holding.fund_type) }}</span>
              </div>
              <div class="col-riskType" data-label="風險等級">
                <span class="risk-level" :class="getRiskClass(holding.risk_level)">
                  {{ getRiskLevelText(holding.risk_level) }}
                </span>
              </div>
              <div class="col-units" data-label="持有單位數">
                <div class="units-info">
                  <div class="units">{{ formatNumber(holding.units) }}</div>
                  <div class="units-label">單位</div>
                </div>
              </div>

              <div class="col-nav" data-label="淨值">
                <div class="nav-info">
                  <div class="nav-price">{{ formatCurrency(holding.latestNav) }}</div>
                  <div class="nav-date">{{ formatDate(holding.navDate) }}</div>
                </div>
              </div>

              <div class="col-value" data-label="市值">
                <div class="market-value">{{ formatCurrency(calculateMarketValue(holding)) }}</div>
              </div>

              <div class="col-actions" data-label="操作">
                <div class="action-buttons">
                  <button class="btn-action btn-buy" @click="openTradeDialog(holding, 'buy')"
                    :disabled="!canBuyFund(holding.status)" title="申購">
                    <i class="fas fa-plus"></i>
                    申購
                  </button>
                  <button class="btn-action btn-sell" @click="openTradeDialog(holding, 'sell')"
                    :disabled="!canSellFund(holding)" title="贖回">
                    <i class="fas fa-minus"></i>
                    贖回
                  </button>
                  <button @click="viewDetails(holding)" class="btn-action btn-detail">
                    <i class="fas fa-info-circle"></i>
                    詳情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 交易彈窗 -->
      <div v-if="tradeDialogVisible && selectedFund" class="modal-overlay">
        <div class="modal trade-modal">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ tradeType === 'buy' ? '基金申購' : '基金贖回' }}
            </h3>
            <button class="modal-close" @click="closeTradeDialog">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="trade-info">
              <h4>{{ selectedFund.fundName }}</h4>
              <p class="fund-details">{{ selectedFund.fundCode }} | {{ getFundTypeLabel(selectedFund.fund_type) }}</p>
              <p class="fund-details">風險等級：{{ getRiskLevelText(selectedFund.risk_level) }}</p>
              <p class="nav-info">最新淨值：{{ formatCurrency(selectedFund.latestNav) }}</p>

              <!-- 申購資訊 -->
              <div v-if="tradeType === 'buy'">
                <p class="fee-info">申購手續費：{{ formatPercentage(selectedFund.buyFee) }}</p>
              </div>

              <!-- 贖回資訊 -->
              <div v-if="tradeType === 'sell'">
                <p class="holding-info">目前持有：{{ formatNumber(selectedFund.units) }} 單位</p>
                <p class="market-value-info">目前市值：{{ formatCurrency(calculateMarketValue(selectedFund)) }}</p>
              </div>
            </div>

            <!-- 申購表單 -->
            <div v-if="tradeType === 'buy'">
              <div class="form-group">
                <label class="form-label">申購金額 (元) <span class="required">*</span></label>
                <input type="number" v-model.number="tradeAmount" class="form-input" placeholder="請輸入申購金額" min="1000"
                  step="100" />
                <p class="form-help">最低申購金額：NT$ 1,000</p>
              </div>

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
                  <span class="units">{{ calculatedUnits.toFixed(2) }} 單位</span>
                </div>
              </div>
            </div>

            <!-- 贖回表單 -->
            <div v-if="tradeType === 'sell'">
              <div class="form-group">
                <label class="form-label">贖回方式 <span class="required">*</span></label>
                <div class="radio-group">
                  <label class="radio-item">
                    <input type="radio" v-model="sellType" value="units" name="sellType">
                    <span class="radio-label">按單位數贖回</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="sellType" value="all" name="sellType">
                    <span class="radio-label">全部贖回</span>
                  </label>
                </div>
              </div>

              <!-- 按單位數贖回 -->
              <div v-if="sellType === 'units'" class="form-group">
                <label class="form-label">贖回單位數 <span class="required">*</span></label>
                <input type="number" v-model.number="sellUnits" class="form-input" placeholder="請輸入贖回單位數"
                  :max="selectedFund.units" min="0.01" step="0.01" />
                <p class="form-help">可贖回單位數：{{ formatNumber(selectedFund.units) }} 單位</p>
              </div>

              <div class="sell-summary" v-if="(sellType === 'units' && sellUnits > 0) || sellType === 'all'">
                <h5>贖回試算</h5>
                <div class="summary-row">
                  <span>贖回單位數：</span>
                  <span class="units">{{ formatNumber(calculatedSellUnits) }} 單位</span>
                </div>
                <div class="summary-row total">
                  <span>實際入帳金額：</span>
                  <span class="total-amount">{{ formatCurrency(calculatedSellAmount) }}</span>
                </div>
                <div class="summary-row">
                  <span>剩餘持有單位：</span>
                  <span class="remaining-units">{{ formatNumber(remainingUnits) }} 單位</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeTradeDialog">取消</button>
            <button class="btn-primary" @click="executeTrade" :disabled="!isTradeValid || submitting">
              <template v-if="submitting">
                <span class="loading-spinner-small"></span> 處理中...
              </template>
              <template v-else>
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ tradeType === 'buy' ? '確認申購' : '確認贖回' }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/MemberStore'
import axios from 'axios'

const props = defineProps({
  fundAccId: { type: Number, default: null }
})

const router = useRouter()
const memberStore = useMemberStore()

const holdings = ref([])
const loading = ref(true)
const refreshing = ref(false)

const tradeDialogVisible = ref(false)
const selectedFund = ref(null)
const tradeType = ref('buy') // 'buy' 或 'sell'
const tradeAmount = ref(1000)
const sellType = ref('units') // 'units', 'all'
const sellUnits = ref(0)
const submitting = ref(false)

// 申購相關計算
const calculatedFee = computed(() => selectedFund.value ? (tradeAmount.value * (selectedFund.value.buyFee || 0)) / 100 : 0)
const actualInvestAmount = computed(() => tradeAmount.value - calculatedFee.value)
const calculatedUnits = computed(() => selectedFund.value?.latestNav ? actualInvestAmount.value / selectedFund.value.latestNav : 0)

// 贖回相關計算
const calculatedSellUnits = computed(() => {
  if (!selectedFund.value) return 0

  switch (sellType.value) {
    case 'units':
      return sellUnits.value || 0
    case 'all':
      return selectedFund.value.units || 0
    default:
      return 0
  }
})

const calculatedSellAmount = computed(() => {
  return calculatedSellUnits.value * (selectedFund.value?.latestNav || 0)
})

const remainingUnits = computed(() => {
  return (selectedFund.value?.units || 0) - calculatedSellUnits.value
})

// 交易驗證
const isTradeValid = computed(() => {
  if (tradeType.value === 'buy') {
    return tradeAmount.value > 0 && tradeAmount.value >= 1000
  } else {
    if (sellType.value === 'all') return true
    if (sellType.value === 'units') {
      return sellUnits.value > 0 && sellUnits.value <= (selectedFund.value?.units || 0)
    }
    return false
  }
})

const canBuyFund = (status) => status === 'OPEN' || status === '上架中'
const canSellFund = (holding) => (holding.status === 'OPEN' || holding.status === '上架中') && holding.units > 0

const openTradeDialog = (holding, type = 'buy') => {
  if (type === 'buy' && !canBuyFund(holding.status)) {
    alert('此基金目前無法申購')
    return
  }
  if (type === 'sell' && !canSellFund(holding)) {
    alert('此基金目前無法贖回或持有單位數為0')
    return
  }

  selectedFund.value = holding
  tradeType.value = type
  tradeAmount.value = 1000
  sellType.value = 'units'
  sellUnits.value = 0
  tradeDialogVisible.value = true
}

const closeTradeDialog = () => {
  tradeDialogVisible.value = false
  selectedFund.value = null
  tradeType.value = 'buy'
  tradeAmount.value = 1000
  sellType.value = 'units'
  sellUnits.value = 0
  submitting.value = false
}

const viewDetails = (holding) => router.push(`/yuzubank/fund/detail/${holding.fundId}`)

const fetchHoldings = async (fundAccId = null) => {
  try {
    loading.value = true
    let actualFundAccId = props.fundAccId || fundAccId
    if (!actualFundAccId) {
      const resp = await axios.get('http://localhost:8080/bank/fundAccount', { params: { mId: memberStore.memberInfo.mId } })
      actualFundAccId = resp.data?.fundAccId
      if (!actualFundAccId) { holdings.value = []; return }
    }

    const response = await axios.get('http://localhost:8080/bank/fundHoldings', { params: { fundAccId: actualFundAccId } })
    if (response.data) {
      if (Array.isArray(response.data)) holdings.value = response.data.map(processHoldingData)
      else if (Array.isArray(response.data.data)) holdings.value = response.data.data.map(processHoldingData)
      else if (Array.isArray(response.data.holdings)) holdings.value = response.data.holdings.map(processHoldingData)
      else if (typeof response.data === 'object') holdings.value = [processHoldingData(response.data)]
      else holdings.value = []
    } else holdings.value = []
  } catch (e) { console.error(e); holdings.value = [] }
  finally { loading.value = false }
}

const processHoldingData = (h) => ({
  holdingId: h.holdingId,
  fundAccId: h.fundAccId,
  fundId: h.fundId,
  units: parseFloat(h.units || 0),
  cost: parseFloat(h.cost || 0),
  fundCode: h.fundCode || 'N/A',
  fundName: h.fundName || '未知基金',
  fund_type: h.fund_type,
  risk_level: h.risk_level,
  buyFee: parseFloat(h.buyFee || 0),
  status: h.status,
  latestNav: parseFloat(h.latestNav || 0),
  navDate: h.navDate
})

const calculateMarketValue = (h) => parseFloat(h.latestNav || 0) * parseFloat(h.units || 0)
const calculateReturn = (h) => calculateMarketValue(h) - parseFloat(h.cost || 0)

const formatCurrency = (amount, showSign = false) => {
  if (amount == null || isNaN(amount) || amount === 0) return '---'
  const sign = showSign && amount > 0 ? '+' : ''
  return `${sign}NT$ ${Math.abs(amount).toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const formatNumber = (n) => {
  if (n == null || isNaN(n) || n === 0) return '---'
  return parseFloat(n).toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const formatPercentage = (p) => {
  if (p == null || isNaN(p) || p === 0) return '---'
  const sign = p > 0 ? '' : ''
  return `${sign}${(p || 0).toFixed(2)}%`
}

const formatDate = (d) => {
  if (!d) return '---'
  try {
    return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return '---'
  }
}

const getFundTypeLabel = (t) => {
  const typeMap = {
    'EQUITY': '股票型',
    'BOND': '債券型',
    'BALANCED': '平衡型',
    'MONEY_MARKET': '貨幣市場型',
    'INDEX': '指數型',
    'ETF': 'ETF',
    'REIT': '不動產型'
  }
  return typeMap[t] || t || 'N/A'
}

// 風險等級樣式和文字
const getRiskClass = (level) => {
  const classes = {
    1: 'risk-1',
    2: 'risk-2',
    3: 'risk-3',
    4: 'risk-4',
    5: 'risk-5'
  }
  return classes[level] || 'risk-1'
}

const getRiskLevelText = (level) => {
  const texts = {
    1: 'RR1',
    2: 'RR2',
    3: 'RR3',
    4: 'RR4',
    5: 'RR5'
  }
  return texts[level] || 'RR1'
}

// 執行交易
const executeTrade = async () => {
  if (!selectedFund.value || !isTradeValid.value) return

  submitting.value = true
  try {
    if (tradeType.value === 'buy') {
      // 執行申購
      await axios.post('http://localhost:8080/bank/fundTransaction/buy', {
        amount: tradeAmount.value,
        fundAccount: {
          fundAccId: props.fundAccId,
        },
        fund: {
          fundId: selectedFund.value.fundId,
        },
      })
      alert('申購成功')
    } else {
      // 執行贖回
      const sellData = {
        fundAccount: {
          fundAccId: props.fundAccId,
        },
        fund: {
          fundId: selectedFund.value.fundId,
        },
        sellType: sellType.value,
      }

      // 根據贖回類型添加相應參數
      if (sellType.value === 'units') {
        sellData.units = sellUnits.value
      } else if (sellType.value === 'all') {
        sellData.units = selectedFund.value.units
      }

      await axios.post('http://localhost:8080/bank/fundTransaction/sell', sellData)
      alert('贖回成功')
    }

    closeTradeDialog()
    await fetchHoldings()
  } catch (e) {
    console.error(e)
    alert(tradeType.value === 'buy' ? '申購失敗' : '贖回失敗')
  } finally {
    submitting.value = false
  }
}

onMounted(() => fetchHoldings())
watch(() => props.fundAccId, (n) => { if (n) fetchHoldings() })
</script>

<style scoped>
.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid white;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  animation: spin 1s linear infinite;
}

.fund-holdings-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 無持有基金狀態 */
.no-holdings {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.no-holdings-content {
  text-align: center;
  background: white;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.no-holdings-icon {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 20px;
}

.no-holdings-content h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.no-holdings-content p {
  color: #6c757d;
  margin-bottom: 30px;
}

/* 基金清單 */
.holdings-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

/* 表格樣式 */
.holdings-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 0.7fr 1fr 1.1fr 0.7fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 0.7fr 1fr 1.3fr 0.7fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

/* 各欄位樣式 - 參考申購基金樣式 */
.fund-code {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.fund-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-type {
  color: #007bff;
  font-weight: 500;
  font-size: 14px;
}

.risk-level {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  color: white;
  display: inline-block;
}

.risk-1 {
  background: #dcfce7;
  color: #166534;
}

.risk-2 {
  background: #fef3c7;
  color: #92400e;
}

.risk-3 {
  background: #fed7aa;
  color: #c2410c;
}

.risk-4 {
  background: #fecaca;
  color: #dc2626;
}

.risk-5 {
  background: #fce7f3;
  color: #be185d;
}

.units-info .units {
  font-weight: 600;
  color: #2c3e50;
}

.units-info .units-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.nav-info .nav-price {
  font-weight: 600;
  color: #28a745;
}

.nav-info .nav-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.market-value,
.return-amount {
  font-weight: 600;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.btn-buy {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.btn-buy:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.5);
}

.btn-sell {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-sell:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.5);
}

.btn-detail {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-detail:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.5);
}

.btn-action:disabled {
  background: #6c757d !important;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
  box-shadow: none !important;
}

/* 模態對話框樣式 */
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

/* 單選按鈕組 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.radio-item:hover {
  background: #f9fafb;
}

.radio-item input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.radio-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
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

.holding-info {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.market-value-info {
  color: #059669;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.trade-summary,
.sell-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.trade-summary h5,
.sell-summary h5 {
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

.remaining-units {
  color: #f59e0b;
  font-weight: 500;
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
</style>