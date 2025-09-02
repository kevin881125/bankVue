<!--會員交易紀錄 myFundTransaction.vue - 更新後的樣式 -->
<template>
  <div class="fund-transaction-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入交易紀錄中...</p>
    </div>

    <!-- 主要內容 -->
    <div v-else class="content">

      <!-- 交易表格 -->
      <div class="table-container">
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <i class="fas fa-receipt empty-icon"></i>
          <h3>{{ hasFilters ? '沒有符合條件的交易紀錄' : '暫無交易紀錄' }}</h3>
          <p>{{ hasFilters ? '試試調整篩選條件' : '開始您的第一筆基金投資吧！' }}</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="transaction-table">
            <thead>
              <tr>
                <th>交易時間</th>
                <th>基金名稱</th>
                <th>交易類型</th>
                <th>交易金額</th>
                <th>手續費</th>
                <th>淨值</th>
                <th>單位數</th>
                <th>狀態</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in paginatedTransactions" :key="transaction.fundTranId" class="table-row">
                <td class="tran-time">
                  <div class="time-info">
                    <div class="date">{{ formatDate(transaction.tranTime) }}</div>
                    <div class="time">{{ formatTime(transaction.tranTime) }}</div>
                  </div>
                </td>
                <td class="fund-name">
                  <div class="fund-info">
                    <div class="name">{{ transaction.fund?.fundName || '---' }}</div>
                    <div class="code">{{ transaction.fund?.fundCode || '---' }}</div>
                  </div>
                </td>
                <td class="tran-type">
                  <span class="type-badge" :class="getTypeClass(transaction.tranType)">
                    {{ transaction.tranType }}
                  </span>
                </td>
                <td class="amount">
                  <div class="amount-info">
                    <div class="main-amount" :class="getAmountClass(transaction.tranType)">
                      {{ formatCurrencyWithColor(transaction.amount) }}
                    </div>
                  </div>
                </td>
                <td class="fee">
                  {{ formatCurrencyWithColor(transaction.fee) }}
                </td>
                <td class="nav">
                  {{ formatNavWithColor(transaction.nav) }}
                </td>
                <td class="units">
                  <span :class="getUnitsClass(transaction.tranType)">
                    {{ formatUnitsWithColor(transaction.units) }}
                  </span>
                </td>
                <td class="status">
                  <span class="status-badge" :class="getStatusClass(transaction.status)">
                    <span :class="['status-icon', getStatusIcon(transaction.status)]"></span>
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="memo">
                  <span class="memo-text" :title="transaction.memo">
                    {{ transaction.memo || '---' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn">
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          <i class="fas fa-angle-left"></i>
        </button>

        <div class="page-numbers">
          <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]">
            {{ page }}
          </button>
        </div>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
          <i class="fas fa-angle-right"></i>
        </button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn">
          <i class="fas fa-angle-double-right"></i>
        </button>

        <div class="page-info">
          第 {{ currentPage }} 頁，共 {{ totalPages }} 頁 ({{ filteredTransactions.length }} 筆)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  fundAccId: {
    type: Number,
    required: true
  }
})

// 響應式資料
const loading = ref(true)
const transactions = ref([])

// 篩選條件
const filters = ref({
  tranType: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(20)

// 計算屬性
const getPendingCount = computed(() => {
  return transactions.value.filter(t => ['待審核', '審核中'].includes(t.status)).length
})

const getSuccessCount = computed(() => {
  return transactions.value.filter(t => t.status === '交易成功').length
})

const hasFilters = computed(() => {
  return filters.value.tranType || filters.value.status ||
    filters.value.startDate || filters.value.endDate
})

const filteredTransactions = computed(() => {
  let result = [...transactions.value]

  // 交易類型篩選
  if (filters.value.tranType) {
    result = result.filter(t => t.tranType === filters.value.tranType)
  }

  // 狀態篩選
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status)
  }

  // 日期範圍篩選
  if (filters.value.startDate) {
    const startDate = new Date(filters.value.startDate)
    result = result.filter(t => new Date(t.tranTime) >= startDate)
  }

  if (filters.value.endDate) {
    const endDate = new Date(filters.value.endDate)
    endDate.setHours(23, 59, 59, 999) // 設定為當天的最後一刻
    result = result.filter(t => new Date(t.tranTime) <= endDate)
  }

  // 按時間倒序排列
  return result.sort((a, b) => new Date(b.tranTime) - new Date(a.tranTime))
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / pageSize.value)
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTransactions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 方法
const fetchTransactions = async () => {
  if (!props.fundAccId) return

  loading.value = true
  try {
    const response = await axios.get(`http://localhost:8080/bank/fundTransaction/${props.fundAccId}`)
    transactions.value = response.data || []
    console.log('交易紀錄:', transactions.value)
  } catch (error) {
    console.error('載入交易紀錄失敗:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    tranType: '',
    status: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 格式化函數
const formatDate = (dateTime) => {
  if (!dateTime) return '---'
  return new Date(dateTime).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateTime) => {
  if (!dateTime) return '---'
  return new Date(dateTime).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化貨幣並添加顏色邏輯
const formatCurrencyWithColor = (amount) => {
  if (!amount || amount === 0 || isNaN(amount)) return '---'
  return '$' + Number(amount).toLocaleString('zh-TW')
}

// 格式化淨值並添加顏色邏輯
const formatNavWithColor = (nav) => {
  if (!nav || nav === 0 || isNaN(nav)) return '---'
  return Number(nav).toFixed(4)
}

// 格式化單位數並添加顏色邏輯
const formatUnitsWithColor = (units) => {
  if (!units || units === 0 || isNaN(units)) return '---'
  return Number(units).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  })
}

// 樣式類別
const getTypeClass = (type) => {
  const classes = {
    '申購': 'type-buy',
    '贖回': 'type-sell',
    '定期定額': 'type-sip'
  }
  return classes[type] || 'type-default'
}

const getAmountClass = (type) => {
  return type === '贖回' ? 'amount-positive' : 'amount-negative'
}

const getUnitsClass = (type) => {
  return type === '申購' ? 'units-positive' : 'units-negative'
}

const getStatusClass = (status) => {
  const classes = {
    '待審核': 'status-pending',
    '審核中': 'status-processing',
    '交易成功': 'status-success',
    '成功': 'status-success',
    '已取消': 'status-cancelled',
    '失敗': 'status-failed'
  }
  return classes[status] || 'status-unknown'
}

const getStatusIcon = (status) => {
  const iconMap = {
    '待審核': 'mdi mdi-help-circle',
    '審核中': 'mdi mdi-clock',
    '交易成功': 'mdi mdi-check-circle',
    '成功': 'mdi mdi-check-circle',
    '已取消': 'mdi mdi-close-circle',
    '失敗': 'mdi mdi-alert-circle'
  }
  return iconMap[status] || 'mdi mdi-help-circle'
}

// 監聽器
watch(() => props.fundAccId, (newId) => {
  if (newId) {
    fetchTransactions()
  }
}, { immediate: true })

watch(() => filteredTransactions.value.length, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

// 生命週期
onMounted(() => {
  if (props.fundAccId) {
    fetchTransactions()
  }
})
</script>

<style scoped>
.fund-transaction-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 載入狀態 */
.loading-container {
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

/* 表格區 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #495057;
}

.table-wrapper {
  overflow-x: auto;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  border-bottom: 2px solid #e9ecef;
}

.transaction-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #f8f9fa;
}

/* 表格內容樣式 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-info .date {
  font-weight: 500;
  color: #2c3e50;
}

.time-info .time {
  font-size: 0.85rem;
  color: #6c757d;
}

.fund-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fund-info .name {
  font-weight: 500;
  color: #2c3e50;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-info .code {
  font-size: 0.85rem;
  color: #6c757d;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.type-buy {
  background: #e3f2fd;
  color: #1976d2;
}

.type-sell {
  background: #ffebee;
  color: #d32f2f;
}

.type-sip {
  background: #e8f5e8;
  color: #388e3c;
}

.type-default {
  background: #f5f5f5;
  color: #616161;
}

.amount-info .main-amount {
  font-weight: 600;
  font-size: 1rem;
}

.amount-positive {
  color: #dc3545 !important;
}

.amount-negative {
  color: #28a745 !important;
}

.units-positive {
  color: #dc3545 !important;
  font-weight: 600;
}

.units-negative {
  color: #28a745 !important;
  font-weight: 600;
}

/* 狀態樣式 - 更新為像會員交易紀錄的樣式 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 80px;
  justify-content: center;
}

.status-badge.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.status-processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.status-failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.status-unknown {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-icon {
  font-size: 0.875rem;
}

.memo-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* 分頁 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #667eea;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-info {
  font-size: 0.9rem;
  color: #6c757d;
  margin-left: 15px;
}
</style>