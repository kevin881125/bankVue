<template>
  <li v-if="hasAccess(5)" class="nav-group">
    <div class="group-header" @click="toggleGroup('fundTrading')">
      <router-link to="/yuzubank/backmain/fundTrading" class="main-link">
        <span class="mdi mdi-swap-horizontal"></span>基金交易管理
      </router-link>
      <span class="mdi toggle-icon"
        :class="expandedGroups.fundTrading ? 'mdi-chevron-down' : 'mdi-chevron-right'"></span>
    </div>

    <ul v-show="expandedGroups.fundTrading" class="sub-nav">
      <li>
        <router-link to="/yuzubank/backmain/fundTrading/fund" class="sub-link">
          <span class="mdi mdi-bank-outline"></span>基金產品管理
        </router-link>
      </li>
      <li>
        <router-link to="/yuzubank/backmain/fundTrading/fund/fundNav" class="sub-link">
          <span class="mdi mdi-chart-line-variant"></span>基金淨值管理
        </router-link>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { ref } from 'vue'

// Vue 3 中 defineProps 是編譯器宏，不需要導入
const props = defineProps({
  hasAccess: {
    type: Function,
    required: true
  }
})

// 展開狀態管理
const expandedGroups = ref({
  fundAccount: false,
  fundTrading: false
})

// 切換群組展開/收合
const toggleGroup = (group) => {
  expandedGroups.value[group] = !expandedGroups.value[group]
}
</script>

<style scoped>
.back-fund-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-group {
  margin-bottom: 4px;
}

.group-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  cursor: pointer;
}

.main-link {
  flex: 1;
  text-decoration: none;
  font-size: 20px;
  display: inline-block;
  width: 100%;
  height: 80px;
  padding-left: 50px;
  padding-top: 30px;
  font-weight: 300;
  color: rgb(0, 0, 0);
  transition: all 0.3s ease;
}

.main-link:hover {
  background-color: #f5f5f5;
  border-right: 10px solid orange;
}

.toggle-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #6c757d;
  transition: transform 0.3s ease;
}

.main-link>span.mdi {
  margin-right: 12px;
}

.sub-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #f8f9fa;
  border-left: 3px solid orange;
}

.sub-nav li {
  height: 60px;
}

.sub-nav li:hover {
  background-color: #e9ecef;
}

.sub-link {
  text-decoration: none;
  font-size: 16px;
  display: inline-block;
  width: 100%;
  height: 100%;
  padding-left: 70px;
  padding-top: 20px;
  font-weight: 300;
  color: #495057;
  transition: all 0.3s ease;
}

.sub-link:hover {
  color: orange;
  font-weight: 500;
}

.sub-link>span.mdi {
  margin-right: 8px;
  font-size: 16px;
}

/* 深度選擇器的現代寫法 */
:deep(.router-link-active.main-link) {
  background-color: #f5f5f5;
  border-right: 10px solid orange;
  font-weight: 600;
}

:deep(.router-link-active.sub-link) {
  color: orange;
  font-weight: 600;
  background-color: rgba(255, 165, 0, 0.1);
}
</style>