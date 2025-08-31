// fundApi.js - 基金相關API服務
import { request } from '@/utils/FontAxiosUtil' // 使用你現有的攔截器

// 基金API服務
export const fundApi = {
    // ==== 基金帳戶相關 ====

    // 查詢會員基金帳戶
    getFundAccountsByMember(memberId) {
        return request({
            url: `/fund/account/member/${memberId}`,
            method: 'GET'
        })
    },

    // 申辦基金帳戶
    createFundAccount(accountData) {
        return request({
            url: '/fund/account/create',
            method: 'POST',
            data: accountData
        })
    },

    // 查詢基金帳戶詳情
    getFundAccountDetail(accountNumber) {
        return request({
            url: `/fund/account/${accountNumber}`,
            method: 'GET'
        })
    },

    // ==== 基金持倉相關 ====

    // 查詢會員持有基金
    getMemberHoldings(memberId) {
        return request({
            url: `/fund/holding/member/${memberId}`,
            method: 'GET'
        })
    },

    // 查詢帳戶持倉
    getAccountHoldings(accountId) {
        return request({
            url: `/fund/holding/account/${accountId}`,
            method: 'GET'
        })
    },

    // ==== 基金交易相關 ====

    // 申購基金
    purchaseFund(purchaseData) {
        return request({
            url: '/fund/transaction/purchase',
            method: 'POST',
            data: purchaseData
        })
    },

    // 贖回基金
    redeemFund(redeemData) {
        return request({
            url: '/fund/transaction/redeem',
            method: 'POST',
            data: redeemData
        })
    },

    // 查詢會員交易記錄
    getMemberTransactions(memberId, params = {}) {
        return request({
            url: `/fund/transaction/member/${memberId}`,
            method: 'GET',
            params
        })
    },

    // 查詢已完成交易記錄
    getCompletedTransactions(accountId, params = {}) {
        return request({
            url: `/fund/transaction/completed/account/${accountId}`,
            method: 'GET',
            params
        })
    },

    // ==== 基金查詢相關 ====

    // 查詢可申購基金
    getAvailableFunds() {
        return request({
            url: '/fund/available',
            method: 'GET'
        })
    },

    // 搜尋基金
    searchFunds(params = {}) {
        return request({
            url: '/fund/search',
            method: 'GET',
            params
        })
    },

    // 查詢基金詳情
    getFundDetail(fundId) {
        return request({
            url: `/fund/${fundId}`,
            method: 'GET'
        })
    },

    // 查詢基金淨值歷史
    getFundNavHistory(fundId, params = {}) {
        return request({
            url: `/fund/${fundId}/nav`,
            method: 'GET',
            params
        })
    },

    // 查詢最新淨值
    getLatestNav(fundId) {
        return request({
            url: `/fund/${fundId}/nav/latest`,
            method: 'GET'
        })
    },

    // ==== 風險評量相關 ====

    // 風險屬性評量
    evaluateRiskTolerance(assessmentData) {
        return request({
            url: '/fund/risk-assessment/evaluate',
            method: 'POST',
            data: assessmentData
        })
    },

    // ==== 後台管理API ====

    // 新增基金
    createFund(fundData) {
        return request({
            url: '/admin/fund/create',
            method: 'POST',
            data: fundData
        })
    },

    // 更新基金狀態
    updateFundStatus(fundId, status) {
        return request({
            url: `/admin/fund/${fundId}/status`,
            method: 'PUT',
            params: { status }
        })
    },

    // 更新基金淨值
    updateTodayNavValue(fundId, navData) {
        return request({
            url: `/admin/fund/${fundId}/nav`,
            method: 'PUT',
            data: navData
        })
    },

    // 批量更新所有基金淨值
    updateAllTodayNavValues() {
        return request({
            url: '/admin/fund/nav/update-all',
            method: 'POST'
        })
    },

    // 查詢待審核交易
    getPendingTransactions() {
        return request({
            url: '/admin/transaction/pending',
            method: 'GET'
        })
    },

    // 審核交易（通過）
    approveTransaction(transactionId, reviewerId, reviewNote = '') {
        return request({
            url: `/admin/transaction/${transactionId}/approve`,
            method: 'PUT',
            params: { reviewerId, reviewNote }
        })
    },

    // 審核交易（拒絕）
    rejectTransaction(transactionId, reviewerId, reviewNote) {
        return request({
            url: `/admin/transaction/${transactionId}/reject`,
            method: 'PUT',
            params: { reviewerId, reviewNote }
        })
    },

    // 批量審核交易
    batchApproveTransactions(approvalRequests) {
        return request({
            url: '/admin/transaction/batch-approval',
            method: 'POST',
            data: approvalRequests
        })
    },

    // ==== 後台資料查詢 ====

    // 查詢所有基金
    getAllFunds(params = {}) {
        return request({
            url: '/admin/data/funds',
            method: 'GET',
            params
        })
    },

    // 查詢所有基金帳戶
    getAllFundAccounts(params = {}) {
        return request({
            url: '/admin/data/accounts',
            method: 'GET',
            params
        })
    },

    // 查詢所有持倉記錄
    getAllHoldings(params = {}) {
        return request({
            url: '/admin/data/holdings',
            method: 'GET',
            params
        })
    },

    // 查詢所有交易記錄
    getAllTransactions(params = {}) {
        return request({
            url: '/admin/data/transactions',
            method: 'GET',
            params
        })
    },

    // 查詢所有淨值記錄
    getAllNavValues(params = {}) {
        return request({
            url: '/admin/data/nav-values',
            method: 'GET',
            params
        })
    }
}

// 導出常用的API分組
export const accountApi = {
    getByMember: fundApi.getFundAccountsByMember,
    create: fundApi.createFundAccount,
    getDetail: fundApi.getFundAccountDetail,
}

export const holdingApi = {
    getByMember: fundApi.getMemberHoldings,
    getByAccount: fundApi.getAccountHoldings,
}

export const transactionApi = {
    purchase: fundApi.purchaseFund,
    redeem: fundApi.redeemFund,
    getByMember: fundApi.getMemberTransactions,
    getCompleted: fundApi.getCompletedTransactions,
}

export const fundQueryApi = {
    getAvailable: fundApi.getAvailableFunds,
    search: fundApi.searchFunds,
    getDetail: fundApi.getFundDetail,
    getNavHistory: fundApi.getFundNavHistory,
    getLatestNav: fundApi.getLatestNav,
}

export const adminApi = {
    // 基金管理
    fund: {
        create: fundApi.createFund,
        updateStatus: fundApi.updateFundStatus,
        getAll: fundApi.getAllFunds,
    },

    // 淨值管理
    nav: {
        updateToday: fundApi.updateTodayNavValue,
        updateAll: fundApi.updateAllTodayNavValues,
        getAll: fundApi.getAllNavValues,
    },

    // 交易審核
    transaction: {
        getPending: fundApi.getPendingTransactions,
        approve: fundApi.approveTransaction,
        reject: fundApi.rejectTransaction,
        batchApproval: fundApi.batchApproveTransactions,
        getAll: fundApi.getAllTransactions,
    },

    // 資料查詢
    data: {
        accounts: fundApi.getAllFundAccounts,
        holdings: fundApi.getAllHoldings,
    }
}

// API錯誤處理工具 - 適配你現有的攔截器
export const handleApiError = (error, defaultMessage = '操作失敗') => {
    // 由於你的攔截器已經處理了錯誤，這裡主要用於組件中的額外處理
    console.error('API調用失敗:', error)
    return error?.message || defaultMessage
}

// API響應數據提取工具 - 適配你的攔截器回傳格式
export const extractApiData = (response) => {
    // 你的攔截器已經提取了 response.data，所以這裡直接使用
    if (response?.success) {
        return response.data
    }
    throw new Error(response?.message || '數據格式錯誤')
}

// 分頁參數構建工具
export const buildPageParams = (page = 0, size = 10, sortBy = 'createdDate', sortDir = 'DESC') => {
    return {
        page,
        size,
        sortBy,
        sortDir
    }
}











