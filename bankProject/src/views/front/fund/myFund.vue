<template>
  <div class="my-fund-container">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入基金帳戶資訊中...</p>
    </div>

    <!-- 沒有基金帳戶 -->
    <div v-else-if="!hasFundAccount" class="no-fund-account">
      <div class="no-account-content">
        <i class="fas fa-piggy-bank no-account-icon"></i>
        <h3>您尚未開通基金帳戶</h3>
        <p>開通基金帳戶後即可開始您的投資理財之旅</p>
        <button @click="openFundAccount" class="btn-apply">申辦基金帳戶</button>
      </div>
    </div>

    <!-- 基金帳戶審核中 -->
    <div v-else-if="fundAccount.status === '審核中'" class="pending-status">
      <div class="pending-content">
        <i class="fas fa-clock pending-icon"></i>
        <h3>基金帳戶審核中</h3>
        <p>您的基金帳戶正在審核中，預計1-3個工作天完成審核</p>
        <div class="account-details">
          <p><strong>申請時間:</strong> {{ formatDateTime(fundAccount.openTime) }}</p>
          <p><strong>風險等級:</strong> {{ fundAccount.riskType }}</p>
        </div>
        <button @click="refreshAccountStatus" class="btn-refresh">重新整理狀態</button>
      </div>
    </div>

    <!-- 基金帳戶可用 -->
    <div v-else-if="canAccessFund" class="fund-account-active">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1 class="page-title">我的基金</h1>
        <p class="page-subtitle">管理您的基金投資組合</p>
        <div class="fund-account-info">
          <span class="risk-badge" :class="`risk-${getRiskClass(fundAccount.riskType)}`">
            {{ fundAccount.riskType }}
          </span>
          <span class="status-badge" :class="getActiveStatusClass(fundAccount.status)">
            {{ fundAccount.status }}
          </span>
        </div>
      </div>

      <!-- 導航標籤 -->
      <div class="nav-tabs">
        <button v-for="tab in tabs" :key="tab.path" :class="['nav-tab', { active: currentTab === tab.path }]"
          @click="switchTab(tab.path)">
          <i :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- 內容區域 -->
      <div class="content-area">
        <router-view :fundAccId="fundAccount.fundAccId" />
      </div>
    </div>

    <!-- 其他狀態 - 帳戶異常處理 -->
    <div v-else class="other-status">
      <div class="other-content">
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <h3>{{ getStatusTitle(fundAccount.status) }}</h3>
        <p>{{ getStatusMessage(fundAccount.status) }}</p>

        <!-- 根據不同狀態顯示不同操作 -->
        <div class="action-buttons">
          <button v-if="canRefresh(fundAccount.status)" @click="refreshAccountStatus" class="btn-refresh">
            <i class="fas fa-sync-alt"></i>
            重新整理
          </button>

          <button v-if="needContactService(fundAccount.status)" @click="contactService" class="btn-contact">
            <i class="fas fa-phone"></i>
            聯繫客服
          </button>

          <button v-if="canReapply(fundAccount.status)" @click="reapplyAccount" class="btn-reapply">
            <i class="fas fa-redo"></i>
            重新申請
          </button>
        </div>

        <!-- 狀態詳細資訊 -->
        <div class="status-details" v-if="fundAccount.status">
          <div class="detail-item">
            <span class="detail-label">當前狀態:</span>
            <span class="detail-value status-tag" :class="getStatusClass(fundAccount.status)">
              {{ fundAccount.status }}
            </span>
          </div>
          <div class="detail-item" v-if="fundAccount.openTime">
            <span class="detail-label">申請時間:</span>
            <span class="detail-value">{{ formatDateTime(fundAccount.openTime) }}</span>
          </div>
          <div class="detail-item" v-if="fundAccount.riskType">
            <span class="detail-label">風險等級:</span>
            <span class="detail-value">{{ fundAccount.riskType }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMemberStore } from '@/stores/MemberStore'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const memberStore = useMemberStore()

// 基金帳戶相關狀態
const fundAccount = ref({
  fundAccId: null,
  riskType: '',
  status: '',
  openTime: null
})

const loading = ref(true)
const hasFundAccount = ref(false)

// 導航標籤配置
const tabs = ref([
  {
    path: 'myFundHoldings',
    name: '持有基金',
    icon: 'fas fa-wallet'
  },
  {
    path: 'buyFund',
    name: '申購基金',
    icon: 'fas fa-plus-circle'
  },
  {
    path: 'myFundTransaction',
    name: '交易紀錄',
    icon: 'fas fa-list-alt'
  },
  {
    path: 'myFundSip',
    name: '定期定額',
    icon: 'fas fa-calendar-check'
  }
])

// 當前活動標籤
const currentTab = ref('')

// 計算屬性
const canAccessFund = computed(() => {
  // 「啟用」和「已開通」都應該允許使用基金功能
  const allowedStatuses = ['已開通', '啟用', '正常']
  return hasFundAccount.value && allowedStatuses.includes(fundAccount.value.status)
})

// 查詢基金帳戶
const fetchFundAccount = async () => {
  if (!memberStore.memberInfo.mId) {
    router.push('/login')
    return
  }

  loading.value = true

  try {
    // 正確的 URL 格式，需要包含 http:// 協議
    const response = await axios.get('http://localhost:8080/bank/fundAccount', {
      params: { mId: memberStore.memberInfo.mId },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('API 回應狀態:', response.status)
    console.log('API 回應資料:', response.data)
    console.log('API 回應類型:', typeof response.data)

    // 檢查是否收到 HTML（表示路由錯誤或 404）
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('API 回傳 HTML 而非 JSON，可能是路由錯誤')
      throw new Error('API_ROUTE_ERROR')
    }

    if (response.status === 200 && response.data && typeof response.data === 'object') {
      fundAccount.value = {
        fundAccId: response.data.fundAccId || null,
        riskType: response.data.riskType || '',
        status: response.data.status || '狀態未知',
        openTime: response.data.openTime || null
      }
      hasFundAccount.value = true

      console.log('解析後的基金帳戶資料:', fundAccount.value)
    } else {
      throw new Error('INVALID_RESPONSE_FORMAT')
    }
  } catch (error) {
    console.error('查詢基金帳戶完整錯誤:', error)

    if (error.response?.status === 204) {
      // 沒有基金帳戶
      hasFundAccount.value = false
      console.log('查詢結果: 沒有基金帳戶 (204)')
    } else if (error.code === 'ERR_NETWORK') {
      // 網路連線錯誤
      console.error('無法連接到後端服務，請檢查：')
      console.error('- 後端服務是否在 http://localhost:8080 運行')
      console.error('- 網路連線是否正常')
      console.error('- CORS 設定是否正確')

      fundAccount.value = {
        fundAccId: null,
        riskType: '',
        status: '無法連接後端',
        openTime: null
      }
      hasFundAccount.value = true
    } else if (error.message === 'API_ROUTE_ERROR') {
      // API 路由錯誤
      console.error('API 路由可能不正確，請檢查：')
      console.error('- 後端服務是否啟動')
      console.error('- API 路徑是否正確: /bank/fundAccount')

      fundAccount.value = {
        fundAccId: null,
        riskType: '',
        status: 'API路由錯誤',
        openTime: null
      }
      hasFundAccount.value = true
    } else if (error.message === 'INVALID_RESPONSE_FORMAT') {
      fundAccount.value = {
        fundAccId: null,
        riskType: '',
        status: '回應格式錯誤',
        openTime: null
      }
      hasFundAccount.value = true
    } else {
      // 其他錯誤
      fundAccount.value = {
        fundAccId: null,
        riskType: '',
        status: '網路連線錯誤',
        openTime: null
      }
      hasFundAccount.value = true
    }
  } finally {
    loading.value = false
  }
}

// 重新整理帳戶狀態
const refreshAccountStatus = () => {
  fetchFundAccount()
}

// 申辦基金帳戶
const openFundAccount = () => {
  router.push('/yuzubank/fundAccount/apply')
}

// 計算當前標籤
const getCurrentTab = () => {
  const pathSegments = route.path.split('/')
  const lastSegment = pathSegments[pathSegments.length - 1]
  return tabs.value.find(tab => tab.path === lastSegment)?.path || 'myFundHoldings'
}

// 切換標籤
const switchTab = (tabPath) => {
  if (!canAccessFund.value) {
    return
  }

  currentTab.value = tabPath
  router.push(`/yuzubank/myFund/${tabPath}`)
}

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取風險等級的 CSS 類別
const getRiskClass = (riskType) => {
  const riskMap = {
    '保守型': 'conservative',
    '穩健型': 'moderate',
    '積極型': 'aggressive',
    '成長型': 'growth'
  }
  return riskMap[riskType] || 'default'
}

// 獲取啟用狀態的 CSS 類別
const getActiveStatusClass = (status) => {
  const activeStatuses = ['已開通', '啟用', '正常']
  return activeStatuses.includes(status) ? 'status-active' : 'status-inactive'
}

// 獲取狀態標題
const getStatusTitle = (status) => {
  // 處理空值或未定義的狀態
  if (!status || status === 'undefined' || status === 'null') {
    return '基金帳戶狀態未知'
  }

  const statusTitles = {
    '已拒絕': '基金帳戶申請被拒絕',
    '已暫停': '基金帳戶已暫停',
    '已凍結': '基金帳戶已凍結',
    '已關閉': '基金帳戶已關閉',
    '維護中': '系統維護中',
    '資料異常': '帳戶資料異常',
    '狀態未知': '基金帳戶狀態未知',
    '查詢失敗': '查詢帳戶失敗',
    'API路由錯誤': 'API 連線異常',
    '回應格式錯誤': '系統回應異常',
    '網路連線錯誤': '網路連線失敗',
    '無法連接後端': '後端服務連線失敗'
  }
  return statusTitles[status] || '基金帳戶狀態異常'
}

// 獲取狀態訊息
const getStatusMessage = (status) => {
  // 處理空值或未定義的狀態
  if (!status || status === 'undefined' || status === 'null') {
    return '帳戶狀態資訊缺失，請聯繫客服協助查詢。'
  }

  const statusMessages = {
    '已拒絕': '很抱歉，您的基金帳戶申請未通過審核。您可以重新申請或聯繫客服了解詳細原因。',
    '已暫停': '您的基金帳戶暫時停用，無法進行交易。請聯繫客服了解恢復流程。',
    '已凍結': '基於安全考量，您的基金帳戶已被凍結。請立即聯繫客服處理。',
    '已關閉': '您的基金帳戶已關閉。如需重新開通，請重新申請基金帳戶。',
    '維護中': '基金服務正在進行系統維護，請稍後再試。預計維護時間約2-4小時。',
    '資料異常': '帳戶資料出現異常，請聯繫客服協助處理。',
    '狀態未知': '無法獲取帳戶狀態資訊，可能是系統暫時異常。請稍後重試或聯繫客服。',
    '查詢失敗': '查詢帳戶資訊時發生錯誤，請檢查網路連線後重試，或聯繫客服協助。',
    'API路由錯誤': 'API 服務連線異常，可能原因：\n• 後端服務未啟動\n• API 路徑設定錯誤\n請聯繫技術支援處理。',
    '回應格式錯誤': '系統回應格式異常，請稍後重試或聯繫客服。',
    '網路連線錯誤': '網路連線失敗，請檢查網路狀態後重新嘗試。',
    '無法連接後端': '無法連接到後端服務，請確認：\n• 後端服務是否運行在 localhost:8080\n• 網路連線是否正常\n• CORS 設定是否正確'
  }
  return statusMessages[status] || `目前基金帳戶狀態為「${status}」，請聯繫客服了解詳情。`
}

// 獲取狀態樣式類別
const getStatusClass = (status) => {
  const statusClasses = {
    '已拒絕': 'status-rejected',
    '已暫停': 'status-suspended',
    '已凍結': 'status-frozen',
    '已關閉': 'status-closed',
    '維護中': 'status-maintenance',
    '資料異常': 'status-error'
  }
  return statusClasses[status] || 'status-unknown'
}

// 判斷是否可以重新整理
const canRefresh = (status) => {
  return ['維護中', '資料異常', '狀態未知', '查詢失敗'].includes(status) || !status
}

// 判斷是否需要聯繫客服
const needContactService = (status) => {
  return ['已拒絕', '已暫停', '已凍結', '資料異常', '狀態未知', '查詢失敗'].includes(status) || !status
}

// 判斷是否可以重新申請
const canReapply = (status) => {
  return ['已拒絕', '已關閉'].includes(status)
}

// 聯繫客服
const contactService = () => {
  // 這裡可以開啟客服對話框、撥打電話或導航到客服頁面
  const servicePhone = '0800-123-456'
  if (confirm(`是否撥打客服專線 ${servicePhone}？`)) {
    window.open(`tel:${servicePhone}`)
  }
}

// 重新申請帳戶
const reapplyAccount = () => {
  if (confirm('確定要重新申請基金帳戶嗎？')) {
    router.push('/yuzubank/fundAccount/apply')
  }
}

// 監聽路由變化
watch(() => route.path, (newPath) => {
  const pathSegments = newPath.split('/')
  const lastSegment = pathSegments[pathSegments.length - 1]
  if (lastSegment && tabs.value.find(tab => tab.path === lastSegment)) {
    currentTab.value = lastSegment
  }
})

// 組件掛載時初始化
onMounted(async () => {
  // 檢查會員登入狀態
  if (!memberStore.memberInfo.isLoggedIn) {
    router.push('/login')
    return
  }

  // 查詢基金帳戶資訊
  await fetchFundAccount()

  // 設置當前標籤
  currentTab.value = getCurrentTab()
})
const openTradeDialog = (fund) => {
  if (!canBuyFund(fund.status)) {
    alert('此基金目前無法申購');
    return;
  }

  selectedFund.value = fund;
  tradeAmount.value = 1000; // 設定預設金額
  tradeDialogVisible.value = true;
};
</script>

<style scoped>
.my-fund-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
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

/* 無基金帳戶狀態 */
.no-fund-account,
.pending-status,
.other-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.no-account-content,
.pending-content,
.other-content {
  text-align: center;
  background: white;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.no-account-icon,
.pending-icon,
.warning-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-account-icon {
  color: #667eea;
}

.pending-icon {
  color: #ffc107;
}

.warning-icon {
  color: #dc3545;
}

.no-account-content h3,
.pending-content h3,
.other-content h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.no-account-content p,
.pending-content p,
.other-content p {
  color: #6c757d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.account-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.account-details p {
  margin-bottom: 10px;
  color: #495057;
}

/* 按鈕樣式 */
.btn-apply,
.btn-refresh,
.btn-contact,
.btn-reapply {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 8px;
}

.btn-apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-refresh {
  background: #17a2b8;
  color: white;
}

.btn-refresh:hover {
  background: #138496;
  transform: translateY(-1px);
}

.btn-contact {
  background: #28a745;
  color: white;
}

.btn-contact:hover {
  background: #218838;
  transform: translateY(-1px);
}

.btn-reapply {
  background: #6c757d;
  color: white;
}

.btn-reapply:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.action-buttons {
  margin: 30px 0 20px 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

/* 狀態詳細資訊 */
.status-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  flex-shrink: 0;
}

.detail-value {
  color: #6c757d;
  text-align: right;
}

/* 狀態標籤樣式 */
.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

.status-suspended {
  background: #fff3e0;
  color: #ef6c00;
}

.status-frozen {
  background: #e1f5fe;
  color: #0277bd;
}

.status-closed {
  background: #fce4ec;
  color: #ad1457;
}

.status-maintenance {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-error {
  background: #ffebee;
  color: #d32f2f;
}

.status-unknown,
.status-query-failed {
  background: #f5f5f5;
  color: #616161;
}

/* 基金帳戶可用狀態 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0 0 20px 0;
}

.fund-account-info {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.risk-badge,
.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.risk-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.risk-conservative {
  background: #e8f5e8;
  color: #388e3c;
}

.risk-moderate {
  background: #fff3e0;
  color: #f57c00;
}

.risk-aggressive {
  background: #ffebee;
  color: #d32f2f;
}

.risk-growth {
  background: #e3f2fd;
  color: #1976d2;
}

.risk-default {
  background: #f5f5f5;
  color: #616161;
}

.status-active {
  background: #e8f5e8;
  color: #388e3c;
}

.status-inactive {
  background: #ffebee;
  color: #d32f2f;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  gap: 8px;
}

.nav-tab {
  flex: 1;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #495057;
  transform: translateY(-1px);
}

.nav-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.nav-tab i {
  font-size: 1.1rem;
}

.content-area {
  background: white;
  border-radius: 12px;
  min-height: 500px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .my-fund-container {
    padding: 15px;
  }

  .no-account-content,
  .pending-content,
  .other-content {
    padding: 30px 20px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .nav-tabs {
    flex-direction: column;
    gap: 4px;
  }

  .nav-tab {
    max-width: none;
    padding: 15px 20px;
  }

  .fund-account-info {
    flex-direction: column;
    gap: 10px;
  }
}

/* 載入動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>