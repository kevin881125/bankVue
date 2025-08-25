<template>
  <div class="fund-account-container">
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
        <h1 class="page-title">基金帳戶管理</h1>
        <p class="page-subtitle">管理客戶基金帳戶開戶申請與狀態</p>
      </div>
      <div class="action-buttons">
        <button class="btn btn-primary" @click="openCreateAccountModal">
          <span class="mdi mdi-plus"></span>
          新增帳戶
        </button>
        <button class="btn btn-secondary" @click="exportAccounts" :disabled="loading">
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
          <span class="mdi mdi-account-check stat-icon green"></span>
          <div class="stat-info">
            <h3>已啟用帳戶</h3>
            <p class="stat-value">{{ stats.activeCount || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="mdi mdi-account-clock stat-icon orange"></span>
          <div class="stat-info">
            <h3>審核中</h3>
            <p class="stat-value">{{ stats.pendingCount || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="mdi mdi-account-cancel stat-icon red"></span>
          <div class="stat-info">
            <h3>已停用</h3>
            <p class="stat-value">{{ stats.inactiveCount || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="mdi mdi-shield-account stat-icon blue"></span>
          <div class="stat-info">
            <h3>風險分佈</h3>
            <p class="stat-value">{{ stats.mostCommonRisk || '-' }}</p>
            <span class="stat-change">最常見</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 篩選和搜尋區 -->
    <div class="filter-section">
      <div class="search-box">
        <span class="mdi mdi-magnify search-icon"></span>
        <input type="text" v-model="searchTerm" @input="debouncedSearch" placeholder="搜尋會員姓名、帳戶ID或會員帳號"
          class="search-input" />
      </div>

      <div class="filter-controls">
        <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
          <option value="">所有狀態</option>
          <option value="啟用">啟用</option>
          <option value="審核中">審核中</option>
          <option value="停用">停用</option>
          <option value="拒絕">拒絕</option>
        </select>

        <select v-model="selectedRiskType" @change="applyFilters" class="filter-select">
          <option value="">所有風險類型</option>
          <option value="保守型">保守型</option>
          <option value="穩健型">穩健型</option>
          <option value="積極型">積極型</option>
          <option value="進取型">進取型</option>
        </select>

        <input type="date" v-model="startDate" @change="applyFilters" class="filter-date" />
        <span class="date-separator">至</span>
        <input type="date" v-model="endDate" @change="applyFilters" class="filter-date" />

        <button class="btn btn-outline" @click="clearFilters">
          <span class="mdi mdi-filter-remove"></span>
          清除篩選
        </button>
      </div>
    </div>

    <!-- 基金帳戶表格 -->
    <div class="table-container">
      <table class="account-table">
        <thead>
          <tr>
            <th @click="sortBy('fundAccId')">
              帳戶ID
              <span class="mdi mdi-sort sort-icon" :class="getSortIcon('fundAccId')"></span>
            </th>
            <th>會員資訊</th>
            <th>關聯存款帳戶</th>
            <th @click="sortBy('riskType')">
              風險類型
              <span class="mdi mdi-sort sort-icon" :class="getSortIcon('riskType')"></span>
            </th>
            <th @click="sortBy('openTime')">
              開戶時間
              <span class="mdi mdi-sort sort-icon" :class="getSortIcon('openTime')"></span>
            </th>
            <th @click="sortBy('status')">
              帳戶狀態
              <span class="mdi mdi-sort sort-icon" :class="getSortIcon('status')"></span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableLoading">
            <td colspan="7" class="loading-row">
              <span class="mdi mdi-loading mdi-spin"></span>
              載入帳戶資料中...
            </td>
          </tr>
          <tr v-else-if="accounts.length === 0">
            <td colspan="7" class="empty-row">
              <span class="mdi mdi-information-outline"></span>
              暫無基金帳戶記錄
            </td>
          </tr>
          <tr v-else v-for="account in accounts" :key="account.fundAccId">
            <td class="account-id">{{ account.fundAccId }}</td>
            <td>
              <div class="member-info">
                <div class="member-name">{{ account.member?.mName || '未知會員' }}</div>
                <div class="member-details">
                  <span class="member-account">{{ account.member?.mAccount }}</span>
                  <span class="member-identity">{{ account.member?.mIdentity }}</span>
                </div>
                <div class="member-contact">
                  <span class="member-phone">{{ account.member?.mPhone }}</span>
                  <span class="member-email">{{ account.member?.mEmail }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="linked-account">
                <div class="account-number">{{ account.account?.accountId || '未關聯' }}</div>
                <div class="account-details">
                  <span class="account-name">{{ account.account?.accountName }}</span>
                  <span class="account-balance">餘額: NT$ {{ formatNumber(account.account?.balance || 0) }}</span>
                </div>
              </div>
            </td>
            <td>
              <span :class="['risk-badge', getRiskClass(account.riskType)]">
                <span :class="['mdi', getRiskIcon(account.riskType)]"></span>
                {{ account.riskType }}
              </span>
            </td>
            <td>{{ formatDateTime(account.openTime) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(account.status)]">
                <span :class="['mdi', getStatusIcon(account.status)]"></span>
                {{ account.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon info" @click="viewFundHoldings(account)" title="查看持有基金"
                  v-if="account.status === '啟用'">
                  <span class="mdi mdi-chart-pie"></span>
                </button>
                <button class="btn-icon info" @click="viewTransactionHistory(account)" title="查看基金交易記錄"
                  v-if="account.status === '啟用'">
                  <span class="mdi mdi-history"></span>
                </button>
                <button class="btn-icon info" @click="viewSipApplications(account)" title="查看定期定額申請"
                  v-if="account.status === '啟用'">
                  <span class="mdi mdi-calendar-clock"></span>
                </button>
                <button class="btn-icon success" @click="approveAccount(account)" title="審核通過"
                  v-if="account.status === '審核中'">
                  <span class="mdi mdi-check"></span>
                </button>
                <button class="btn-icon warning" @click="suspendAccount(account)" title="停用帳戶"
                  v-if="account.status === '啟用'">
                  <span class="mdi mdi-pause"></span>
                </button>
                <button class="btn-icon success" @click="activateAccount(account)" title="啟用帳戶"
                  v-if="account.status === '停用'">
                  <span class="mdi mdi-play"></span>
                </button>
                <button class="btn-icon" @click="editAccount(account)" title="編輯">
                  <span class="mdi mdi-pencil"></span>
                </button>
                <button class="btn-icon danger" @click="rejectAccount(account)" title="拒絕申請"
                  v-if="account.status === '審核中'">
                  <span class="mdi mdi-close"></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁控制 -->
    <div class="pagination-container" v-if="!tableLoading && accounts.length > 0">
      <div class="pagination-info">
        共 {{ totalAccounts }} 個基金帳戶
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
const error = ref('')

// 數據狀態
const accounts = ref([])
const allAccounts = ref([])
const stats = ref({})
const totalAccounts = ref(0)

// 篩選條件
const searchTerm = ref('')
const selectedStatus = ref('')
const selectedRiskType = ref('')
const startDate = ref('')
const endDate = ref('')

// 排序條件
const sortField = ref('openTime')
const sortDirection = ref('desc')

// 除錯日志函數
const debugLog = (message, data = null) => {
  if (debugMode.value) {
    console.log(`🔍 [DEBUG] ${message}`, data || '')
  }
}

// API 路徑
const API_BASE = '/fundAccount'

// 防抖搜尋
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// 計算統計資料
const calculateStats = () => {
  const all = allAccounts.value

  stats.value = {
    activeCount: all.filter(a => a.status === '啟用').length,
    pendingCount: all.filter(a => a.status === '審核中').length,
    inactiveCount: all.filter(a => a.status === '停用').length,
    mostCommonRisk: getMostCommonRisk(all)
  }
}

const getMostCommonRisk = (accounts) => {
  const riskCounts = {}
  accounts.forEach(account => {
    riskCounts[account.riskType] = (riskCounts[account.riskType] || 0) + 1
  })

  let maxCount = 0
  let mostCommon = '-'

  for (const [risk, count] of Object.entries(riskCounts)) {
    if (count > maxCount) {
      maxCount = count
      mostCommon = risk
    }
  }

  return mostCommon
}

// 前端篩選邏輯
const applyFilters = () => {
  debugLog('🔍 執行篩選...')

  let filtered = [...allAccounts.value]

  // 搜尋篩選
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(a =>
      (a.member?.mName || '').toLowerCase().includes(term) ||
      (a.member?.mAccount || '').toLowerCase().includes(term) ||
      (a.member?.mIdentity || '').toLowerCase().includes(term) ||
      (a.account?.accountId || '').toLowerCase().includes(term) ||
      a.fundAccId.toString().includes(term)
    )
    debugLog('🔍 搜尋篩選後:', filtered.length, '筆')
  }

  // 狀態篩選
  if (selectedStatus.value) {
    filtered = filtered.filter(a => a.status === selectedStatus.value)
    debugLog('📊 狀態篩選後:', filtered.length, '筆')
  }

  // 風險類型篩選
  if (selectedRiskType.value) {
    filtered = filtered.filter(a => a.riskType === selectedRiskType.value)
    debugLog('🎯 風險類型篩選後:', filtered.length, '筆')
  }

  // 日期篩選
  if (startDate.value) {
    filtered = filtered.filter(a => {
      const openDate = new Date(a.openTime).toISOString().split('T')[0]
      return openDate >= startDate.value
    })
    debugLog('📅 開始日期篩選後:', filtered.length, '筆')
  }

  if (endDate.value) {
    filtered = filtered.filter(a => {
      const openDate = new Date(a.openTime).toISOString().split('T')[0]
      return openDate <= endDate.value
    })
    debugLog('📅 結束日期篩選後:', filtered.length, '筆')
  }

  accounts.value = filtered
  totalAccounts.value = filtered.length

  // 重新計算統計
  calculateStats()

  debugLog('✅ 篩選完成，顯示', filtered.length, '筆記錄')
}

// API 呼叫方法
const fetchAccounts = async () => {
  try {
    debugLog('=== 開始獲取基金帳戶 ===')
    tableLoading.value = true
    error.value = ''

    const response = await request({
      url: API_BASE,
      method: 'GET'
    })

    debugLog('📡 API 回應:', response)

    // 處理回應數據
    let responseData = response?.data || response

    if (Array.isArray(responseData)) {
      allAccounts.value = responseData
      accounts.value = responseData
      totalAccounts.value = responseData.length

      debugLog('✅ 基金帳戶載入成功', {
        count: accounts.value.length,
        total: totalAccounts.value
      })

      // 計算統計資料
      calculateStats()

      // 應用篩選
      applyFilters()
    } else {
      debugLog('❌ API 回應格式異常')
      error.value = 'API 回應格式異常'
    }

  } catch (err) {
    const errorMessage = `獲取基金帳戶錯誤: ${err.message || err}`
    debugLog('❌ ' + errorMessage, err)
    console.error('基金帳戶載入失敗:', err)
    error.value = errorMessage
  } finally {
    tableLoading.value = false
    debugLog('=== 基金帳戶載入結束 ===')
  }
}

// 狀態更新方法
const updateAccountStatus = async (accountId, newStatus) => {
  try {
    loading.value = true
    debugLog(`📝 更新帳戶狀態: ${accountId} -> ${newStatus}`)

    // 先獲取完整的帳戶資料
    const account = accounts.value.find(a => a.fundAccId === accountId)
    if (!account) {
      throw new Error('找不到指定帳戶')
    }

    // 更新狀態
    const updatedAccount = { ...account, status: newStatus }

    const response = await request({
      url: `${API_BASE}/${accountId}`,
      method: 'PUT',
      data: updatedAccount
    })

    debugLog('✅ 狀態更新回應:', response)

    // 重新載入資料
    await refreshData()

    return { success: true }
  } catch (err) {
    debugLog('❌ 狀態更新錯誤:', err)
    return { success: false, message: err.response?.data?.message || err.message }
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

const getRiskClass = (riskType) => {
  const classMap = {
    '保守型': 'conservative',
    '穩健型': 'moderate',
    '積極型': 'aggressive',
    '進取型': 'speculative'
  }
  return classMap[riskType] || ''
}

const getRiskIcon = (riskType) => {
  const iconMap = {
    '保守型': 'mdi-shield-check',
    '穩健型': 'mdi-shield',
    '積極型': 'mdi-shield-star',
    '進取型': 'mdi-shield-alert'
  }
  return iconMap[riskType] || 'mdi-shield'
}

const getStatusClass = (status) => {
  const classMap = {
    '啟用': 'active',
    '審核中': 'pending',
    '停用': 'inactive',
    '拒絕': 'rejected'
  }
  return classMap[status] || ''
}

const getStatusIcon = (status) => {
  const iconMap = {
    '啟用': 'mdi-check-circle',
    '審核中': 'mdi-clock',
    '停用': 'mdi-pause-circle',
    '拒絕': 'mdi-cancel'
  }
  return iconMap[status] || 'mdi-help-circle'
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'
}

// 排序方法
const sortBy = (field) => {
  debugLog('🔀 排序欄位:', field)

  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }

  // 前端排序
  const sorted = [...accounts.value].sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]

    // 數字類型排序
    if (field === 'fundAccId') {
      aVal = parseInt(aVal) || 0
      bVal = parseInt(bVal) || 0
    }

    // 日期類型排序
    if (field === 'openTime') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  accounts.value = sorted
  debugLog('✅ 排序完成:', field, sortDirection.value)
}

// 清除篩選
const clearFilters = () => {
  debugLog('🧹 清除所有篩選條件')
  searchTerm.value = ''
  selectedStatus.value = ''
  selectedRiskType.value = ''
  startDate.value = ''
  endDate.value = ''

  accounts.value = allAccounts.value
  totalAccounts.value = allAccounts.value.length
  calculateStats()

  debugLog('✅ 篩選已清除')
}

// 重新整理資料
const refreshData = async () => {
  try {
    debugLog('🔄 重新整理資料...')
    await fetchAccounts()
    debugLog('✅ 資料重新整理完成')
  } catch (err) {
    debugLog('❌ 重新整理失敗:', err)
    error.value = `重新整理失敗: ${err.message}`
  }
}

// 操作方法
const openCreateAccountModal = () => {
  debugLog('➕ 開啟新增帳戶對話框')
  alert('新增帳戶功能需要實作表單對話框')
}

const exportAccounts = () => {
  try {
    debugLog('📤 開始匯出基金帳戶')

    const headers = [
      '帳戶ID', '會員姓名', '會員帳號', '身分證字號', '電話', '信箱',
      '關聯帳戶', '帳戶名稱', '帳戶餘額', '風險類型', '開戶時間', '帳戶狀態'
    ]

    const csvData = accounts.value.map(a => [
      a.fundAccId,
      a.member?.mName || '',
      a.member?.mAccount || '',
      a.member?.mIdentity || '',
      a.member?.mPhone || '',
      a.member?.mEmail || '',
      a.account?.accountId || '',
      a.account?.accountName || '',
      a.account?.balance || 0,
      a.riskType,
      formatDateTime(a.openTime),
      a.status
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `基金帳戶記錄_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    debugLog('✅ 匯出完成')
  } catch (err) {
    debugLog('❌ 匯出失敗:', err)
    alert('匯出失敗: ' + err.message)
  }
}

// 查看持有基金
const viewFundHoldings = async (account) => {
  try {
    debugLog('📊 查看持有基金:', account.fundAccId)
    loading.value = true

    const response = await request({
      url: '/fundHoldings',
      method: 'GET',
      params: { fundAccId: account.fundAccId }
    })

    let responseData = response?.data || response
    debugLog('📊 持有基金回應:', responseData)

    if (Array.isArray(responseData)) {
      showFundHoldingsModal(account, responseData)
    } else {
      alert('無法載入持有基金資料')
    }
  } catch (err) {
    debugLog('❌ 查看持有基金錯誤:', err)
    alert(`查看持有基金失敗: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 查看交易記錄
const viewTransactionHistory = (account) => {
  debugLog('📋 查看交易記錄:', account.fundAccId)

  // 導航到交易記錄頁面，帶上 fundAccId 參數
  const url = `/yuzubank/backmain/fund/fundTransaction?fundAccId=${account.fundAccId}`
  window.open(url, '_blank')
}

// 查看定期定額申請
const viewSipApplications = async (account) => {
  try {
    debugLog('🕒 查看定期定額申請:', account.fundAccId)
    loading.value = true

    const response = await request({
      url: `/fundSip/${account.fundAccId}`,
      method: 'GET'
    })

    let responseData = response?.data || response
    debugLog('🕒 定期定額回應:', responseData)

    if (Array.isArray(responseData)) {
      showSipApplicationsModal(account, responseData)
    } else {
      alert('無法載入定期定額申請資料')
    }
  } catch (err) {
    debugLog('❌ 查看定期定額錯誤:', err)
    alert(`查看定期定額申請失敗: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 顯示持有基金對話框
const showFundHoldingsModal = (account, holdings) => {
  let modalContent = `${account.member?.mName} 的持有基金：\n\n`

  if (holdings.length === 0) {
    modalContent += '目前沒有持有任何基金'
  } else {
    holdings.forEach((holding, index) => {
      const fundName = holding.fund?.fundName || '未知基金'
      const fundCode = holding.fund?.fundCode || '-'
      const units = formatNumber(holding.units, 4)
      const cost = formatNumber(holding.cost, 2)
      const updateTime = formatDateTime(holding.updateTime)

      modalContent += `${index + 1}. ${fundName}\n`
      modalContent += `   基金代碼: ${fundCode}\n`
      modalContent += `   持有單位: ${units}\n`
      modalContent += `   總成本: NT$ ${cost}\n`
      modalContent += `   更新時間: ${updateTime}\n\n`
    })

    const totalCost = holdings.reduce((sum, h) => sum + (parseFloat(h.cost) || 0), 0)
    modalContent += `總投資成本: NT$ ${formatNumber(totalCost, 2)}`
  }

  alert(modalContent)
}

// 顯示定期定額申請對話框  
const showSipApplicationsModal = (account, sipApplications) => {
  let modalContent = `${account.member?.mName} 的定期定額申請：\n\n`

  if (sipApplications.length === 0) {
    modalContent += '目前沒有定期定額申請'
  } else {
    sipApplications.forEach((sip, index) => {
      const fundName = sip.fund?.fundName || '未知基金'
      const fundCode = sip.fund?.fundCode || '-'
      const amount = formatNumber(sip.amount, 2)
      const frequency = sip.frequency || '-'
      const startDate = sip.startDate || '-'
      const endDate = sip.endDate || '無期限'
      const status = sip.status || '-'

      modalContent += `${index + 1}. ${fundName}\n`
      modalContent += `   基金代碼: ${fundCode}\n`
      modalContent += `   扣款金額: NT$ ${amount}\n`
      modalContent += `   扣款頻率: ${frequency}\n`
      modalContent += `   開始日期: ${startDate}\n`
      modalContent += `   結束日期: ${endDate}\n`
      modalContent += `   狀態: ${status}\n\n`
    })

    const totalAmount = sipApplications
      .filter(s => s.status === '啟用' || s.status === '執行中')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
    modalContent += `每月總扣款: NT$ ${formatNumber(totalAmount, 2)}`
  }

  alert(modalContent)
}

const approveAccount = async (account) => {
  if (confirm(`確定要審核通過 ${account.member?.mName} 的基金帳戶申請嗎？`)) {
    const result = await updateAccountStatus(account.fundAccId, '啟用')
    if (result.success) {
      alert('審核通過！帳戶已啟用')
    } else {
      alert(`審核失敗: ${result.message}`)
    }
  }
}

const suspendAccount = async (account) => {
  if (confirm(`確定要停用 ${account.member?.mName} 的基金帳戶嗎？`)) {
    const result = await updateAccountStatus(account.fundAccId, '停用')
    if (result.success) {
      alert('帳戶已停用')
    } else {
      alert(`停用失敗: ${result.message}`)
    }
  }
}

const activateAccount = async (account) => {
  if (confirm(`確定要重新啟用 ${account.member?.mName} 的基金帳戶嗎？`)) {
    const result = await updateAccountStatus(account.fundAccId, '啟用')
    if (result.success) {
      alert('帳戶已重新啟用')
    } else {
      alert(`啟用失敗: ${result.message}`)
    }
  }
}

const editAccount = (account) => {
  debugLog('✏️ 編輯帳戶:', account.fundAccId)
  alert('編輯功能需要實作表單對話框')
}

const rejectAccount = async (account) => {
  if (confirm(`確定要拒絕 ${account.member?.mName} 的基金帳戶申請嗎？`)) {
    const result = await updateAccountStatus(account.fundAccId, '拒絕')
    if (result.success) {
      alert('申請已拒絕')
    } else {
      alert(`拒絕失敗: ${result.message}`)
    }
  }
}

// 生命週期
onMounted(async () => {
  console.log('%c🚀 基金帳戶頁面載入', 'color: #3b82f6; font-weight: bold; font-size: 16px;')
  debugLog('=== 頁面初始化 ===')
  debugLog('API Base:', API_BASE)

  await refreshData()
})
</script>

<style scoped>
.fund-account-container {
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
}

.error-actions .btn {
  font-size: 0.875rem;
  padding: 8px 16px;
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
  color: #6b7280;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

.btn-icon.success {
  color: #10b981;
}

.btn-icon.success:hover {
  background-color: #d1fae5;
}

.btn-icon.warning {
  color: #f59e0b;
}

.btn-icon.warning:hover {
  background-color: #fef3c7;
}

.btn-icon.danger {
  color: #ef4444;
}

.btn-icon.danger {
  color: #ef4444;
}

.btn-icon.danger:hover {
  background-color: #fee2e2;
}

.btn-icon.info {
  color: #3b82f6;
}

.btn-icon.info:hover {
  background-color: #dbeafe;
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

.account-table {
  width: 100%;
  border-collapse: collapse;
}

.account-table th {
  background-color: #f9fafb;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.account-table th:hover {
  background-color: #f3f4f6;
}

.account-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.account-table tbody tr:hover {
  background-color: #f9fafb;
}

.sort-icon {
  margin-left: 4px;
  font-size: 0.75rem;
  opacity: 0.5;
}

.account-id {
  font-family: monospace;
  font-weight: 600;
  color: #3b82f6;
}

/* 會員資訊樣式 */
.member-info {
  line-height: 1.4;
}

.member-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.member-details {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.member-account {
  font-size: 0.75rem;
  color: #3b82f6;
  background-color: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
}

.member-identity {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.member-contact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-phone,
.member-email {
  font-size: 0.75rem;
  color: #6b7280;
}

/* 關聯帳戶樣式 */
.linked-account {
  line-height: 1.4;
}

.account-number {
  font-family: monospace;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-name {
  font-size: 0.75rem;
  color: #6b7280;
}

.account-balance {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

/* 風險類型標籤 */
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.risk-badge.conservative {
  background-color: #e0e7ff;
  color: #3730a3;
}

.risk-badge.moderate {
  background-color: #d1fae5;
  color: #065f46;
}

.risk-badge.aggressive {
  background-color: #fef3c7;
  color: #92400e;
}

.risk-badge.speculative {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 狀態標籤 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.account-table tbody tr:hover .action-buttons {
  opacity: 1;
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
  .fund-account-container {
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

  .account-table {
    min-width: 1000px;
  }

  .member-details {
    flex-direction: column;
    gap: 2px;
  }

  .account-details {
    gap: 1px;
  }
}

/* 表格行hover效果 */
.account-table tbody tr {
  transition: background-color 0.2s;
}
</style>