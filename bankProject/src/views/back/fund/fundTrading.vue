<!--基金交易管理 fundTrading.vue - 完整版-->
<template>
    <div class="fund-transaction-container">
        <!-- 載入遮罩 -->
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner">
                <span class="mdi mdi-loading mdi-spin"></span>
                <p>載入中...</p>
            </div>
        </div>

        <!-- 頁面標題 -->
        <div class="page-header">
            <div class="header-content">
                <h2 class="page-title">
                    <i class="fas fa-chart-pie"></i>
                    基金交易管理
                </h2>
                <p class="page-subtitle">管理基金申購、贖回交易記錄</p>
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
                    <option value="轉換">轉換</option>
                </select>

                <select v-model="selectedStatus" @change="applyClientSideFilters" class="filter-select">
                    <option value="">所有狀態</option>
                    <option value="成功">成功</option>
                    <option value="處理中">處理中</option>
                    <option value="失敗">失敗</option>
                    <option value="待審核">待審核</option>
                </select>

                <input type="date" v-model="startDate" @change="applyClientSideFilters" class="filter-date" />
                <span class="date-separator">至</span>
                <input type="date" v-model="endDate" @change="applyClientSideFilters" class="filter-date" />

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
                        <th @click="sortBy('tranTime')">
                            交易日期
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('tranTime')"></span>
                        </th>
                        <th>客戶資訊</th>
                        <th>基金名稱</th>
                        <th @click="sortBy('tranType')">
                            交易類型
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('tranType')"></span>
                        </th>
                        <th @click="sortBy('amount')">
                            交易金額
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('amount')"></span>
                        </th>
                        <th>手續費</th>
                        <th @click="sortBy('nav')">
                            淨值
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('nav')"></span>
                        </th>
                        <th @click="sortBy('units')">
                            單位數
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('units')"></span>
                        </th>
                        <th class="status-column">狀態</th>
                        <th>備註</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="tableLoading">
                        <td colspan="11" class="loading-row">
                            <span class="mdi mdi-loading mdi-spin"></span>
                            載入交易記錄中...
                        </td>
                    </tr>
                    <tr v-else-if="transactions.length === 0">
                        <td colspan="11" class="empty-row">
                            <span class="mdi mdi-information-outline"></span>
                            暫無交易記錄
                        </td>
                    </tr>
                    <tr v-else v-for="transaction in transactions" :key="transaction.fundTranId">
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
                        <td :class="['amount', getAmountColorClass(transaction.tranType)]">
                            {{ formatCurrencyWithColor(transaction.amount) }}
                        </td>
                        <td class="fee">{{ formatCurrencyWithColor(transaction.fee) }}</td>
                        <td class="nav">{{ formatNavWithColor(transaction.nav) }}</td>
                        <td :class="['units', getUnitsColorClass(transaction.tranType)]">
                            {{ formatUnitsWithColor(transaction.units) }}
                        </td>
                        <td>
                            <span :class="['status-badge', getStatusClass(transaction.status)]">
                                <span :class="['status-icon', getStatusIcon(transaction.status)]"></span>
                                {{ transaction.status }}
                            </span>
                        </td>
                        <td class="memo">{{ transaction.memo || '---' }}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon btn-approve" @click="approveTransaction(transaction)"
                                    title="審核通過" v-if="transaction.status === '待審核'">
                                    <span class="mdi mdi-check"></span>
                                </button>
                                <button class="btn-icon btn-reject" @click="rejectTransaction(transaction)" title="審核拒絕"
                                    v-if="transaction.status === '待審核'">
                                    <span class="mdi mdi-close"></span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分頁控制 -->
        <div class="pagination-container" v-if="!tableLoading && transactions.length > 0">
            <div class="pagination-info">
                共 {{ totalTransactions }} 筆交易記錄
            </div>

            <div class="pagination-controls">
                <button class="btn btn-outline" @click="loadPreviousPage" :disabled="!hasPreviousPage">
                    <span class="mdi mdi-chevron-left"></span>
                    上一頁
                </button>

                <button class="btn btn-outline" @click="loadNextPage" :disabled="!hasNextPage">
                    下一頁
                    <span class="mdi mdi-chevron-right"></span>
                </button>
            </div>
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
const statsLoading = ref(false)
const error = ref('')

// 數據狀態
const transactions = ref([])
const stats = ref({})
const totalTransactions = ref(0)
const currentPage = ref(0)
const pageSize = ref(20)

// 篩選條件
const searchTerm = ref('')
const selectedTransactionType = ref('')
const selectedStatus = ref('')
const startDate = ref('')
const endDate = ref('')

// 排序條件
const sortField = ref('tranTime')
const sortDirection = ref('desc')

// 除錯資訊
const currentApiEndpoint = ref('')
const fullApiUrl = ref('')
const requestMethodUsed = ref('')

// 除錯日志函數
const debugLog = (message, data = null) => {
    if (debugMode.value) {
        console.log(`🔍 [DEBUG] ${message}`, data || '')
    }
}

// API 路徑
const API_BASE = '/fundTransaction'

// 防抖搜尋
let searchTimeout = null
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        applyClientSideFilters()
    }, 500)
}

// 原始資料和篩選後的資料
const allTransactions = ref([])
const filteredTransactions = ref([])

// 前端篩選邏輯
const applyClientSideFilters = () => {
    debugLog('🔍 執行前端篩選...')

    let filtered = [...allTransactions.value]

    // 搜尋篩選
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(t =>
            getCustomerName(t).toLowerCase().includes(term) ||
            getFundName(t).toLowerCase().includes(term) ||
            t.fundTranId.toString().includes(term) ||
            (t.fundAccount?.account?.accountId || '').toLowerCase().includes(term)
        )
        debugLog('🔍 搜尋篩選後:', filtered.length, '筆')
    }

    // 交易類型篩選
    if (selectedTransactionType.value) {
        filtered = filtered.filter(t => t.tranType === selectedTransactionType.value)
        debugLog('📋 類型篩選後:', filtered.length, '筆')
    }

    // 狀態篩選
    if (selectedStatus.value) {
        filtered = filtered.filter(t => t.status === selectedStatus.value)
        debugLog('📊 狀態篩選後:', filtered.length, '筆')
    }

    // 日期篩選
    if (startDate.value) {
        filtered = filtered.filter(t => {
            const tranDate = new Date(t.tranTime).toISOString().split('T')[0]
            return tranDate >= startDate.value
        })
        debugLog('📅 開始日期篩選後:', filtered.length, '筆')
    }

    if (endDate.value) {
        filtered = filtered.filter(t => {
            const tranDate = new Date(t.tranTime).toISOString().split('T')[0]
            return tranDate <= endDate.value
        })
        debugLog('📅 結束日期篩選後:', filtered.length, '筆')
    }

    filteredTransactions.value = filtered
    transactions.value = filtered
    totalTransactions.value = filtered.length

    debugLog('✅ 篩選完成，顯示', filtered.length, '筆記錄')
}

// 計算屬性
const hasPreviousPage = computed(() => currentPage.value > 0)
const hasNextPage = computed(() => (currentPage.value + 1) * pageSize.value < totalTransactions.value)

// API 呼叫方法
const fetchStats = async () => {
    try {
        debugLog('=== 開始獲取統計資料 ===')
        statsLoading.value = true

        debugLog('⚠️ 跳過統計資料獲取（後端尚未支援）')

        stats.value = {
            todayPurchase: 0,
            todayRedemption: 0,
            todayTransactionCount: 0,
            pendingTransactionCount: 0
        }

        debugLog('📊 使用預設統計資料', stats.value)

    } catch (err) {
        const errorMessage = `獲取統計資料錯誤: ${err.message || err}`
        debugLog('❌ ' + errorMessage, err)
        console.error('統計資料載入失敗:', err)
    } finally {
        statsLoading.value = false
        debugLog('=== 統計資料載入結束 ===')
    }
}

const fetchTransactions = async () => {
    try {
        debugLog('=== 開始獲取交易記錄 ===')
        tableLoading.value = true
        error.value = ''

        currentApiEndpoint.value = API_BASE
        fullApiUrl.value = currentApiEndpoint.value
        requestMethodUsed.value = 'GET'

        const response = await request({
            url: API_BASE,
            method: 'GET'
        })

        debugLog('📡 完整回應物件:', response)
        debugLog('📡 回應狀態碼:', response?.status)
        debugLog('📡 回應標頭:', response?.headers)
        debugLog('📡 回應數據:', response?.data)

        let responseData = response?.data || response;

        debugLog('📡 處理後的數據:', responseData)
        debugLog('📡 數據類型:', Array.isArray(responseData) ? '陣列' : typeof responseData)

        if (Array.isArray(responseData)) {
            allTransactions.value = responseData
            transactions.value = responseData
            totalTransactions.value = responseData.length

            debugLog('✅ 交易資料載入成功 (陣列格式)', {
                count: transactions.value.length,
                total: totalTransactions.value
            })

            if (transactions.value.length === 0) {
                debugLog('⚠️ 資料庫中沒有交易記錄')
                error.value = '資料庫中沒有交易記錄，請先新增一些測試資料'
            } else {
                debugLog('🎉 成功載入交易記錄！')
                applyClientSideFilters()
            }
        } else if (responseData && responseData.content) {
            transactions.value = responseData.content
            totalTransactions.value = responseData.totalElements || responseData.content.length
            debugLog('✅ 交易資料載入成功 (Page格式)', {
                count: transactions.value.length,
                total: totalTransactions.value
            })
        } else if (responseData && responseData.data) {
            const dataContent = responseData.data
            if (Array.isArray(dataContent)) {
                transactions.value = dataContent
                totalTransactions.value = dataContent.length
                debugLog('✅ 交易資料載入成功 (包裝格式)', {
                    count: transactions.value.length,
                    total: totalTransactions.value
                })
            } else {
                debugLog('❌ data 屬性不是陣列格式:', dataContent)
                error.value = 'API 回應 data 屬性格式異常'
            }
        } else {
            debugLog('❌ API 回應格式無法識別')
            error.value = `API 回應格式異常: 收到 ${typeof response?.data} 類型，預期陣列格式`
        }

    } catch (err) {
        const errorMessage = `獲取交易記錄錯誤: ${err.message || err}`
        debugLog('❌ ' + errorMessage, err)
        console.error('交易記錄載入失敗:', err)

        if (err.response?.status === 500) {
            error.value = '後端伺服器錯誤 (500)，請檢查後端日志和資料庫連接'
        } else if (err.response?.status === 404) {
            error.value = 'API 端點不存在 (404)，請確認 Controller 路徑正確'
        } else if (err.code === 'NETWORK_ERROR') {
            error.value = '網路錯誤，請確認後端服務是否運行在正確的端口'
        } else {
            error.value = `交易記錄載入失敗: ${err.message || '請檢查後端服務是否運行'}`
        }
    } finally {
        tableLoading.value = false
        debugLog('=== 交易記錄載入結束 ===')
    }
}

// 分頁方法
const loadPreviousPage = () => {
    if (hasPreviousPage.value) {
        currentPage.value--
        fetchTransactions()
    }
}

const loadNextPage = () => {
    if (hasNextPage.value) {
        currentPage.value++
        fetchTransactions()
    }
}

// 主方法：審核交易
const approveTransaction = async (transaction) => {
    debugLog('✅ 審核交易:', transaction.fundTranId, transaction.tranType)

    if (confirm(`確定要審核通過此${transaction.tranType}交易嗎？`)) {
        let result
        if (transaction.tranType === '申購') {
            result = await approveBuyTransaction(transaction)
        } else if (transaction.tranType === '贖回') {
            result = await approveSellTransaction(transaction)
        }

        if (!result?.success) {
            alert(`審核失敗：${result?.message || '未知錯誤'}`)
            console.error('❌ 審核錯誤詳細：', result)
        }
    }
}

// 審核申購
const approveBuyTransaction = async (transaction) => {
    try {
        loading.value = true
        debugLog('✅ 審核申購交易:', transaction.fundTranId)

        const response = await request({
            url: `${API_BASE}/buy/${transaction.fundTranId}`,
            method: 'PUT',
            data: { status: '成功' }
        })

        debugLog('審核申購回應:', response)

        if (response) {
            await refreshData()
            debugLog('✅ 申購審核成功，已自動刷新數據')
            return { success: true }
        } else {
            return {
                success: false,
                message: '後端無回應',
                rawError: response
            }
        }
    } catch (err) {
        debugLog('審核申購錯誤:', err)
        return {
            success: false,
            message: err.response?.data?.message || err.message || '審核失敗',
            rawError: err.response?.data || err
        }
    } finally {
        loading.value = false
    }
}

// 審核贖回
const approveSellTransaction = async (transaction) => {
    try {
        loading.value = true
        debugLog('✅ 審核贖回交易:', transaction.fundTranId)

        const response = await request({
            url: `${API_BASE}/sell/${transaction.fundTranId}`,
            method: 'PUT',
            data: { status: '成功' }
        })

        debugLog('審核贖回回應:', response)

        if (response) {
            await refreshData()
            debugLog('✅ 贖回審核成功，已自動刷新數據')
            return { success: true }
        } else {
            return {
                success: false,
                message: '後端無回應',
                rawError: response
            }
        }
    } catch (err) {
        debugLog('審核贖回錯誤:', err)
        return {
            success: false,
            message: err.response?.data?.message || err.message || '審核失敗',
            rawError: err.response?.data || err
        }
    } finally {
        loading.value = false
    }
}

// 工具方法
const formatDateTime = (dateTime) => {
    if (!dateTime) return '---'
    return new Date(dateTime).toLocaleString('zh-TW')
}

const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined || number === 0) return '---'
    return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number)
}

// 格式化貨幣並添加顏色邏輯
const formatCurrencyWithColor = (amount) => {
    if (!amount || amount === 0 || isNaN(amount)) return '---'
    return 'NT$ ' + Number(amount).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
}

// 格式化淨值並添加顏色邏輯
const formatNavWithColor = (nav) => {
    if (!nav || nav === 0 || isNaN(nav)) return '---'
    return 'NT$ ' + Number(nav).toLocaleString('zh-TW', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    })
}

// 格式化單位數並添加顏色邏輯
const formatUnitsWithColor = (units) => {
    if (!units || units === 0 || isNaN(units)) return '---'
    return Number(units).toLocaleString('zh-TW', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    })
}

// 獲取金額顏色類別
const getAmountColorClass = (tranType) => {
    if (tranType === '申購') return 'amount-negative'
    if (tranType === '贖回') return 'amount-positive'
    return ''
}

// 獲取單位數顏色類別
const getUnitsColorClass = (tranType) => {
    if (tranType === '申購') return 'units-positive'
    if (tranType === '贖回') return 'units-negative'
    return ''
}

const getCustomerName = (transaction) => {
    return transaction.fundAccount?.member?.mName || '未知客戶'
}

const getCustomerId = (transaction) => {
    return transaction.fundAccount?.account?.accountId ||
        transaction.fundAccount?.member?.mAccount ||
        ''
}

const getFundName = (transaction) => {
    return transaction.fund?.fundName || '未知基金'
}

const getSortIcon = (field) => {
    if (sortField.value !== field) return ''
    return sortDirection.value === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'
}

const getTransactionTypeClass = (type) => {
    const classMap = {
        '申購': 'purchase',
        '贖回': 'redemption',
        '轉換': 'exchange'
    }
    return classMap[type] || ''
}

const getStatusClass = (status) => {
    const classMap = {
        '成功': 'status-success',
        '交易成功': 'status-success',
        '處理中': 'status-processing',
        '失敗': 'status-failed',
        '待審核': 'status-pending'
    }
    return classMap[status] || ''
}

const getStatusIcon = (status) => {
    const iconMap = {
        '成功': 'mdi mdi-check-circle',
        '交易成功': 'mdi mdi-check-circle',
        '處理中': 'mdi mdi-clock',
        '失敗': 'mdi mdi-alert-circle',
        '待審核': 'mdi mdi-help-circle'
    }
    return iconMap[status] || 'mdi mdi-help-circle'
}

const getFundCode = (transaction) => {
    return transaction.fund?.fundCode || ''
}

// 事件處理方法
const sortBy = (field) => {
    debugLog('🔀 排序欄位:', field)

    if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortField.value = field
        sortDirection.value = 'asc'
    }

    const sorted = [...transactions.value].sort((a, b) => {
        let aVal = a[field]
        let bVal = b[field]

        if (field === 'customerName') {
            aVal = getCustomerName(a)
            bVal = getCustomerName(b)
        } else if (field === 'fundName') {
            aVal = getFundName(a)
            bVal = getFundName(b)
        }

        if (field === 'amount' || field === 'fee' || field === 'units' || field === 'nav' || field === 'fundTranId') {
            aVal = parseFloat(aVal) || 0
            bVal = parseFloat(bVal) || 0
        }

        if (field === 'tranTime') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
        }

        if (sortDirection.value === 'asc') {
            return aVal > bVal ? 1 : -1
        } else {
            return aVal < bVal ? 1 : -1
        }
    })

    transactions.value = sorted
    debugLog('✅ 排序完成:', field, sortDirection.value)
}

const clearFilters = () => {
    debugLog('🧹 清除所有篩選條件')
    searchTerm.value = ''
    selectedTransactionType.value = ''
    selectedStatus.value = ''
    startDate.value = ''
    endDate.value = ''

    transactions.value = allTransactions.value
    totalTransactions.value = allTransactions.value.length

    debugLog('✅ 篩選已清除，顯示全部', totalTransactions.value, '筆記錄')
}

const refreshData = async () => {
    try {
        debugLog('🔄 開始重新整理資料...')
        loading.value = true
        error.value = ''

        await Promise.all([
            fetchStats(),
            fetchTransactions()
        ])

        debugLog('✅ 資料重新整理完成')
    } catch (err) {
        const errorMessage = `重新整理資料失敗: ${err.message || err}`
        debugLog('❌ ' + errorMessage, err)
        error.value = errorMessage
    } finally {
        loading.value = false
    }
}

const rejectTransaction = async (transaction) => {
    debugLog('❌ 拒絕交易:', transaction.fundTranId)
    console.log('拒絕交易功能需要後端新增對應端點')
    alert('拒絕交易功能需要後端新增對應端點')
}

// 監聽器
watch([selectedTransactionType, selectedStatus, startDate, endDate], () => {
    currentPage.value = 0
})

// 生命週期
onMounted(async () => {
    console.log('%c🚀 基金交易頁面載入', 'color: #3b82f6; font-weight: bold; font-size: 16px;')

    debugLog('=== 頁面初始化 ===')
    debugLog('API Base:', API_BASE)

    await refreshData()
})
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-content i {
    color: #667eea;
}

.page-subtitle {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
}

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

.loading-text {
    color: #6b7280;
    font-size: 0.875rem;
}

.loading-row,
.empty-row {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
}

.loading-row .mdi,
.empty-row .mdi {
    font-size: 1.5rem;
    margin-right: 0.5rem;
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

.btn-secondary {
    background-color: #10b981;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background-color: #059669;
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
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.btn-approve {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-approve:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
}

.btn-reject {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-reject:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5);
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

.search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.filter-select,
.filter-date {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
}

.filter-select:focus,
.filter-date:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-separator {
    color: #6b7280;
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
    cursor: pointer;
    user-select: none;
    position: relative;
}

.transaction-table th:hover {
    background-color: #f3f4f6;
}

.transaction-table th.status-column {
    min-width: 140px;
    width: 140px;
}

.transaction-table td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
}

.transaction-table tbody tr:hover {
    background-color: #f9fafb;
}

.sort-icon {
    margin-left: 4px;
    font-size: 0.75rem;
    opacity: 0.5;
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
    background: #e3f2fd;
    color: #1976d2;
}

.transaction-type.redemption {
    background-color: #fee2e2;
    color: #991b1b;
}

.transaction-type.exchange {
    background-color: #dbeafe;
    color: #1e40af;
}

/* 金額和單位數顏色樣式 */
.amount,
.fee,
.nav,
.units {
    font-weight: 600;
    text-align: right;
}

.amount-positive {
    color: #dc3545 !important;
}

.amount-negative {
    color: #28a745 !important;
}

.units-positive {
    color: #dc3545 !important;
}

.units-negative {
    color: #28a745 !important;
}

.memo {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    color: #6b7280;
}

/* 狀態樣式 - 參考會員交易紀錄 */
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

.status-badge.status-success {
    background-color: #d1fae5;
    color: #065f46;
}

.status-badge.status-processing {
    background-color: #cce5ff;
    color: #004085;
}

.status-badge.status-failed {
    background-color: #fee2e2;
    color: #991b1b;
}

.status-badge.status-pending {
    background-color: #fff3cd;
    color: #856404;
}

.status-icon {
    font-size: 0.875rem;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

/* 分頁控制 */
.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-info {
    color: #6b7280;
    font-size: 0.875rem;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 表格行hover效果 */
.transaction-table tbody tr {
    transition: background-color 0.2s;
}
</style>