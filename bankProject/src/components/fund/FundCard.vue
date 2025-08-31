<!-- 3. 基金卡片組件 -->
<!-- FundCard.vue -->
<template>
    <div class="fund-card fund-card-clickable" @click="handleCardClick">
        <div class="fund-card-header">
            <div>
                <h4 class="fund-card-title">{{ fund.fundName }}</h4>
                <p class="fund-text-secondary">{{ fund.fundCompany }}</p>
            </div>
            <div class="fund-badges">
                <span class="fund-badge fund-badge-primary">{{ fund.fundType }}</span>
                <span class="fund-badge" :class="{
                    'fund-badge-danger': fund.riskLevel === '高',
                    'fund-badge-warning': fund.riskLevel === '中',
                    'fund-badge-secondary': fund.riskLevel === '低'
                }">
                    {{ fund.riskLevel }}風險
                </span>
            </div>
        </div>

        <div class="fund-card-body">
            <div class="fund-nav-info fund-mb-md">
                <div class="fund-flex fund-flex-between fund-items-center">
                    <span class="fund-label">淨值</span>
                    <span class="fund-value fund-value-neutral">
                        NT$ {{ formatCurrency(fund.currentNavValue) }}
                    </span>
                </div>
                <div v-if="fund.navChange" class="fund-flex fund-flex-between fund-items-center">
                    <span class="fund-label">漲跌</span>
                    <span class="fund-value"
                        :class="fund.navChange >= 0 ? 'fund-value-positive' : 'fund-value-negative'">
                        {{ fund.navChange >= 0 ? '+' : '' }}{{ formatCurrency(fund.navChange) }}
                        <span class="fund-percentage"
                            :class="fund.navChangePercent >= 0 ? 'fund-percentage-positive' : 'fund-percentage-negative'">
                            {{ fund.navChangePercent >= 0 ? '+' : '' }}{{ fund.navChangePercent }}%
                        </span>
                    </span>
                </div>
            </div>

            <div class="fund-investment-info">
                <div class="fund-flex fund-flex-between fund-items-center fund-text-sm">
                    <span>最低申購</span>
                    <span>NT$ {{ formatCurrency(fund.minInvestment) }}</span>
                </div>
                <div class="fund-flex fund-flex-between fund-items-center fund-text-sm">
                    <span>管理費</span>
                    <span>{{ (fund.managementFee * 100).toFixed(2) }}%</span>
                </div>
            </div>
        </div>

        <div class="fund-card-footer">
            <button v-if="showActions" class="fund-btn fund-btn-secondary fund-btn-sm" @click.stop="handleViewDetail">
                查看詳情
            </button>
            <button v-if="showActions" class="fund-btn fund-btn-success fund-btn-sm" @click.stop="handlePurchase">
                立即申購
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    fund: {
        type: Object,
        required: true
    },
    showActions: {
        type: Boolean,
        default: true
    },
    clickable: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['click', 'view-detail', 'purchase'])

const handleCardClick = () => {
    if (props.clickable) {
        emit('click', props.fund)
    }
}

const handleViewDetail = () => {
    emit('view-detail', props.fund)
}

const handlePurchase = () => {
    emit('purchase', props.fund)
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW').format(amount || 0)
}
</script>
<style scoped>
@import '@/styles/fundStyles.css';
</style>