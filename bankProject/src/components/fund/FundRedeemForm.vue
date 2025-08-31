<!-- 2. 基金贖回組件 -->
<!-- FundRedeemForm.vue -->
<template>
    <div class="fund-card">
        <div class="fund-card-header">
            <h3 class="fund-card-title">基金贖回</h3>
            <span v-if="holdingInfo" class="fund-badge fund-badge-primary">{{ holdingInfo.fundName }}</span>
        </div>

        <div class="fund-card-body">
            <!-- 持倉資訊 -->
            <div v-if="holdingInfo" class="fund-holding-info fund-mb-lg">
                <div class="fund-flex fund-flex-between fund-items-center">
                    <span>目前持有</span>
                    <span class="fund-value">{{ formatUnits(holdingInfo.unitsHeld) }} 單位</span>
                </div>
                <div class="fund-flex fund-flex-between fund-items-center">
                    <span>平均成本</span>
                    <span class="fund-value">NT$ {{ formatCurrency(holdingInfo.avgCost) }}</span>
                </div>
                <div class="fund-flex fund-flex-between fund-items-center">
                    <span>目前市值</span>
                    <span class="fund-value">NT$ {{ formatCurrency(holdingInfo.currentMarketValue) }}</span>
                </div>
                <div class="fund-flex fund-flex-between fund-items-center">
                    <span>損益</span>
                    <span class="fund-value"
                        :class="holdingInfo.unrealizedGainLoss >= 0 ? 'fund-value-positive' : 'fund-value-negative'">
                        {{ holdingInfo.unrealizedGainLoss >= 0 ? '+' : '' }}NT$ {{
                            formatCurrency(holdingInfo.unrealizedGainLoss) }}
                    </span>
                </div>
            </div>

            <form @submit.prevent="handleSubmit">
                <!-- 贖回方式 -->
                <div class="fund-form-group">
                    <label class="fund-label">贖回方式</label>
                    <div class="fund-radio-group">
                        <label class="fund-radio-item">
                            <input v-model="redeemType" type="radio" value="units" />
                            按單位數贖回
                        </label>
                        <label class="fund-radio-item">
                            <input v-model="redeemType" type="radio" value="amount" />
                            按金額贖回
                        </label>
                        <label class="fund-radio-item">
                            <input v-model="redeemType" type="radio" value="all" />
                            全部贖回
                        </label>
                    </div>
                </div>

                <!-- 贖回單位數 -->
                <div v-if="redeemType === 'units'" class="fund-form-group">
                    <label class="fund-label">贖回單位數</label>
                    <input v-model="formData.units" type="number" step="0.000001" :max="holdingInfo?.unitsHeld"
                        class="fund-input" placeholder="請輸入贖回單位數" required />
                    <div class="fund-text-sm fund-text-secondary fund-mt-sm">
                        可贖回單位數：{{ formatUnits(holdingInfo?.unitsHeld || 0) }}
                    </div>
                </div>

                <!-- 贖回金額 -->
                <div v-if="redeemType === 'amount'" class="fund-form-group">
                    <label class="fund-label">贖回金額 (NT$)</label>
                    <input v-model="formData.amount" type="number" step="0.01" :max="holdingInfo?.currentMarketValue"
                        class="fund-input" placeholder="請輸入贖回金額" required />
                    <div class="fund-text-sm fund-text-secondary fund-mt-sm">
                        目前市值：NT$ {{ formatCurrency(holdingInfo?.currentMarketValue || 0) }}
                    </div>
                </div>

                <!-- 預估贖回金額/單位數 -->
                <div v-if="estimatedValue > 0" class="fund-form-group">
                    <label class="fund-label">
                        {{ redeemType === 'units' ? '預估贖回金額' : '預估贖回單位數' }}
                    </label>
                    <div class="fund-input-readonly">
                        {{ redeemType === 'units'
                            ? `NT$ ${formatCurrency(estimatedValue)}`
                            : `${formatUnits(estimatedValue)} 單位`
                        }}
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
                    <button type="submit" class="fund-btn fund-btn-danger" :disabled="loading || !isValid">
                        <span v-if="loading" class="fund-spinner"></span>
                        {{ loading ? '處理中...' : '確認贖回' }}
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
    holdingId: {
        type: Number,
        required: true
    },
    accountId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['success', 'cancel'])

const loading = ref(false)
const redeemType = ref('units')
const holdingInfo = ref(null)
const currentNav = ref(0)
const formData = ref({
    units: '',
    amount: '',
    memo: ''
})

// 計算屬性
const estimatedValue = computed(() => {
    if (!currentNav.value) return 0

    if (redeemType.value === 'units' && formData.value.units) {
        return parseFloat(formData.value.units) * currentNav.value
    } else if (redeemType.value === 'amount' && formData.value.amount) {
        return parseFloat(formData.value.amount) / currentNav.value
    } else if (redeemType.value === 'all' && holdingInfo.value) {
        return holdingInfo.value.unitsHeld * currentNav.value
    }

    return 0
})

const isValid = computed(() => {
    if (redeemType.value === 'units') {
        return formData.value.units &&
            parseFloat(formData.value.units) > 0 &&
            parseFloat(formData.value.units) <= (holdingInfo.value?.unitsHeld || 0)
    } else if (redeemType.value === 'amount') {
        return formData.value.amount &&
            parseFloat(formData.value.amount) > 0 &&
            parseFloat(formData.value.amount) <= (holdingInfo.value?.currentMarketValue || 0)
    } else if (redeemType.value === 'all') {
        return holdingInfo.value && holdingInfo.value.unitsHeld > 0
    }

    return false
})

// 載入持倉資訊
const loadHoldingInfo = async () => {
    try {
        loading.value = true
        // 這裡需要根據你的API設計調整
        const response = await fundApi.getHoldingDetail(props.holdingId)

        if (response.success) {
            holdingInfo.value = response.data
            // 同時載入最新淨值
            const navResponse = await fundApi.getLatestNav(holdingInfo.value.fundId)
            if (navResponse.success) {
                currentNav.value = navResponse.data.navValue
            }
        }
    } catch (error) {
        console.error('載入持倉資訊失敗:', error)
    } finally {
        loading.value = false
    }
}

// 提交贖回
const handleSubmit = async () => {
    try {
        loading.value = true

        let redeemUnits = 0

        if (redeemType.value === 'units') {
            redeemUnits = parseFloat(formData.value.units)
        } else if (redeemType.value === 'amount') {
            redeemUnits = parseFloat(formData.value.amount) / currentNav.value
        } else if (redeemType.value === 'all') {
            redeemUnits = holdingInfo.value.unitsHeld
        }

        const redeemData = {
            accountId: props.accountId,
            fundId: holdingInfo.value.fundId,
            units: redeemUnits,
            memo: formData.value.memo
        }

        const response = await fundApi.redeemFund(redeemData)

        if (response.success) {
            emit('success', response.data)
        }
    } catch (error) {
        console.error('贖回失敗:', error)
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
    loadHoldingInfo()
})
</script>
<style scoped>
@import '@/styles/fundStyles.css';
</style>