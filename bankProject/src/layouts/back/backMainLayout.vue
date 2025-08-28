<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- 收合按鈕 -->
      <button class="collapse-btn" @click="toggleSidebar">
        <span
          class="material-symbols-outlined"
          style="
            font-variation-settings: 'wght' 200;
            font-size: 28px;
            color: #fff;
          "
        >
          {{ isCollapsed ? "menu" : "menu_open" }}
        </span>
      </button>

      <!-- Logo 區域 -->
      <div class="logo-section">
        <div class="logo-container">
          <img
            v-if="!isCollapsed"
            class="logo-expanded"
            src="../../image/logo_horizontal.png"
            alt="YuzuBank"
          />
        </div>
      </div>

      <!-- 功能列表 -->
      <nav class="navigation">
        <ul class="nav-list">
          <li v-if="hasAccess(1)" class="nav-item">
            <router-link to="/yuzubank/backmain/member" class="nav-link">
              <span class="mdi mdi-account nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">會員管理</span>
            </router-link>
          </li>

          <!-- 帳戶管理下拉選單 -->
          <li
            v-if="hasAccess(2)"
            class="nav-item dropdown"
            :class="{ active: accountDropdownOpen }"
          >
            <div
              class="nav-link dropdown-toggle"
              @click="toggleAccountDropdown"
            >
              <span class="mdi mdi-piggy-bank nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">帳戶管理</span>
              <span
                v-if="!isCollapsed"
                class="mdi dropdown-arrow"
                :class="
                  accountDropdownOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'
                "
              ></span>
            </div>
            <ul
              v-if="!isCollapsed"
              class="dropdown-menu"
              :class="{ show: accountDropdownOpen }"
            >
              <li>
                <router-link
                  to="/yuzubank/backmain/account"
                  class="dropdown-link"
                >
                  <span class="mdi mdi-bank nav-icon"></span>
                  帳戶交易
                </router-link>
              </li>
              <li>
                <router-link
                  to="/yuzubank/backmain/accountapplication"
                  class="dropdown-link"
                >
                  <span class="mdi mdi-hand-coin nav-icon"></span>
                  帳戶申請
                </router-link>
              </li>
            </ul>
          </li>

          <li v-if="hasAccess(3)" class="nav-item">
            <router-link to="/yuzubank/backmain/creditCard" class="nav-link">
              <span class="mdi mdi-credit-card nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">信用卡管理</span>
            </router-link>
          </li>

          <li v-if="hasAccess(4)" class="nav-item">
            <router-link to="/yuzubank/backmain/loan" class="nav-link">
              <span class="mdi mdi-cash nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">貸款管理</span>
            </router-link>
          </li>

          <li v-if="hasAccess(5)" class="nav-item">
            <router-link to="/yuzubank/backmain/fundBack" class="nav-link">
              <span class="mdi mdi-trending-up nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">基金管理</span>
            </router-link>
          </li>

          <li v-if="hasAccess(6)" class="nav-item">
            <router-link to="/yuzubank/backmain/workerManage" class="nav-link">
              <span class="mdi mdi-account-key nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">管理員權限</span>
            </router-link>
          </li>

          <li v-if="hasAccess(7)" class="nav-item">
            <router-link to="/yuzubank/backmain/workLoge" class="nav-link">
              <span class="mdi mdi-file-document-edit-outline nav-icon"></span>
              <span v-if="!isCollapsed" class="nav-text">管理員記錄</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 用戶資訊和登出 -->
      <div class="user-section">
        <div class="user-card" v-if="!isCollapsed">
          <!-- 上半部：用戶資訊 -->
          <div class="user-info">
            <div class="worker">
              <div class="user-avatar">
                <span class="mdi mdi-account-circle"></span>
              </div>
              <div class="user-details">
                <div class="user-name">{{ wName }}</div>
                <div class="user-account">{{ wAccount }}</div>
              </div>
            </div>
          </div>

          <!-- 下半部：登出按鈕 -->
          <div class="user-actions">
            <button class="logout-btn" @click="signOut">
              <span class="mdi mdi-logout"></span>
              <span class="logout-text">登出</span>
            </button>
          </div>
        </div>

        <!-- 收合狀態的登出按鈕 -->
        <button
          v-else
          class="logout-btn collapsed"
          @click="signOut"
          title="登出"
        >
          <span class="mdi mdi-logout"></span>
        </button>
      </div>
    </div>

    <!-- 右側主要內容區域 -->
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useWorkerStore } from "@/stores/Worker";
import { ref, onMounted, watch } from "vue";
import router from "@/router/index";
import { useRoute } from "vue-router";
import { usePermissionStore } from "@/stores/usePermissionStore";
import "@/styles/variables.css";

const workerStore = useWorkerStore();
const permissionStore = usePermissionStore();

const wName = ref();
const wAccount = ref();
const isCollapsed = ref(false);
const accountDropdownOpen = ref(false);

const hasAccess = (pageId) => {
  return permissionStore.hasAccess(pageId);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  if (isCollapsed.value) {
    accountDropdownOpen.value = false;
  }
};

const toggleAccountDropdown = () => {
  if (!isCollapsed.value) {
    accountDropdownOpen.value = !accountDropdownOpen.value;
  }
};

onMounted(async () => {
  wName.value = workerStore.wName;
  wAccount.value = workerStore.wAccount;
});

const signOut = () => {
  workerStore.logout();
  router.push("/yuzubank/backLogin");
  permissionStore.emtity();
};

const route = useRoute();

watch(
  () => route.path,
  (newPath) => {
    // 如果不是帳戶模組的路由，就自動收合
    if (!newPath.startsWith("/yuzubank/backmain/account")) {
      accountDropdownOpen.value = false;
    }
  }
);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: var(--white);
}

.sidebar {
  width: 260px;
  height: 100%;
  background-color: #0d111f;
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.collapse-btn {
  position: absolute;
  top: 30px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.collapse-btn .mdi {
  font-size: 18px;
}

.collapse-btn:hover {
  background: #0d111f;
  color: #fff;
  transform: scale(1.05);
}

.logo-section {
  padding: 24px 60px 24px 0px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  height: 48px;
}

.logo-expanded {
  width: 160px;
  height: auto;
  max-height: 48px;
}

.logo-collapsed {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  display: block;
}

.navigation {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 2px 12px;
  border-radius: 10px;
  overflow: hidden;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  text-decoration: none;
  color: #e5e7eb;
  font-size: 18px;
  font-weight: 300;
  transition: all 0.2s ease;
  border-radius: 10px;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  transform: translateX(4px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #e5e7eb;
}

.nav-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 下拉選單樣式 */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-arrow {
  margin-left: auto;
  font-size: 16px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  background: rgba(255, 255, 255, 0.08);
  color: #c7c7c7;
  border-radius: 8px;
  margin-top: 4px;
  margin-left: 16px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.dropdown-menu.show {
  max-height: 200px;
  opacity: 1;
}

.dropdown-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #c7c7c7;
  background-color: rgba(255, 255, 255, 0.08);
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
}

.dropdown-link:hover {
  background: rgba(255, 255, 255, 0.15);
  /* color: var(--text-primary); */
  transform: translateX(4px);
}

.dropdown-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #c7c7c7;
}

.dropdown-link .nav-icon {
  font-size: 16px;
  margin-right: 8px;
}

/* 用戶區域 */
.user-section {
  padding: 20px;
}

.user-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #0d111f;
  border-radius: 12px;
  color: #e5e7eb;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
}

.user-actions:hover {
  background: rgba(255, 255, 255, 0.08);
}

.user-info {
  display: flex;
  /* align-items: center; */
  justify-content: center;
  padding: 12px;
  border-bottom: 2px solid #0d111f;
}

.user-avatar {
  font-size: 32px;
  color: var(--secondary-blue);
  margin-right: 12px;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.worker {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-account {
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  align-items: center;
  /* padding: 12px 12px; */
}

.logout-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  transform: translateY(-1px);
}

.logout-btn.collapsed {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  margin: 0 auto;
  gap: 0;
}

.logout-btn.collapsed .logout-text {
  display: none;
}

/* 主要內容區域 */
.main {
  flex: 1;
  height: 100vh;
  padding: 24px;
  overflow: auto;
  background: #f8fafc;
}

/* 響應式調整 */
@media (max-width: 1024px) {
  .sidebar {
    width: 260px;
  }

  .sidebar.collapsed {
    width: 70px;
  }

  .main {
    padding: 16px;
  }
}

/* 滾動條美化 */
.navigation::-webkit-scrollbar {
  width: 6px;
}

.navigation::-webkit-scrollbar-track {
  background: transparent;
}

.navigation::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.navigation::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 動畫效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease forwards;
}

.nav-item:nth-child(1) {
  animation-delay: 0.1s;
}
.nav-item:nth-child(2) {
  animation-delay: 0.15s;
}
.nav-item:nth-child(3) {
  animation-delay: 0.2s;
}
.nav-item:nth-child(4) {
  animation-delay: 0.25s;
}
.nav-item:nth-child(5) {
  animation-delay: 0.3s;
}
.nav-item:nth-child(6) {
  animation-delay: 0.35s;
}
.nav-item:nth-child(7) {
  animation-delay: 0.4s;
}
</style>