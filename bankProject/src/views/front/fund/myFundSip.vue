<template>
  <div class="fund-sip-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入定期定額資訊中...</p>
    </div>

    <!-- 主要內容 -->
    <div v-else class="content">
      <!-- 頁面標題和統計 -->
      <div class="header-section">
        <div class="header-left">
          <h2 class="page-title">定期定額</h2>
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-label">總計畫數</span>
              <span class="stat-value">{{ sipPlans.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">執行中</span>
              <span class="stat-value active">{{ getActiveCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已暫停</span>
              <span class="stat-value paused">{{ getPausedCount }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button @click="showCreateModal = true" class="btn-add">
            <i class="fas fa-plus"></i>
            新增定期定額
          </button>
        </div>
      </div>

      <!-- 篩選區 -->
      <div class="filter-section">
        <div class="filter-group">
          <label class="filter-label">執行頻率</label>
          <select v-model="filters.frequency" class="filter-select">
            <option value="">全部</option>
            <option value="每月">每月</option>
            <option value="雙月">雙月</option>
            <option value="季度">季度</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">計畫狀態</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">全部狀態</option>
            <option value="執行中">執行中</option>
            <option value="已暫停">已暫停</option>
            <option value="已終止">已終止</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="btn-clear">清除篩選</button>
        </div>
      </div>

      <!-- 定期定額清單 -->
      <div class="sip-list-container">
        <div v-if="filteredSipPlans.length === 0" class="empty-state">
          <i class="fas fa-calendar-check empty-icon"></i>
          <h3>{{ hasFilters ? '沒有符合條件的定期定額計畫' : '尚未設定定期定額計畫' }}</h3>
          <p>{{ hasFilters ? '試試調整篩選條件' : '定期定額可以幫助您建立長期投資習慣' }}</p>
          <button v-if="!hasFilters" @click="showCreateModal = true" class="btn-create-first">
            建立第一個定期定額計畫
          </button>
        </div>

        <div v-else class="sip-grid">
          <div v-for="sip in filteredSipPlans" :key="sip.sipId" class="sip-card"
            :class="{ 'card-inactive': sip.status !== '執行中' }">
            <!-- 卡片頭部 -->
            <div class="card-header">
              <div class="fund-info">
                <h4 class="fund-name">{{ sip.fund?.fundName || '---' }}</h4>
                <span class="fund-code">{{ sip.fund?.fundId || '---' }}</span>
              </div>
              <div class="status-actions">
                <span class="status-badge" :class="getStatusClass(sip.status)">
                  {{ sip.status }}
                </span>
                <div class="card-actions">
                  <button @click="editSip(sip)" class="btn-action btn-edit" title="編輯">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button v-if="sip.status === '執行中'" @click="pauseSip(sip)" class="btn-action btn-pause" title="暫停">
                    <i class="fas fa-pause"></i>
                  </button>
                  <button v-if="sip.status === '已暫停'" @click="resumeSip(sip)" class="btn-action btn-resume" title="恢復">
                    <i class="fas fa-play"></i>
                  </button>
                  <button @click="terminateSip(sip)" class="btn-action btn-terminate" title="終止">
                    <i class="fas fa-stop"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- 卡片內容 -->
            <div class="card-body">
              <div class="sip-details">
                <div class="detail-row">
                  <span class="detail-label">扣款金額</span>
                  <span class="detail-value amount">{{ formatCurrency(sip.amount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">扣款頻率</span>
                  <span class="detail-value">{{ sip.frequency }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">開始日期</span>
                  <span class="detail-value">{{ formatDate(sip.startDate) }}</span>
                </div>
                <div class="detail-row" v-if="sip.endDate">
                  <span class="detail-label">結束日期</span>
                  <span class="detail-value">{{ formatDate(sip.endDate) }}</span>
                </div>
              </div>
            </div>

            <!-- 下次扣款資訊 -->
            <div v-if="sip.status === '執行中'" class="card-footer">
              <div class="next-deduction">
                <i class="fas fa-calendar-alt"></i>
                <span>下次扣款：{{ getNextDeductionDate(sip) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯定期定額彈窗 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showCreateModal ? '新增定期定額' : '編輯定期定額' }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitSip">
            <div class="form-group">
              <label class="form-label">選擇基金 <span class="required">*</span></label>
              <select v-model="sipForm.fundId" class="form-select" required>
                <option value="">請選擇基金</option>
                <option v-for="fund in availableFunds" :key="fund.fundId" :value="fund.fundId">
                  {{ fund.fundName }} ({{ fund.fundCode }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">扣款金額 <span class="required">*</span></label>
              <input type="number" v-model.number="sipForm.amount" class="form-input" placeholder="請輸入扣款金額" min="1000"
                step="100" required />
              <small class="form-help">最低扣款金額：$1,000</small>
            </div>

            <div class="form-group">
              <label class="form-label">扣款頻率 <span class="required">*</span></label>
              <select v-model="sipForm.frequency" class="form-select" required>
                <option value="">請選擇頻率</option>
                <option value="每月">每月</option>
                <option value="雙月">雙月</option>
                <option value="季度">季度</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">開始日期 <span class="required">*</span></label>
              <input type="date" v-model="sipForm.startDate" class="form-input" :min="getTomorrowDate()" required />
            </div>

            <div class="form-group">
              <label class="form-label">結束日期 (可選)</label>
              <input type="date" v-model="sipForm.endDate" class="form-input" :min="sipForm.startDate" />
              <small class="form-help">不設定結束日期表示持續扣款</small>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn-secondary">
            取消
          </button>
          <button @click="submitSip" class="btn-primary" :disabled="submitting">
            <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
            {{ showCreateModal ? '建立計畫' : '儲存變更' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  fundAccId: {
    type: Number,
    required: true
  }
})

// 響應式資料
const loading = ref(true)
const sipPlans = ref([])
const availableFunds = ref([])
const submitting = ref(false)

// 彈窗控制
const showCreateModal = ref(false)
const showEditModal = ref(false)

// 篩選條件
const filters = ref({
  frequency: '',
  status: ''
})

// 表單資料
const sipForm = ref({
  fundId: '',
  amount: null,
  frequency: '',
  startDate: '',
  endDate: '',
  status: '執行中'
})

const editingSipId = ref(null)

// 計算屬性
const getActiveCount = computed(() => {
  return sipPlans.value.filter(s => s.status === '執行中').length
})

const getPausedCount = computed(() => {
  return sipPlans.value.filter(s => s.status === '已暫停').length
})

const hasFilters = computed(() => {
  return filters.value.frequency || filters.value.status
})

const filteredSipPlans = computed(() => {
  let result = [...sipPlans.value]

  if (filters.value.frequency) {
    result = result.filter(s => s.frequency === filters.value.frequency)
  }

  if (filters.value.status) {
    result = result.filter(s => s.status === filters.value.status)
  }

  // 按開始日期倒序排列
  return result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
})

// 方法
const fetchSipPlans = async () => {
  if (!props.fundAccId) return

  loading.value = true
  try {
    const response = await axios.get(`http://localhost:8080/bank/fundSip/${props.fundAccId}`)
    sipPlans.value = response.data || []
    console.log('定期定額計畫:', sipPlans.value)
  } catch (error) {
    console.error('載入定期定額計畫失敗:', error)
    sipPlans.value = []
  } finally {
    loading.value = false
  }
}

const fetchAvailableFunds = async () => {
  try {
    const response = await axios.get('http://localhost:8080/bank/fund')
    availableFunds.value = response.data?.filter(fund => fund.status === '上架中') || []
  } catch (error) {
    console.error('載入基金清單失敗:', error)
    availableFunds.value = []
  }
}

const submitSip = async () => {
  if (!sipForm.value.fundId || !sipForm.value.amount || !sipForm.value.frequency || !sipForm.value.startDate) {
    alert('請填寫所有必填欄位')
    return
  }

  if (sipForm.value.amount < 1000) {
    alert('最低扣款金額為 $1,000')
    return
  }

  submitting.value = true
  try {
    const payload = {
      fundAccount: {
        fundAccId: props.fundAccId
      },
      fund: {
        fundId: sipForm.value.fundId
      },
      amount: sipForm.value.amount,
      frequency: sipForm.value.frequency,
      startDate: sipForm.value.startDate,
      endDate: sipForm.value.endDate || null,
      status: sipForm.value.status
    }

    if (showCreateModal.value) {
      await axios.post('http://localhost:8080/bank/fundSip', payload)
      alert('定期定額計畫建立成功！')
    } else {
      await axios.put(`http://localhost:8080/bank/fundSip/${editingSipId.value}`, payload)
      alert('定期定額計畫更新成功！')
    }

    closeModal()
    fetchSipPlans()
  } catch (error) {
    console.error('操作失敗:', error)
    alert('操作失敗：' + (error.response?.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

const editSip = (sip) => {
  editingSipId.value = sip.sipId
  sipForm.value = {
    fundId: sip.fund?.fundId || '',
    amount: Number(sip.amount),
    frequency: sip.frequency,
    startDate: sip.startDate,
    endDate: sip.endDate || '',
    status: sip.status
  }
  showEditModal.value = true
}

const pauseSip = async (sip) => {
  if (!confirm('確定要暫停這個定期定額計畫嗎？')) return

  try {
    const payload = { ...sip, status: '已暫停' }
    await axios.put(`http://localhost:8080/bank/fundSip/${sip.sipId}`, payload)
    alert('定期定額計畫已暫停')
    fetchSipPlans()
  } catch (error) {
    console.error('暫停失敗:', error)
    alert('暫停失敗：' + (error.response?.data?.message || error.message))
  }
}

const resumeSip = async (sip) => {
  if (!confirm('確定要恢復這個定期定額計畫嗎？')) return

  try {
    const payload = { ...sip, status: '執行中' }
    await axios.put(`http://localhost:8080/bank/fundSip/${sip.sipId}`, payload)
    alert('定期定額計畫已恢復')
    fetchSipPlans()
  } catch (error) {
    console.error('恢復失敗:', error)
    alert('恢復失敗：' + (error.response?.data?.message || error.message))
  }
}

const terminateSip = async (sip) => {
  if (!confirm('確定要終止這個定期定額計畫嗎？此操作無法復原。')) return

  try {
    const payload = { ...sip, status: '已終止' }
    await axios.put(`http://localhost:8080/bank/fundSip/${sip.sipId}`, payload)
    alert('定期定額計畫已終止')
    fetchSipPlans()
  } catch (error) {
    console.error('終止失敗:', error)
    alert('終止失敗：' + (error.response?.data?.message || error.message))
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSipId.value = null
  sipForm.value = {
    fundId: '',
    amount: null,
    frequency: '',
    startDate: '',
    endDate: '',
    status: '執行中'
  }
}

const clearFilters = () => {
  filters.value = {
    frequency: '',
    status: ''
  }
}

// 格式化和工具函數
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '$0'
  return '$' + Number(amount).toLocaleString('zh-TW')
}

const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('zh-TW')
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

const getNextDeductionDate = (sip) => {
  // 簡化版計算下次扣款日期
  const startDate = new Date(sip.startDate)
  const today = new Date()

  if (startDate > today) {
    return formatDate(sip.startDate)
  }

  // 根據頻率計算下次扣款日期
  let nextDate = new Date(startDate)
  const monthsToAdd = sip.frequency === '每月' ? 1 : sip.frequency === '雙月' ? 2 : 3

  while (nextDate <= today) {
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
  }

  return formatDate(nextDate.toISOString().split('T')[0])
}

const getStatusClass = (status) => {
  const classes = {
    '執行中': 'status-active',
    '已暫停': 'status-paused',
    '已終止': 'status-terminated'
  }
  return classes[status] || 'status-unknown'
}

// 監聽器
watch(() => props.fundAccId, (newId) => {
  if (newId) {
    fetchSipPlans()
  }
}, { immediate: true })

// 生命週期
onMounted(() => {
  if (props.fundAccId) {
    fetchSipPlans()
    fetchAvailableFunds()
  }
})
</script>

<style scoped>
.fund-sip-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 載入狀態 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 標題區 */
.header-section {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.stats-bar {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-value.active {
  color: #28a745;
}

.stat-value.paused {
  color: #ffc107;
}

.btn-add {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 篩選區 */
.filter-section {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 120px;
}

.btn-clear {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* 定期定額列表 */
.sip-list-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #495057;
}

.btn-create-first {
  margin-top: 20px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.sip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* SIP 卡片 */
.sip-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.sip-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-inactive {
  opacity: 0.7;
  border-color: #dee2e6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.fund-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

.fund-code {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.status-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-paused {
  background: #fff3cd;
  color: #856404;
}

.status-terminated {
  background: #f8d7da;
  color: #721c24;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-pause {
  background: #fff3e0;
  color: #f57c00;
}

.btn-resume {
  background: #e8f5e8;
  color: #388e3c;
}

.btn-terminate {
  background: #ffebee;
  color: #d32f2f;
}

.btn-action:hover {
  transform: scale(1.1);
}

.card-body {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

.detail-value.amount {
  font-size: 1.1rem;
  color: #667eea;
}

.card-footer {
  padding-top: 15px;
  border-top: 1px solid #f1f3f4;
}

.next-deduction {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 500;
}

/* 彈窗樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 5px;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.required {
  color: #dc3545;
}

.form-select,
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 5px;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fund-sip-container {
    padding: 15px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .stats-bar {
    flex-direction: column;
    gap: 15px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .sip-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .status-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* 動畫效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sip-card {
  animation: slideIn 0.3s ease-out;
}

/* 載入按鈕動畫 */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(359deg);
  }
}
</style>