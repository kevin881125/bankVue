<!-- 4. 交易記錄組件 -->
<!-- TransactionHistory.vue -->
<template>
    <div class="fund-card">
        <div class="fund-card-header">
            <h3 class="fund-card-title">交易記錄</h3>
            <div class="fund-filter-actions">
                <select v-model="filterType" class="fund-input fund-select">
                    <option value="">全部交易</option>
                    <option value="BUY">申購</option>
                    <option value="SELL">贖回</option>
                </select>
                <select v-model="filterStatus" class="fund-input fund-select">
                    <option value="">全部狀態</option>
                    <option value="PENDING">待審核</option>
                    <option value="APPROVED">審核通過</option>
                    <option value="COMPLETED">交易完成</option>
                    <option value="REJECTED">審核駁回</option>
                </select>
            </div>
        </div>

        <div class="fund-card-body">
            <div v-if="loading" class="fund-loading">
                <div class="fund-spinner"></div>
                載入中...
            </div>

            <div v-else-if="filteredTransactions.length === 0" class="fund-empty">
                <div class="fund-empty-icon">📊</div>
                <p>暫無交易記錄</p>
            </div>

            <div v-else class="fund-transaction-list">
                <div v-for="transaction in filteredTransactions" :key="transaction.transactionId"
                    class="fund-transaction-item">
                    <div class="fund-transaction-header">
                        <div>
                            <span class="fund-badge fund-badge-primary">{{ transaction.fundName }}</span>
                            <span class="fund-badge" :class="{
                                'fund-badge-success': transaction.transactionType === 'BUY',
                                'fund-badge-danger': transaction.transactionType === 'SELL'
                            }">
                                {{ transaction.transactionType === 'BUY' ? '申購' : '贖回' }}
                            </span>
                        </div>
                        <span class="fund-badge" :class="getStatusBadgeClass(transaction.status)">
                            {{ getStatusText(transaction.status) }}
                        </span>
                    </div>

                    <div class="fund-transaction-details">
                        <div class="fund-flex fund-flex-between">
                            <span>申請日期</span>
                            <span>{{ formatDateTime(transaction.applicationDate) }}</span>
                        </div>
                        <div class="fund-flex fund-flex-between">
                            <span>{{ transaction.transactionType === 'BUY' ? '申購金額' : '贖回單位' }}</span>
                            <span class="fund-value">
                                {{ transaction.transactionType === 'BUY'
                                    ? `NT$ ${formatCurrency(transaction.applicationAmount)}`
                                    : `${formatUnits(transaction.applicationUnits)} 單位`
                                }}
                            </span>
                        </div>
                        <div v-if="transaction.actualAmount" class="fund-flex fund-flex-between">
                            <span>實際{{ transaction.transactionType === 'BUY' ? '單位數' : '金額' }}</span>
                            <span class="fund-value">
                                {{ transaction.transactionType === 'BUY'
                                    ? `${formatUnits(transaction.actualUnits)} 單位`
                                    : `NT$ ${formatCurrency(transaction.actualAmount)}`
                                }}
                            </span>
                        </div>
                        <div v-if="transaction.navValue" class="fund-flex fund-flex-between">
                            <span>成交淨值</span>
                            <span>NT$ {{ formatCurrency(transaction.navValue) }}</span>
                        </div>
                        <div v-if="transaction.feeAmount > 0" class="fund-flex fund-flex-between">
                            <span>手續費</span>
                            <span>NT$ {{ formatCurrency(transaction.feeAmount) }}</span>
                        </div>
                        <div v-if="transaction.reviewNote" class="fund-transaction-note">
                            <span>備註：{{ transaction.reviewNote }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fundApi } from '@/api/fundApi'

const props = defineProps({
    memberId: Number,
    accountId: Number,
    limit: {
        type: Number,
        default: 10
    }
})

const loading = ref(false)
const transactions = ref([])
const filterType = ref('')
const filterStatus = ref('')

const filteredTransactions = computed(() => {
    let filtered = transactions.value

    if (filterType.value) {
        filtered = filtered.filter(t => t.transactionType === filterType.value)
    }

    if (filterStatus.value) {
        filtered = filtered.filter(t => t.status === filterStatus.value)
    }

    return filtered
})

const loadTransactions = async () => {
    try {
        loading.value = true

        let response
        if (props.memberId) {
            response = await fundApi.getMemberTransactions(props.memberId, {
                page: 0,
                size: props.limit,
                sortBy: 'applicationDate',
                sortDir: 'DESC'
            })
        } else if (props.accountId) {
            response = await fundApi.getCompletedTransactions(props.accountId, {
                page: 0,
                size: props.limit
            })
        }

        if (response?.success) {
            transactions.value = response.data.content || response.data
        }
    } catch (error) {
        console.error('載入交易記錄失敗:', error)
    } finally {
        loading.value = false
    }
}

const getStatusText = (status) => {
    const statusMap = {
        'PENDING': '待審核',
        'APPROVED': '審核通過',
        'COMPLETED': '交易完成',
        'REJECTED': '審核駁回',
        'CANCELLED': '已取消'
    }
    return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
    const classMap = {
        'PENDING': 'fund-badge-warning',
        'APPROVED': 'fund-badge-primary',
        'COMPLETED': 'fund-badge-success',
        'REJECTED': 'fund-badge-danger',
        'CANCELLED': 'fund-badge-secondary'
    }
    return classMap[status] || 'fund-badge-secondary'
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW').format(amount || 0)
}

const formatUnits = (units) => {
    return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
    }).format(units || 0)
}

const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('zh-TW')
}

onMounted(() => {
    loadTransactions()
})
</script>
<style scoped>
@import '@/styles/fundStyles.css';
</style>