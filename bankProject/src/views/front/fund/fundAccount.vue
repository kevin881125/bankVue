<!-- fundAccount.vue - 基金帳戶管理主頁面 -->
<template>
  <div class="fund-account-container">
    <!-- 頁面標題區 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="mdi mdi-bank"></span>
        基金帳戶管理
      </h1>
      <p class="page-subtitle">管理所有基金帳戶相關業務</p>
    </div>

    <!-- 功能導航區 -->
    <div class="function-nav">
      <div class="nav-cards">
        <router-link to="/yuzubank/backmain/fundAccount/fundHoldings" class="nav-card"
          :class="{ active: $route.path.includes('fundHoldings') }">
          <div class="card-icon">
            <span class="mdi mdi-chart-donut"></span>
          </div>
          <div class="card-content">
            <h3>基金持有管理</h3>
            <p>查看和管理客戶基金持有情況</p>
          </div>
          <div class="card-arrow">
            <span class="mdi mdi-chevron-right"></span>
          </div>
        </router-link>

        <router-link to="/yuzubank/backmain/fundAccount/fundTransaction" class="nav-card"
          :class="{ active: $route.path.includes('fundTransaction') }">
          <div class="card-icon">
            <span class="mdi mdi-file-document-outline"></span>
          </div>
          <div class="card-content">
            <h3>交易紀錄管理</h3>
            <p>查看和管理所有基金交易記錄</p>
          </div>
          <div class="card-arrow">
            <span class="mdi mdi-chevron-right"></span>
          </div>
        </router-link>

        <router-link to="/yuzubank/backmain/fundAccount/fundSip" class="nav-card"
          :class="{ active: $route.path.includes('fundSip') }">
          <div class="card-icon">
            <span class="mdi mdi-calendar-check"></span>
          </div>
          <div class="card-content">
            <h3>定期定額管理</h3>
            <p>管理客戶定期定額投資計劃</p>
          </div>
          <div class="card-arrow">
            <span class="mdi mdi-chevron-right"></span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 統計概覽區 -->
    <div class="stats-section">
      <h2 class="section-title">帳戶統計概覽</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="mdi mdi-account-multiple"></span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAccounts || 0 }}</div>
            <div class="stat-label">總帳戶數</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="mdi mdi-currency-usd"></span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(stats.totalAssets) || 0 }}</div>
            <div class="stat-label">總資產價值</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="mdi mdi-chart-line"></span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeTransactions || 0 }}</div>
            <div class="stat-label">本月交易筆數</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="mdi mdi-calendar-clock"></span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeSips || 0 }}</div>
            <div class="stat-label">活躍定期定額</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 內容區域 -->
    <div class="content-area">
      <router-view v-if="showChildView" />
      <div v-else class="welcome-content">
        <div class="welcome-icon">
          <span class="mdi mdi-bank"></span>
        </div>
        <h3>歡迎使用基金帳戶管理系統</h3>
        <p>請選擇上方功能模組開始管理基金帳戶</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 統計資料
const stats = ref({
  totalAccounts: 0,
  totalAssets: 0,
  activeTransactions: 0,
  activeSips: 0
})

// 判斷是否顯示子視圖
const showChildView = computed(() => {
  return route.path !== '/yuzubank/backmain/fundAccount'
})

// 格式化貨幣
const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

// 載入統計資料
const loadStats = async () => {
  try {
    // 這裡應該調用後端 API 獲取統計資料
    // const response = await request.get('/api/fund/account/stats')
    // stats.value = response.data

    // 模擬資料
    stats.value = {
      totalAccounts: 1234,
      totalAssets: 50000000,
      activeTransactions: 156,
      activeSips: 89
    }
  } catch (error) {
    console.error('載入統計資料失敗:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.fund-account-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  display: flex;
  align-items: center;
  color: #343a40;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-title .mdi {
  margin-right: 12px;
  color: #007bff;
  font-size: 32px;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 16px;
}

.function-nav {
  margin-bottom: 32px;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.nav-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-left-color: #007bff;
}

.nav-card.active {
  border-left-color: #007bff;
  background: #f8f9ff;
}

.card-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e7f3ff;
  border-radius: 50%;
  margin-right: 16px;
}

.card-icon .mdi {
  font-size: 28px;
  color: #007bff;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
}

.card-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.card-arrow {
  margin-left: 16px;
}

.card-arrow .mdi {
  font-size: 24px;
  color: #6c757d;
}

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  color: #343a40;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e7f3ff;
  border-radius: 50%;
  margin-right: 16px;
}

.stat-icon .mdi {
  font-size: 24px;
  color: #007bff;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

.content-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e7f3ff;
  border-radius: 50%;
  margin-bottom: 24px;
}

.welcome-icon .mdi {
  font-size: 40px;
  color: #007bff;
}

.welcome-content h3 {
  color: #343a40;
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-content p {
  color: #6c757d;
  margin: 0;
  font-size: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fund-account-container {
    padding: 16px;
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-card {
    padding: 16px;
  }

  .card-content h3 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>