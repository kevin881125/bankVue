<template>
  <div class="fund-management-container">
    <!-- 頁面標題 -->
    <div class="header-section">
      <h1 class="main-title">基金管理系統</h1>
      <p class="subtitle">管理基金商品、交易記錄與客戶資料</p>
    </div>

    <!-- 導航卡片網格 -->
    <div class="nav-grid">
      <div v-for="item in navItems" :key="item.id" @click="handleNavClick(item.id)" class="nav-card">
        <div class="card-content">
          <!-- 圖標區域 -->
          <div :class="['icon-container', item.colorClass]">
            <span :class="['mdi', item.icon]"></span>
          </div>

          <!-- 標題 -->
          <h3 class="card-title">{{ item.title }}</h3>

          <!-- 描述 -->
          <p class="card-description">{{ item.description }}</p>
        </div>

        <!-- 底部箭頭指示 -->
        <div class="card-footer">
          <div class="enter-text">
            進入管理
            <span class="mdi mdi-chevron-right arrow-icon"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速統計區域 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon blue">
            <span class="mdi mdi-chart-pie"></span>
          </div>
          <div class="stat-info">
            <p class="stat-label">總基金數量</p>
            <p class="stat-value">--</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon green">
            <span class="mdi mdi-currency-usd"></span>
          </div>
          <div class="stat-info">
            <p class="stat-label">總管理資產</p>
            <p class="stat-value">--</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon purple">
            <span class="mdi mdi-account-group"></span>
          </div>
          <div class="stat-info">
            <p class="stat-label">投資客戶數</p>
            <p class="stat-value">--</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = ref([
  {
    id: 'fundTrading',
    title: '交易管理',
    description: '管理基金申購贖回交易',
    icon: 'mdi-currency-usd',
    colorClass: 'purple'
  },
  {
    id: 'fundAccount',
    title: '客戶管理',
    description: '基金投資客戶資料管理',
    icon: 'mdi-account-group',
    colorClass: 'teal'
  },
  {
    id: 'fund',
    title: '基金商品管理',
    description: '新增、編輯、刪除基金商品',
    icon: 'mdi-chart-pie',
    colorClass: 'blue'
  },
  {
    id: 'fund-performance',
    title: '績效管理',
    description: '查看基金績效表現與歷史數據',
    icon: 'mdi-trending-up',
    colorClass: 'green'
  },
  {
    id: 'fund-reports',
    title: '報表管理',
    description: '生成基金相關報表',
    icon: 'mdi-file-document',
    colorClass: 'orange'
  },
  {
    id: 'fund-analytics',
    title: '數據分析',
    description: '基金市場分析與統計',
    icon: 'mdi-chart-bar',
    colorClass: 'indigo'
  },
  {
    id: 'fund-schedule',
    title: '排程管理',
    description: '定期定額與自動投資設定',
    icon: 'mdi-clock-outline',
    colorClass: 'pink'
  },
  {
    id: 'fund-settings',
    title: '系統設定',
    description: '基金系統參數與權限設定',
    icon: 'mdi-cog',
    colorClass: 'gray'
  }
])

const handleNavClick = (itemId) => {
  console.log(`導航到: ${itemId}`)
  // 路由導航
  router.push(`/yuzubank/backmain/${itemId}`)
}
</script>

<style scoped>
.fund-management-container {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  padding: 24px;
}

/* 頁面標題 */
.header-section {
  margin-bottom: 32px;
}

.main-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* 導航網格 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.nav-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.nav-card:hover {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.card-content {
  padding: 24px;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.nav-card:hover .icon-container {
  transform: scale(1.1);
}

.icon-container span {
  font-size: 32px;
  color: white;
}

/* 顏色主題 */
.blue {
  background-color: #3b82f6;
}

.blue:hover {
  background-color: #2563eb;
}

.green {
  background-color: #10b981;
}

.green:hover {
  background-color: #059669;
}

.purple {
  background-color: #8b5cf6;
}

.purple:hover {
  background-color: #7c3aed;
}

.orange {
  background-color: #f59e0b;
}

.orange:hover {
  background-color: #d97706;
}

.indigo {
  background-color: #6366f1;
}

.indigo:hover {
  background-color: #4f46e5;
}

.teal {
  background-color: #14b8a6;
}

.teal:hover {
  background-color: #0d9488;
}

.pink {
  background-color: #ec4899;
}

.pink:hover {
  background-color: #db2777;
}

.gray {
  background-color: #6b7280;
}

.gray:hover {
  background-color: #4b5563;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.nav-card:hover .card-title {
  color: #3b82f6;
}

.card-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.card-footer {
  padding: 0 24px 16px;
}

.enter-text {
  display: flex;
  align-items: center;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-card:hover .enter-text {
  opacity: 1;
}

.arrow-icon {
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.nav-card:hover .arrow-icon {
  transform: translateX(4px);
}

/* 統計區域 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  border-radius: 50%;
  padding: 12px;
  margin-right: 16px;
}

.stat-icon.blue {
  background-color: #dbeafe;
  color: #3b82f6;
}

.stat-icon.green {
  background-color: #d1fae5;
  color: #10b981;
}

.stat-icon.purple {
  background-color: #e9d5ff;
  color: #8b5cf6;
}

.stat-icon span {
  font-size: 24px;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

@media (max-width: 768px) {
  .nav-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>