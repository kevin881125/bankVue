<template>
  <div class="fund-transaction-container">
    <!-- 載入遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <span class="mdi mdi-loading mdi-spin"></span>
        <p>載入中...</p>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="error" class="error-message">
      <span class="mdi mdi-alert-circle"></span>
      <div>
        <h3>載入失敗</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button class="btn btn-primary" @click="refreshData">重新載入</button>
        </div>
      </div>
    </div>

    <!-- 頁面標題和操作區 -->
    <div class="header-section">
      <div class="title-area">
        <h1 class="page-title">基金交易管理</h1>
        <p class="page-subtitle">管理基金申購、贖回交易記錄</p>
      </div>
      <div class="action-buttons">
        <button class="btn btn-primary" @click="openNewTransactionModal">
          <span class="mdi mdi-plus"></span>
          新增交易
        </button>
        <button class="btn btn-outline" @click="refreshData" :disabled="loading">
          <span class="mdi mdi-refresh" :class="{ 'mdi-spin': loading }"></span>
          重新整理
        </button>
      </div>
    </div>

    <!-- 篩選和搜尋區 -->
    <div class="filter-section">
      <div class="search-box">
        <span class="mdi mdi-magnify search-icon"></span>
        <input type="text" v-model="searchTerm" @input="debouncedSearch" placeholder="搜尋客戶姓名、基金名稱或交易編號"
          class="search-input" />
      </div>

      <div class="filter-controls">
        <select v-model="selectedTransactionType" @change="applyClientSideFilters" class="filter-select">
          <option value="">所有交易類型</option>
          <option value="申購">申購</option>
          <option value="贖回">贖回</option>
        </select>

        <select v-model="selectedStatus" @change="applyClientSideFilters" class="filter-select">
          <option value="">所有狀態</option>
          <option value="交易成功">交易成功</option>
          <option value="待處理">待處理</option>
          <option value="待審核">待審核</option>
        </select>

        <button class="btn btn-outline" @click="clearFilters">
          <span class="mdi mdi-filter-remove"></span>
          清除篩選
        </button>
      </div>
    </div>

    <!-- 交易記錄表格 -->
    <div class="table-container">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>交易編號</th>
            <th>交易日期</th>
            <th>客戶資訊</th>
            <th>基金名稱</th>
            <th>交易類型</th>
            <th>交易金額</th>
            <th>手續費</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableLoading">
            <td colspan="9" class="loading-row">
              <span class="mdi mdi-loading mdi-spin"></span>
              載入交易記錄中...
            </td>
          </tr>
          <tr v-else-if="transactions.length === 0">
            <td colspan="9" class="empty-row">
              <span class="mdi mdi-information-outline"></span>
              暫無交易記錄
            </td>
          </tr>
          <tr v-else v-for="transaction in transactions" :key="transaction.fundTranId">
            <td class="transaction-id">{{ transaction.fundTranId }}</td>
            <td>{{ formatDateTime(transaction.tranTime) }}</td>
            <td>
              <div class="customer-info">
                <div class="customer-name">{{ getCustomerName(transaction) }}</div>
                <div class="customer-id">{{ getCustomerId(transaction) }}</div>
              </div>
            </td>
            <td>
              <div class="fund-info">
                <div class="fund-name">{{ getFundName(transaction) }}</div>
                <div class="fund-code">{{ getFundCode(transaction) }}</div>
              </div>
            </td>
            <td>
              <span :class="['transaction-type', getTransactionTypeClass(transaction.tranType)]">
                {{ transaction.tranType }}
              </span>
            </td>
            <td class="amount">NT$ {{ formatNumber(transaction.amount) }}</td>
            <td class="fee">NT$ {{ formatNumber(transaction.fee) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(transaction.status)]">
                <span :class="['mdi', getStatusIcon(transaction.status)]"></span>
                {{ transaction.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="viewTransaction(transaction)" title="查看詳情">
                  <span class="mdi mdi-eye"></span>
                </button>
                <button class="btn-icon" @click="approveTransaction(transaction)" title="審核通過"
                  v-if="transaction.status === '待審核' || transaction.status === '待處理'">
                  <span class="mdi mdi-check"></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { request } from '@/utils/BackAxiosUtil'

// 除錯模式
const debugMode = ref(true)

// 載入狀態管理
const loading = ref(false)
const tableLoading = ref(false)
const error = ref('')

// 數據狀態
const transactions = ref([])
const totalTransactions = ref(0)

// 篩選條件
const searchTerm = ref('')
const selectedTransactionType = ref('')
const selectedStatus = ref('')

// 除錯日志函數
const debugLog = (message, data = null) => {
  if (debugMode.value) {
    console.log(`[DEBUG] ${message}`, data || '')
  }
}

// API 路徑
const API_BASE = '/fundTransaction'

// 原始資料和篩選後的資料
const allTransactions = ref([])

// 防抖搜尋
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyClientSideFilters()
  }, 500)
}

// 前端篩選邏輯
const applyClientSideFilters = () => {
  debugLog('執行前端篩選...')
  let filtered = [...allTransactions.value]

  // 搜尋篩選
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(t =>
      getCustomerName(t).toLowerCase().includes(term) ||
      getFundName(t).toLowerCase().includes(term) ||
      t.fundTranId.toString().includes(term)
    )
  }

  // 交易類型篩選
  if (selectedTransactionType.value) {
    filtered = filtered.filter(t => t.tranType === selectedTransactionType.value)
  }

  // 狀態篩選
  if (selectedStatus.value) {
    filtered = filtered.filter(t => t.status === selectedStatus.value)
  }

  transactions.value = filtered
  totalTransactions.value = filtered.length
  debugLog('篩選完成，顯示', filtered.length, '筆記錄')
}

// 獲取交易記錄
const fetchTransactions = async () => {
  try {
    debugLog('開始獲取交易記錄')
    tableLoading.value = true
    error.value = ''

    const response = await request({
      url: API_BASE,
      method: 'GET'
    })

    debugLog('API 回應:', response)
    let responseData = response?.data || response

    if (Array.isArray(responseData)) {
      allTransactions.value = responseData
      transactions.value = responseData
      totalTransactions.value = responseData.length
      debugLog('交易資料載入成功', transactions.value.length, '筆')
      applyClientSideFilters()
    } else {
      transactions.value = []
      totalTransactions.value = 0
      error.value = '無交易記錄或資料格式錯誤'
    }
  } catch (err) {
    debugLog('獲取交易記錄錯誤:', err)
    console.error('交易記錄載入失敗:', err)
    error.value = `交易記錄載入失敗: ${err.message || '請檢查後端服務'}`
  } finally {
    tableLoading.value = false
  }
}

// 審核申購方法
const approveBuyTransaction = async (transaction) => {
  try {
    loading.value = true
    debugLog('審核申購交易:', transaction.fundTranId)

    const navInput = prompt('請輸入當前基金淨值:', '15.68')
    if (!navInput || isNaN(navInput)) {
      return { success: false, message: '淨值無效' }
    }

    const navValue = parseFloat(navInput)
    if (navValue <= 0) {
      return { success: false, message: '淨值必須大於零' }
    }

    // 確保請求資料格式正確
    const requestData = {
      nav: navValue
    }

    console.log('發送審核請求:', requestData) // 除錯日誌

    const response = await request({
      url: `${API_BASE}/buy/${transaction.fundTranId}`,
      method: 'PUT',
      data: requestData
    })

    console.log('審核回應:', response) // 除錯日誌

    if (response && (response.data || response)) {
      await refreshData()
      return { success: true }
    } else {
      return { success: false, message: '審核回應異常' }
    }
  } catch (err) {
    console.error('審核申購詳細錯誤:', err)

    let errorMessage = '審核失敗'
    if (err.response?.status === 500) {
      errorMessage = '後端服務錯誤：' + (err.response?.data?.message || '請檢查後端日誌')
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }

    return { success: false, message: errorMessage }
  } finally {
    loading.value = false
  }
}

// 審核贖回方法
const approveSellTransaction = async (transaction) => {
  try {
    loading.value = true
    debugLog('審核贖回交易:', transaction.fundTranId)

    const navInput = prompt('請輸入當前基金淨值:', '15.68')
    if (!navInput || isNaN(navInput)) {
      return { success: false, message: '淨值無效' }
    }

    const response = await request({
      url: `${API_BASE}/sell/${transaction.fundTranId}`,
      method: 'PUT',
      data: { nav: parseFloat(navInput) }
    })

    if (response && (response.data || response)) {
      await refreshData()
      return { success: true }
    } else {
      return { success: false, message: '審核回應異常' }
    }
  } catch (err) {
    debugLog('審核贖回錯誤:', err)
    return { success: false, message: err.response?.data?.message || '審核失敗' }
  } finally {
    loading.value = false
  }
}

// 工具方法
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-TW')
}

const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '0'
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

const getCustomerName = (transaction) => {
  return transaction.fundAccount?.member?.mName || '未知客戶'
}

const getCustomerId = (transaction) => {
  return transaction.fundAccount?.account?.accountId || ''
}

const getFundName = (transaction) => {
  return transaction.fund?.fundName || '未知基金'
}

const getFundCode = (transaction) => {
  return transaction.fund?.fundCode || ''
}

const getTransactionTypeClass = (type) => {
  const classMap = {
    '申購': 'purchase',
    '贖回': 'redemption'
  }
  return classMap[type] || ''
}

const getStatusClass = (status) => {
  const classMap = {
    '交易成功': 'success',
    '待處理': 'pending',
    '待審核': 'pending'
  }
  return classMap[status] || ''
}

const getStatusIcon = (status) => {
  const iconMap = {
    '交易成功': 'mdi-check-circle',
    '待處理': 'mdi-help-circle',
    '待審核': 'mdi-help-circle'
  }
  return iconMap[status] || 'mdi-help-circle'
}

// 事件處理方法
const clearFilters = () => {
  searchTerm.value = ''
  selectedTransactionType.value = ''
  selectedStatus.value = ''
  transactions.value = allTransactions.value
  totalTransactions.value = allTransactions.value.length
}

const refreshData = async () => {
  try {
    loading.value = true
    error.value = ''
    await fetchTransactions()
  } catch (err) {
    error.value = `重新整理資料失敗: ${err.message || err}`
  } finally {
    loading.value = false
  }
}

const openNewTransactionModal = () => {
  alert('新增交易功能開發中...')
}

const viewTransaction = (transaction) => {
  console.log('查看交易詳情:', transaction)
  alert(`查看交易 ${transaction.fundTranId} 的詳情`)
}

const approveTransaction = async (transaction) => {
  if (transaction.status !== '待審核' && transaction.status !== '待處理') {
    alert('只能審核狀態為「待審核」或「待處理」的交易')
    return
  }

  const confirmMessage = `確定要審核通過以下交易嗎？
  
交易類型：${transaction.tranType}
交易金額：NT$ ${formatNumber(transaction.amount)}
客戶：${getCustomerName(transaction)}
基金：${getFundName(transaction)}`

  if (!confirm(confirmMessage)) {
    return
  }

  let result
  try {
    if (transaction.tranType === '申購') {
      result = await approveBuyTransaction(transaction)
    } else if (transaction.tranType === '贖回') {
      result = await approveSellTransaction(transaction)
    } else {
      alert(`不支援的交易類型：${transaction.tranType}`)
      return
    }

    if (result && result.success) {
      alert('審核成功！交易已完成處理。')
    } else {
      alert(`審核失敗：${result?.message || '未知錯誤'}`)
    }
  } catch (error) {
    console.error('審核過程發生錯誤:', error)
    alert('審核過程發生系統錯誤')
  }
}

// 生命週期
onMounted(async () => {
  console.log('基金交易頁面載入')
  await refreshData()
})
</script>

<style scoped>
.fund-transaction-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100%;
}

/* 載入狀態樣式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner .mdi {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.loading-row,
.empty-row {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* 錯誤訊息樣式 */
.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-actions {
  margin-top: 12px;
}

/* 標題區域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 按鈕樣式 */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-outline {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-icon {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

/* 篩選區域 */
.filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* 表格樣式 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th {
  background-color: #f9fafb;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
}

.transaction-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.transaction-table tbody tr:hover {
  background-color: #f9fafb;
}

.transaction-id {
  font-family: monospace;
  font-weight: 600;
  color: #3b82f6;
}

.customer-info,
.fund-info {
  line-height: 1.4;
}

.customer-name,
.fund-name {
  font-weight: 500;
  color: #1f2937;
}

.customer-id,
.fund-code {
  font-size: 0.75rem;
  color: #6b7280;
}

.transaction-type {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.transaction-type.purchase {
  background-color: #d1fae5;
  color: #065f46;
}

.transaction-type.redemption {
  background-color: #fee2e2;
  color: #991b1b;
}

.amount,
.fee {
  font-weight: 600;
  text-align: right;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #e0e7ff;
  color: #3730a3;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 動畫效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fund-transaction-container {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .table-container {
    overflow-x: auto;
  }

  .transaction-table {
    min-width: 800px;
  }
}
</style>