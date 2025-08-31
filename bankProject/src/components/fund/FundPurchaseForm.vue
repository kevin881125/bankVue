<!-- 1. 基金申購組件 -->
<!-- FundPurchaseForm.vue -->
<template>
    <div class="fund-card">
        <div class="fund-card-header">
            <h3 class="fund-card-title">基金申購</h3>
            <span v-if="fundInfo" class="fund-badge fund-badge-primary">{{ fundInfo.fundName }}</span>
        </div>

        <div class="fund-card-body">
            <form @submit.prevent="handleSubmit">
                <!-- 基金選擇 -->
                <div v-if="!fundId" class="fund-form-group">
                    <label class="fund-label">選擇基金</label>
                    <select v-model="selectedFund" class="fund-input fund-select" required>
                        <option value="">請選擇基金</option>
                        <option v-for="fund in availableFunds" :key="fund.fundId" :value="fund.fundId">
                            {{ fund.fundName }} - {{ fund.fundType }}
                        </option>
                    </select>
                </div>

                <!-- 申購金額 -->
                <div class="fund-form-group">
                    <label class="fund-label">申購金額 (NT$)</label>
                    <input v-model="formData.amount" type="number" step="0.01" :min="minInvestment" class="fund-input"
                        placeholder="請輸入申購金額" required />
                    <div class="fund-text-sm fund-text-secondary fund-mt-sm">
                        最低申購金額：NT$ {{ formatCurrency(minInvestment) }}
                    </div>
                </div>

                <!-- 預估單位數 -->
                <div v-if="estimatedUnits > 0" class="fund-form-group">
                    <label class="fund-label">預估單位數</label>
                    <div class="fund-input-readonly">
                        {{ formatUnits(estimatedUnits) }} 單位
                    </div>
                    <div class="fund-text-sm fund-text-secondary fund-mt-sm">
                        以最新淨值 NT$ {{ formatCurrency(currentNav) }} 計算
                    </div>
                </div>

                <!-- 備註 -->
                <div class="fund-form-group">
                    <label class="fund-label">備註 (選填)</label>
                    <textarea v-model="formData.memo" class="fund-input" rows="3" placeholder="請輸入備註"></textarea>
                </div>

                <div class="fund-card-footer">
                    <button type="button" class="fund-btn fund-btn-secondary" @click="handleCancel">
                        取消
                    </button>
                    <button type="submit" class="fund-btn fund-btn-success" :disabled="loading || !isValid">
                        <span v-if="loading" class="fund-spinner"></span>
                        {{ loading ? '處理中...' : '確認申購' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { fundApi } from '@/api/fundApi'

const props = defineProps({
    fundId: String, // 如果指定則只能申購該基金
    accountId: {
        type: Number,
        required: true
    },
    availableFunds: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['success', 'cancel'])

const loading = ref(false)
const selectedFund = ref(props.fundId || '')
const fundInfo = ref(null)
const currentNav = ref(0)
const formData = ref({
    amount: '',
    memo: ''
})

// 計算屬性
const minInvestment = computed(() => {
    return fundInfo.value ? fundInfo.value.minInvestment : 1000
})

const estimatedUnits = computed(() => {
    if (!formData.value.amount || !currentNav.value) return 0
    return parseFloat(formData.value.amount) / currentNav.value
})

const isValid = computed(() => {
    return selectedFund.value &&
        formData.value.amount &&
        parseFloat(formData.value.amount) >= minInvestment.value
})

// 監聽基金選擇變化
watch(selectedFund, async (newFundId) => {
    if (newFundId) {
        await loadFundInfo(newFundId)
    }
})

// 載入基金資訊
const loadFundInfo = async (fundId) => {
    try {
        loading.value = true
        const [fundResponse, navResponse] = await Promise.all([
            fundApi.getFundDetail(fundId),
            fundApi.getLatestNav(fundId)
        ])

        if (fundResponse.success) {
            fundInfo.value = fundResponse.data
        }

        if (navResponse.success) {
            currentNav.value = navResponse.data.navValue
        }
    } catch (error) {
        console.error('載入基金資訊失敗:', error)
    } finally {
        loading.value = false
    }
}

// 提交申購
const handleSubmit = async () => {
    try {
        loading.value = true

        const purchaseData = {
            accountId: props.accountId,
            fundId: selectedFund.value,
            amount: parseFloat(formData.value.amount),
            memo: formData.value.memo
        }

        const response = await fundApi.purchaseFund(purchaseData)

        if (response.success) {
            emit('success', response.data)
        }
    } catch (error) {
        console.error('申購失敗:', error)
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    emit('cancel')
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

// 初始化
onMounted(() => {
    if (selectedFund.value) {
        loadFundInfo(selectedFund.value)
    }
})
</script>