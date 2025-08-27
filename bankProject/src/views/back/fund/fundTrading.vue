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
                <div class="error-debug" v-if="debugMode">
                    <h4>除錯資訊：</h4>
                    <p><strong>API 端點：</strong> {{ currentApiEndpoint }}</p>
                    <p><strong>完整URL：</strong> {{ fullApiUrl }}</p>
                    <p><strong>請求方式：</strong> {{ requestMethodUsed }}</p>
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
                <button class="btn btn-secondary" @click="exportTransactions" :disabled="loading">
                    <span class="mdi mdi-download"></span>
                    匯出記錄
                </button>
                <button class="btn btn-outline" @click="refreshData" :disabled="loading">
                    <span class="mdi mdi-refresh" :class="{ 'mdi-spin': loading }"></span>
                    重新整理
                </button>
            </div>
        </div>

        <!-- 統計卡片區 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="mdi mdi-trending-up stat-icon green"></span>
                    <div class="stat-info">
                        <h3>今日申購</h3>
                        <p class="stat-value">
                            <template v-if="statsLoading">
                                <span class="loading-text">載入中...</span>
                            </template>
                            <template v-else>
                                NT$ {{ formatNumber(stats.todayPurchase || 0) }}
                            </template>
                        </p>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="mdi mdi-trending-down stat-icon red"></span>
                    <div class="stat-info">
                        <h3>今日贖回</h3>
                        <p class="stat-value">
                            <template v-if="statsLoading">
                                <span class="loading-text">載入中...</span>
                            </template>
                            <template v-else>
                                NT$ {{ formatNumber(stats.todayRedemption || 0) }}
                            </template>
                        </p>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="mdi mdi-account-multiple stat-icon blue"></span>
                    <div class="stat-info">
                        <h3>今日交易筆數</h3>
                        <p class="stat-value">
                            <template v-if="statsLoading">
                                <span class="loading-text">載入中...</span>
                            </template>
                            <template v-else>
                                {{ stats.todayTransactionCount || 0 }}
                            </template>
                        </p>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <span class="mdi mdi-clock stat-icon orange"></span>
                    <div class="stat-info">
                        <h3>待處理交易</h3>
                        <p class="stat-value">
                            <template v-if="statsLoading">
                                <span class="loading-text">載入中...</span>
                            </template>
                            <template v-else>
                                {{ stats.pendingTransactionCount || 0 }}
                            </template>
                        </p>
                        <span class="stat-change">需審核</span>
                    </div>
                </div>
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
                        <th @click="sortBy('fundTranId')">
                            交易編號
                            <span class="mdi mdi-sort sort-icon" :class="getSortIcon('fundTranId')"></span>
                        </th>
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
                        <th>單位數量</th>
                        <th>淨值</th>
                        <th>狀態</th>
                        <th>備註</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="tableLoading">
                        <td colspan="12" class="loading-row">
                            <span class="mdi mdi-loading mdi-spin"></span>
                            載入交易記錄中...
                        </td>
                    </tr>
                    <tr v-else-if="transactions.length === 0">
                        <td colspan="12" class="empty-row">
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
                        <td>{{ formatNumber(transaction.units, 4) }}</td>
                        <td>NT$ {{ formatNumber(transaction.nav, 4) }}</td>
                        <td>
                            <span :class="['status-badge', getStatusClass(transaction.status)]">
                                <span :class="['mdi', getStatusIcon(transaction.status)]"></span>
                                {{ transaction.status }}
                            </span>
                        </td>
                        <td class="memo">{{ transaction.memo || '-' }}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" @click="viewTransaction(transaction)" title="查看詳情">
                                    <span class="mdi mdi-eye"></span>
                                </button>
                                <button class="btn-icon" @click="approveTransaction(transaction)" title="審核通過"
                                    v-if="transaction.status === '待審核'">
                                    <span class="mdi mdi-check"></span>
                                </button>
                                <button class="btn-icon danger" @click="rejectTransaction(transaction)" title="審核拒絕"
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
const currentPage = ref(0) // Spring Boot 分頁從 0 開始
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

// API 路徑 - 根據你的 Controller
const API_BASE = '/fundTransaction'

// 防抖搜尋 - 修正為前端篩選
let searchTimeout = null
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        // 前端搜尋篩選，不重新呼叫 API
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

    // 狀態篩選 (前端篩選，避免後端 500 錯誤)
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

        // 由於你的 Controller 目前沒有統計端點，且狀態篩選會產生 500 錯誤
        // 暫時跳過統計功能，直接設定預設值
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

        // 先嘗試最基本的獲取所有交易記錄，不帶任何參數
        currentApiEndpoint.value = API_BASE
        fullApiUrl.value = currentApiEndpoint.value
        requestMethodUsed.value = 'GET'

        debugLog('📡 API 請求 (基本獲取所有記錄):', { url: API_BASE })
        debugLog('📡 完整請求 URL:', `${window.location.origin}/bank${API_BASE}`)

        const response = await request({
            url: API_BASE,
            method: 'GET'
        })

        // 詳細分析回應
        debugLog('📡 完整回應物件:', response)
        debugLog('📡 回應狀態碼:', response?.status)
        debugLog('📡 回應標頭:', response?.headers)
        debugLog('📡 回應數據:', response?.data)
        debugLog('📡 回應數據類型:', response?.data === null ? 'null' : response?.data === undefined ? 'undefined' : Array.isArray(response?.data) ? '陣列' : typeof response?.data)

        if (response?.data !== null && response?.data !== undefined) {
            debugLog('📡 回應數據長度:', response?.data?.length)
            debugLog('📡 回應數據內容預覽:', JSON.stringify(response?.data).substring(0, 200) + '...')
        }

        // 處理 axios 攔截器的情況
        let responseData = response?.data || response;

        debugLog('📡 處理後的數據:', responseData)
        debugLog('📡 數據類型:', Array.isArray(responseData) ? '陣列' : typeof responseData)

        // 處理不同的回應格式
        if (Array.isArray(responseData)) {
            // 儲存原始資料
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
                // 顯示成功載入的訊息
                debugLog('🎉 成功載入交易記錄！')
                debugLog('📊 第一筆記錄詳情:', {
                    fundTranId: transactions.value[0]?.fundTranId,
                    customerName: getCustomerName(transactions.value[0]),
                    fundName: getFundName(transactions.value[0]),
                    tranType: transactions.value[0]?.tranType,
                    amount: transactions.value[0]?.amount,
                    status: transactions.value[0]?.status
                })

                // 應用任何現有的篩選條件
                applyClientSideFilters()
            }
        } else if (responseData && responseData.content) {
        } else if (responseData && responseData.content) {
            // Spring Boot Page 格式
            transactions.value = responseData.content
            totalTransactions.value = responseData.totalElements || responseData.content.length
            debugLog('✅ 交易資料載入成功 (Page格式)', {
                count: transactions.value.length,
                total: totalTransactions.value
            })
        } else if (responseData && responseData.data) {
            // 包裝在 data 屬性中
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
        } else if (responseData === null || responseData === undefined) {
            // 空回應
            debugLog('⚠️ API 回應為 null 或 undefined')
            debugLog('🔍 這可能是因為 axios 回應處理的問題')
            debugLog('🔍 請檢查 BackAxiosUtil.js 中的回應攔截器')

            transactions.value = []
            totalTransactions.value = 0
            error.value = '後端回應為空，可能原因：\n1. axios 回應攔截器問題\n2. 後端返回格式異常\n3. CORS 政策問題'
        } else {
            // 其他格式
            debugLog('❌ API 回應格式無法識別')
            debugLog('回應類型:', typeof response?.data)
            debugLog('回應內容:', response?.data)

            error.value = `API 回應格式異常: 收到 ${typeof response?.data} 類型，預期陣列格式`

            // 嘗試看是否是字串格式的JSON
            if (typeof response?.data === 'string') {
                try {
                    const parsed = JSON.parse(response.data)
                    if (Array.isArray(parsed)) {
                        transactions.value = parsed
                        totalTransactions.value = parsed.length
                        debugLog('✅ 成功解析字串格式的JSON')
                        error.value = ''
                    }
                } catch (parseErr) {
                    debugLog('❌ JSON 解析失敗:', parseErr)
                }
            }
        }

    } catch (err) {
        const errorMessage = `獲取交易記錄錯誤: ${err.message || err}`
        debugLog('❌ ' + errorMessage, err)
        debugLog('錯誤詳情:', {
            name: err.name,
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: err.config
        })

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
            // 顯示後端錯誤訊息
            alert(`審核失敗：${result?.message || '未知錯誤'}`)
            console.error('❌ 審核錯誤詳細：', result)
        } else {
            alert('✅ 審核成功')
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

        // 判斷 HTTP status 是否屬於成功範圍
        if (response?.status >= 200 && response?.status < 300) {
            await refreshData()
            return { success: true }
        } else {
            return {
                success: false,
                message: `後端回傳異常，狀態碼: ${response?.status}`,
                rawError: response
            }
        }
    } catch (err) {
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

        if (response?.status >= 200 && response?.status < 300) {
            await refreshData()
            return { success: true }
        } else {
            return {
                success: false,
                message: `後端回傳異常，狀態碼: ${response?.status}`,
                rawError: response
            }
        }
    } catch (err) {
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
    // 根據實際 API 回應結構調整
    return transaction.fundAccount?.member?.mName || '未知客戶'
}

const getCustomerId = (transaction) => {
    // 根據實際 API 回應結構調整
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
        '成功': 'success',
        '處理中': 'processing',
        '失敗': 'failed',
        '待審核': 'pending'
    }
    return classMap[status] || ''
}

const getStatusIcon = (status) => {
    const iconMap = {
        '成功': 'mdi-check-circle',
        '處理中': 'mdi-clock',
        '失敗': 'mdi-alert-circle',
        '待審核': 'mdi-help-circle'
    }
    return iconMap[status] || 'mdi-help-circle'
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

    // 前端排序
    const sorted = [...transactions.value].sort((a, b) => {
        let aVal = a[field]
        let bVal = b[field]

        // 特殊欄位處理
        if (field === 'customerName') {
            aVal = getCustomerName(a)
            bVal = getCustomerName(b)
        } else if (field === 'fundName') {
            aVal = getFundName(a)
            bVal = getFundName(b)
        }

        // 數字類型排序
        if (field === 'amount' || field === 'fee' || field === 'units' || field === 'nav' || field === 'fundTranId') {
            aVal = parseFloat(aVal) || 0
            bVal = parseFloat(bVal) || 0
        }

        // 日期類型排序
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

    // 重置為原始資料
    transactions.value = allTransactions.value
    totalTransactions.value = allTransactions.value.length

    debugLog('✅ 篩選已清除，顯示全部', totalTransactions.value, '筆記錄')
}

// 狀態篩選處理（暫時停用，因為會產生 500 錯誤）
const handleStatusFilter = () => {
    debugLog('⚠️ 狀態篩選暫時停用 - 後端回傳 500 錯誤')
    console.warn('狀態篩選功能暫時停用，因為後端 Controller 不支援 status 參數')

    // 重置狀態篩選
    selectedStatus.value = ''

    alert('狀態篩選功能暫時停用\n原因：後端 Controller 的 status 參數會產生 500 錯誤\n請聯繫後端開發者修正此問題')
}

const refreshData = async () => {
    try {
        debugLog('🔄 開始重新整理資料...')
        loading.value = true
        error.value = ''

        // 並行載入統計和交易記錄
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

// 操作方法
const openNewTransactionModal = () => {
    debugLog('➕ 開啟新增交易對話框')

    // 簡單的新增交易功能演示
    const tranType = prompt('請選擇交易類型 (申購/贖回):')

    if (!tranType || !['申購', '贖回'].includes(tranType)) {
        alert('請輸入有效的交易類型 (申購 或 贖回)')
        return
    }

    const amount = prompt('請輸入交易金額:')

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('請輸入有效的交易金額')
        return
    }

    if (tranType === '申購') {
        createBuyTransaction({
            fundAccId: 2, // 使用現有的基金帳戶
            fundId: 1,    // 使用現有的基金
            amount: parseFloat(amount)
        })
    } else {
        createSellTransaction({
            fundAccId: 2,
            fundId: 1,
            amount: parseFloat(amount)
        })
    }
}

const createBuyTransaction = async (data) => {
    debugLog('📈 創建申購交易:', data)

    const result = await buyFund(data)

    if (result.success) {
        alert('申購交易創建成功！')
    } else {
        alert(`申購交易創建失敗: ${result.message}`)
    }
}

const createSellTransaction = async (data) => {
    debugLog('📉 創建贖回交易:', data)

    const result = await sellFund(data)

    if (result.success) {
        alert('贖回交易創建成功！')
    } else {
        alert(`贖回交易創建失敗: ${result.message}`)
    }
}

const exportTransactions = async () => {
    debugLog('📤 開始匯出交易記錄')

    // 前端匯出為 CSV 格式
    try {
        const headers = [
            '交易編號', '交易日期', '客戶姓名', '帳戶ID', '基金名稱', '基金代碼',
            '交易類型', '交易金額', '手續費', '單位數量', '淨值', '狀態', '備註'
        ]

        const csvData = transactions.value.map(t => [
            t.fundTranId,
            formatDateTime(t.tranTime),
            getCustomerName(t),
            getCustomerId(t),
            getFundName(t),
            getFundCode(t),
            t.tranType,
            t.amount,
            t.fee,
            t.units,
            t.nav,
            t.status,
            t.memo || ''
        ])

        // 組合 CSV 內容
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // 創建下載
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `基金交易記錄_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)

        debugLog('✅ 匯出完成')

    } catch (err) {
        debugLog('❌ 匯出失敗:', err)
        alert('匯出失敗: ' + err.message)
    }
}

const viewTransaction = (transaction) => {
    debugLog('👁️ 查看交易詳情:', transaction.fundTranId)
    console.log('查看交易詳情:', transaction)
}

const rejectTransaction = async (transaction) => {
    debugLog('❌ 拒絕交易:', transaction.fundTranId)
    console.log('拒絕交易功能需要後端新增對應端點')
    alert('拒絕交易功能需要後端新增對應端點')
}

// 監聽器
watch([selectedTransactionType, selectedStatus, startDate, endDate], () => {
    currentPage.value = 0 // 篩選條件改變時回到第一頁
})

// 生命週期
onMounted(async () => {
    console.log('%c🚀 基金交易頁面載入', 'color: #3b82f6; font-weight: bold; font-size: 16px;')

    debugLog('=== 頁面初始化 ===')
    debugLog('API Base:', API_BASE)

    console.log('📡 將直接連接後端資料庫')
    console.log('🔗 API 端點:', API_BASE)

    // 立即載入資料
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

/* 錯誤訊息樣式 */
.error-message {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 1px solid #fca5a5;
    color: #991b1b;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.error-message .mdi {
    font-size: 1.5rem;
    margin-top: 2px;
    flex-shrink: 0;
}

.error-message h3 {
    margin: 0 0 8px 0;
    font-size: 1.125rem;
    font-weight: 600;
}

.error-message p {
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    line-height: 1.5;
}

.error-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.error-actions .btn {
    font-size: 0.875rem;
    padding: 8px 16px;
}

.error-debug {
    background: rgba(0, 0, 0, 0.1);
    padding: 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    margin-top: 8px;
}

.error-debug h4 {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
}

.error-debug p {
    margin: 4px 0;
    font-family: monospace;
}

/* 標題區域 */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.title-area {
    flex: 1;
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
    background: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.btn-icon:hover {
    background-color: #f3f4f6;
}

.btn-icon.danger:hover {
    background-color: #fef2f2;
    color: #dc2626;
}

/* 統計卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-icon {
    font-size: 2.5rem;
    padding: 12px;
    border-radius: 12px;
    background-color: #f3f4f6;
}

.stat-icon.green {
    color: #10b981;
    background-color: #d1fae5;
}

.stat-icon.red {
    color: #ef4444;
    background-color: #fee2e2;
}

.stat-icon.blue {
    color: #3b82f6;
    background-color: #dbeafe;
}

.stat-icon.orange {
    color: #f59e0b;
    background-color: #fef3c7;
}

.stat-info h3 {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 4px;
}

.stat-change {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    color: #6b7280;
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

.transaction-type.exchange {
    background-color: #dbeafe;
    color: #1e40af;
}

.amount,
.fee {
    font-weight: 600;
    text-align: right;
}

.memo {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    color: #6b7280;
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

.status-badge.processing {
    background-color: #fef3c7;
    color: #92400e;
}

.status-badge.failed {
    background-color: #fee2e2;
    color: #991b1b;
}

.status-badge.pending {
    background-color: #e0e7ff;
    color: #3730a3;
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
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .filter-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-select,
    .filter-date {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .fund-transaction-container {
        padding: 16px;
    }

    .header-section {
        flex-direction: column;
        gap: 16px;
    }

    .action-buttons {
        width: 100%;
        flex-direction: column;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .table-container {
        overflow-x: auto;
    }

    .transaction-table {
        min-width: 1000px;
    }

    .pagination-container {
        flex-direction: column;
        gap: 12px;
    }
}

/* 表格行hover效果 */
.transaction-table tbody tr {
    transition: background-color 0.2s;
}

/* 操作按鈕群組 */
.action-buttons {
    opacity: 0;
    transition: opacity 0.2s;
}

.transaction-table tbody tr:hover .action-buttons {
    opacity: 1;
}
</style>