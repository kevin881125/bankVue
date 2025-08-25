<template>
  <div class="nav-section">
    <div class="section-header" @click="toggleSection('buyFund')">
      <span class="mdi mdi-trending-up"></span>
      <span class="section-title">申購基金</span>
      <span class="mdi" :class="expandedSections.buyFund ? 'mdi-chevron-down' : 'mdi-chevron-right'"></span>
    </div>

    <div v-show="expandedSections.buyFund" class="nav-items">
      <router-link to="/yuzubank/buyFund/fundNav" class="nav-item"
        :class="{ active: isActive('/yuzubank/buyFund/fundNav') }">
        <span class="mdi mdi-chart-line"></span>
        <span>基金淨值</span>
      </router-link>

      <router-link to="/yuzubank/buyFund/fundTrading" class="nav-item"
        :class="{ active: isActive('/yuzubank/buyFund/fundTrading') }">
        <span class="mdi mdi-swap-horizontal"></span>
        <span>基金交易</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 展開狀態管理
const expandedSections = ref({
  myFund: true,
  buyFund: true
})

// 切換區塊展開/收合
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// 判斷當前路由是否活躍
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path)
}
</script>

<style scoped>
.fund-nav-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.nav-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  color: white;
}

.nav-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.fund-nav {
  padding: 16px 0;
}

.nav-section {
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  background: #f8f9fa;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.section-header:hover {
  background: #e9ecef;
  border-left-color: #667eea;
}

.section-header .mdi:first-child {
  font-size: 20px;
  margin-right: 12px;
  color: #667eea;
}

.section-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #343a40;
}

.section-header .mdi:last-child {
  font-size: 18px;
  color: #6c757d;
  transition: transform 0.3s ease;
}

.nav-items {
  padding-left: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  text-decoration: none;
  color: #6c757d;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  margin: 2px 0;
}

.nav-item:hover {
  background: #f8f9fa;
  border-left-color: #667eea;
  color: #495057;
  transform: translateX(4px);
}

.nav-item.active {
  background: #e7f3ff;
  border-left-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

.nav-item .mdi {
  font-size: 18px;
  margin-right: 10px;
  width: 20px;
}

.nav-item span:last-child {
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .fund-nav-container {
    border-radius: 0;
    box-shadow: none;
    border-bottom: 1px solid #dee2e6;
  }

  .nav-header {
    padding: 12px 16px;
  }

  .nav-title {
    font-size: 18px;
  }

  .section-header {
    padding: 10px 16px;
  }

  .nav-item {
    padding: 8px 16px;
  }
}
</style>