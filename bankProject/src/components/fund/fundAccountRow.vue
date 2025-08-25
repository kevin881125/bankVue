<template>
    <tr>
        <td>{{ account.fundAccountNumber }}</td>
        <td>{{ account.memberName }}</td>
        <td>
            <span class="status-badge" :class="getStatusClass(account.accountStatus)">
                {{ getStatusText(account.accountStatus) }}
            </span>
        </td>
        <td class="amount">{{ formatCurrency(account.totalAssetValue) }}</td>
        <td class="text-center">{{ account.holdingCount || 0 }}</td>
        <td class="text-center">{{ account.sipCount || 0 }}</td>
        <td>{{ formatDate(account.openDate) }}</td>
        <td>{{ formatDate(account.lastTransactionDate) }}</td>
        <td class="actions">
            <button @click="$emit('open-detail', account.fundAccountId)" class="btn btn-info">
                詳情
            </button>
            <button @click="$emit('edit-status', account.fundAccountId)" class="btn btn-warning">
                狀態
            </button>
            <button @click="$emit('view-holdings', account.fundAccountId)" class="btn btn-success">
                持有
            </button>
        </td>
    </tr>
</template>

<script setup>
defineProps(['account'])
defineEmits(['open-detail', 'edit-status', 'view-holdings'])

const getStatusClass = (status) => {
    const classes = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'suspended': 'status-suspended',
        'closed': 'status-closed'
    }
    return classes[status] || 'status-default'
}

const getStatusText = (status) => {
    const texts = {
        'active': '使用中',
        'inactive': '未啟用',
        'suspended': '暫停',
        'closed': '已關閉'
    }
    return texts[status] || status
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD'
    }).format(amount || 0)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-TW')
}
</script>

<style scoped>
td {
    padding: 12px 10px;
    text-align: center;
    vertical-align: middle;
}

.amount {
    text-align: right;
    font-weight: 600;
}

.actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn {
    padding: 4px 8px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s;
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-warning {
    background: #ffc107;
    color: #212529;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn:hover {
    opacity: 0.8;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.status-active {
    background: #d4edda;
    color: #155724;
}

.status-inactive {
    background: #f8d7da;
    color: #721c24;
}

.status-suspended {
    background: #fff3cd;
    color: #856404;
}

.status-closed {
    background: #d1ecf1;
    color: #0c5460;
}
</style>