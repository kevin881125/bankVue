<!-- 1. 基金首頁 - FundIndex.vue -->
<template>
    <div class="fund-container">
        <div class="fund-main">
            <!-- 載入中狀態 -->
            <div v-if="loading" class="fund-loading">
                <div class="fund-spinner"></div>
                正在檢查您的基金帳戶...
            </div>

            <!-- 有基金帳戶 - 顯示帳戶資訊和功能 -->
            <div v-else-if="hasFundAccount" class="fund-dashboard">
                <!-- 帳戶總覽 -->
                <div class="fund-header">
                    <h1 class="fund-title">我的基金投資</h1>
                    <p class="fund-subtitle">管理您的基金投資組合</p>
                </div>

                <!-- 帳戶卡片 -->
                <div class="fund-account-summary fund-mb-lg">
                    <div v-for="account in fundAccounts" :key="account.accountId" class="fund-card fund-account-card"
                        @click="goToAccountDetail(account.accountId)">
                        <div class="fund-card-header">
                            <h3 class="fund-card-title">{{ account.accountName }}</h3>
                            <span class="fund-badge fund-badge-primary">{{ account.accountNumber }}</span>
                        </div>
                        <div class="fund-card-body">
                            <div class="fund-account-stats">
                                <div class="fund-stat-item">
                                    <span class="fund-stat-label">總投資金額</span>
                                    <span class="fund-stat-value fund-value-neutral">NT$ {{
                                        formatCurrency(account.totalBalance) }}</span>
                                </div>
                                <div class="fund-stat-item">
                                    <span class="fund-stat-label">持有單位數</span>
                                    <span class="fund-stat-value fund-value-neutral">{{ formatUnits(account.totalUnits)
                                    }}</span>
                                </div>
                                <div class="fund-stat-item">
                                    <span class="fund-stat-label">風險承受度</span>
                                    <span class="fund-badge" :class="{
                                        'fund-badge-danger': account.riskTolerance === '高',
                                        'fund-badge-warning': account.riskTolerance === '中',
                                        'fund-badge-secondary': account.riskTolerance === '低'
                                    }">
                                        {{ account.riskTolerance }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 快速功能入口 -->
                <div class="fund-quick-actions fund-mb-lg">
                    <div class="fund-action-grid">
                        <div class="fund-action-card" @click="goToFundSearch">
                            <div class="fund-action-icon">🔍</div>
                            <h4>基金搜尋</h4>
                            <p>查看可申購的基金商品</p>
                        </div>

                        <div class="fund-action-card" @click="goToHolding">
                            <div class="fund-action-icon">📈</div>
                            <h4>持有基金</h4>
                            <p>檢視目前持有的基金</p>
                        </div>

                        <div class="fund-action-card" @click="goToTransactionHistory">
                            <div class="fund-action-icon">📋</div>
                            <h4>交易記錄</h4>
                            <p>查看申購贖回歷史</p>
                        </div>

                        <div class="fund-action-card" @click="goToPerformance">
                            <div class="fund-action-icon">📊</div>
                            <h4>投資績效</h4>
                            <p>分析投資表現</p>
                        </div>
                    </div>
                </div>

                <!-- 熱門基金推薦 -->
                <div class="fund-popular-section">
                    <h3 class="fund-section-title">熱門基金推薦</h3>
                    <div class="fund-card-grid">
                        <FundCard v-for="fund in popularFunds" :key="fund.fundId" :fund="fund"
                            @view-detail="goToFundDetail" @purchase="openPurchaseModal" />
                    </div>
                </div>

                <!-- 最近交易記錄 -->
                <TransactionHistory :member-id="currentMemberId" :limit="5" class="fund-mt-lg" />
            </div>

            <!-- 無基金帳戶 - 顯示申辦流程 -->
            <div v-else class="fund-welcome">
                <div class="fund-welcome-content">
                    <div class="fund-welcome-hero">
                        <h1 class="fund-title">歡迎來到基金投資</h1>
                        <p class="fund-subtitle">開始您的投資理財之旅</p>
                    </div>

                    <div class="fund-benefits fund-mb-lg">
                        <h3>基金投資的優勢</h3>
                        <div class="fund-benefit-grid">
                            <div class="fund-benefit-item">
                                <div class="fund-benefit-icon">🛡️</div>
                                <h4>專業管理</h4>
                                <p>由專業基金經理人操盤管理</p>
                            </div>
                            <div class="fund-benefit-item">
                                <div class="fund-benefit-icon">📊</div>
                                <h4>分散風險</h4>
                                <p>投資組合分散降低單一風險</p>
                            </div>
                            <div class="fund-benefit-item">
                                <div class="fund-benefit-icon">💰</div>
                                <h4>門檻較低</h4>
                                <p>小額資金即可參與投資</p>
                            </div>
                            <div class="fund-benefit-item">
                                <div class="fund-benefit-icon">📱</div>
                                <h4>操作便利</h4>
                                <p>線上即可完成申購贖回</p>
                            </div>
                        </div>
                    </div>

                    <div class="fund-action-section">
                        <h3>開始投資只需兩步驟</h3>
                        <div class="fund-steps">
                            <div class="fund-step">
                                <div class="fund-step-number">1</div>
                                <div class="fund-step-content">
                                    <h4>風險評量</h4>
                                    <p>瞭解您的投資屬性</p>
                                </div>
                            </div>
                            <div class="fund-step-arrow">→</div>
                            <div class="fund-step">
                                <div class="fund-step-number">2</div>
                                <div class="fund-step-content">
                                    <h4>申辦帳戶</h4>
                                    <p>建立專屬基金帳戶</p>
                                </div>
                            </div>
                        </div>

                        <div class="fund-cta-buttons">
                            <button class="fund-btn fund-btn-success fund-btn-lg" @click="startApplication">
                                立即開始投資
                            </button>
                            <button class="fund-btn fund-btn-secondary fund-btn-lg" @click="viewFunds">
                                先看看基金商品
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 錯誤訊息 -->
            <div v-if="error" class="fund-error">
                <div class="fund-empty">
                    <div class="fund-empty-icon">⚠️</div>
                    <h3>載入失敗</h3>
                    <p>{{ error }}</p>
                    <button class="fund-btn fund-btn-primary fund-mt-md" @click="checkFundAccount">
                        重新載入
                    </button>
                </div>
            </div>
        </div>

        <!-- 申購彈窗 -->
        <div v-if="showPurchaseModal" class="fund-modal-overlay" @click="closePurchaseModal">
            <div class="fund-modal-content" @click.stop>
                <FundPurchaseForm :account-id="selectedAccount" :fund-id="selectedFund?.fundId" :available-funds="[]"
                    @success="handlePurchaseSuccess" @cancel="closePurchaseModal" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/MemberStore'
import { fundApi } from '@/api/fundApi'
import FundCard from '@/components/fund/FundCard.vue'
import FundPurchaseForm from '@/components/fund/FundPurchaseForm.vue'
import TransactionHistory from '@/components/fund/TransactionHistory.vue'

const router = useRouter()
const memberStore = useMemberStore()

// 響應式數據
const loading = ref(true)
const error = ref('')
const hasFundAccount = ref(false)
const fundAccounts = ref([])
const popularFunds = ref([])
const showPurchaseModal = ref(false)
const selectedFund = ref(null)
const selectedAccount = ref(null)

const currentMemberId = ref(memberStore.mId)

// 頁面載入時檢查基金帳戶
onMounted(async () => {
    await checkFundAccount()
    if (hasFundAccount.value) {
        await loadPopularFunds()
    }
})

// 檢查用戶是否有基金帳戶
const checkFundAccount = async () => {
    loading.value = true
    error.value = ''

    try {
        if (!memberStore.isLoggedIn) {
            router.push('/yuzubank/frontLogin')
            return
        }

        const memberId = memberStore.mId
        if (!memberId) {
            throw new Error('用戶資訊不存在，請重新登入')
        }

        const response = await fundApi.getFundAccountsByMember(memberId)

        if (response.success) {
            const accounts = response.data
            if (accounts && accounts.length > 0) {
                hasFundAccount.value = true
                fundAccounts.value = accounts
                selectedAccount.value = accounts[0].accountId
            } else {
                hasFundAccount.value = false
            }
        } else {
            throw new Error(response.message || '查詢基金帳戶失敗')
        }
    } catch (err) {
        console.error('檢查基金帳戶失敗:', err)
        error.value = err.message || err || '系統錯誤，請稍後再試'
        hasFundAccount.value = false
    } finally {
        loading.value = false
    }
}

// 載入熱門基金
const loadPopularFunds = async () => {
    try {
        const response = await fundApi.getAvailableFunds()
        if (response.success) {
            popularFunds.value = response.data.slice(0, 4)
        }
    } catch (err) {
        console.error('載入熱門基金失敗:', err)
    }
}

// 導航功能
const startApplication = () => {
    router.push('/yuzubank/fund/risk-assessment')
}

const viewFunds = () => {
    router.push('/yuzubank/fund/search')
}

const goToAccountDetail = (accountId) => {
    router.push(`/yuzubank/fund/account/detail/${accountId}`)
}

const goToFundSearch = () => {
    router.push('/yuzubank/fund/search')
}

const goToHolding = () => {
    router.push('/yuzubank/fund/holding')
}

const goToTransactionHistory = () => {
    router.push('/yuzubank/fund/transaction/history')
}

const goToPerformance = () => {
    router.push('/yuzubank/fund/performance')
}

const goToFundDetail = (fund) => {
    router.push(`/yuzubank/fund/detail/${fund.fundId}`)
}

const openPurchaseModal = (fund) => {
    selectedFund.value = fund
    showPurchaseModal.value = true
}

const closePurchaseModal = () => {
    showPurchaseModal.value = false
    selectedFund.value = null
}

const handlePurchaseSuccess = () => {
    closePurchaseModal()
    // 重新載入帳戶資訊
    checkFundAccount()
}

// 工具函數
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW').format(amount || 0)
}

const formatUnits = (units) => {
    return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
    }).format(units || 0)
}
</script>
<style scoped>
@import '@/styles/fundStyles.css';
</style>