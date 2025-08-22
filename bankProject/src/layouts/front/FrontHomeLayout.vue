<template>
  <div class="homepage">
    <header>
      <div class="header">
        <div class="logo">
          <router-link to="/yuzubank/index"
            ><img src="../../image/logo_white.svg" alt="logo"
          /></router-link>
        </div>
        <nav class="main-nav">
          <ul class="nav-list">
            <li>
              <router-link to="/yuzubank/accountHome">我的帳戶</router-link>
            </li>

            <li class="dropdown">
              <a href="#">信用卡</a>
              <ul class="dropdown-menu">
                <li>
                  <router-link to="/yuzubank/cardShowcase">信用卡申請</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/record">我的申請紀錄</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/myCard">我的卡片</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/creditTransaction"
                    >交易</router-link
                  >
                </li>
                <li>
                  <router-link to="/yuzubank/myBill">我的帳單</router-link>
                </li>
              </ul>
            </li>
            <li><router-link to="/yuzubank/loanHome">貸款</router-link></li>
            <li><router-link to="/yuzubank/fundHome">基金</router-link></li>
          </ul>

          <!-- 未登入 -->
          <router-link
            v-if="!memberStore.isLoggedIn"
            to="/yuzubank/frontLogin"
            class="login-button"
          >
            登入
          </router-link>

          <!-- 已登入 -->
          <div v-else class="member-info">
            <div class="avatar">
              <router-link to="/yuzubank/memberProfile">
                <img :src="memberStore.mImage" alt="會員頭像" />
              </router-link>
            </div>
            <span class="member-name">歡迎，{{ memberStore.mName }}</span>
            <button class="logout-button" @click="showLogoutModal = true">
              登出
            </button>
          </div>
        </nav>
      </div>
    </header>

    <div class="main">
      <router-view></router-view>
    </div>

    <footer>
      <div class="footer-left">
        <h3>YuzuBank</h3>
        <p>「讓理財像剝柚子一樣自然、簡單。」</p>
        <p>Copyright © 2025 柚子銀行 All Rights Reserved.</p>
      </div>
      <div class="footer-right">
        <v-icon size="80">mdi-qrcode-scan</v-icon>
        <div class="footer-right-content">
          <h4>聯絡我們</h4>
          <p>電話：02-12345678</p>
          <p>Email：info@example.com</p>
        </div>
      </div>
    </footer>

    <!-- 登出確認視窗 -->
    <LogoutModal
      :visible="showLogoutModal"
      message="你確定要登出嗎？"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import router from "@/router/index";

// 登出確認 Modal
import LogoutModal from "@/components/logoutModal.vue";

const memberStore = useMemberStore();
const showLogoutModal = ref(false);

// 確認登出
const handleLogout = () => {
  memberStore.logout();
  showLogoutModal.value = false;
  router.push("/yuzubank/index");
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.homepage {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding-top: 100px;
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.nav-list li {
  position: relative;
}

.nav-list a {
  text-decoration: none;
  color: #ffffff;
  font-weight: 300;
  padding: 10px 12px;
  transition: color 0.3s;
}

.nav-list a:hover {
  color: #ffffff;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  flex-direction: column;
  background-color: #000000;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  list-style: none;
  padding: 16px 0;
  margin: 0;
  margin-top: 8px;
  min-width: 120px;
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-menu li a {
  display: block;
  list-style: none;
  line-height: 2;
  padding: 8px 16px;
  white-space: nowrap;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-info .avatar img {
  width: 36px;
  height: 36px;
  margin-top: 8px;
  border-radius: 50%;
  object-fit: cover;
}

.member-name {
  color: #fff;
  font-weight: 400;
  font-size: 18px;
  padding-right: 20px;
}

.login-button {
  background-color: transparent;
  color: #ffffff;
  padding: 8px 16px;
  border: 1px solid #ffffff;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  margin-left: auto;
  transition: background-color 0.3s, color 0.3s, border 0.3s;
}

.login-button:hover {
  background-color: #ffffff;
  border: none;
  color: #222626;
}

.logout-button {
  background: transparent;
  border: 0.25px solid #fff;
  border-radius: 20px;
  color: #fff;
  padding: 4px 14px;
  cursor: pointer;
  font-weight: 400;
}

.logout-button:hover {
  background: #fff;
  color: #222626;
}

header {
  background-color: #222626;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

header .header {
  width: 100%;
  max-width: 1280px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header .logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

header .logo img {
  width: 116px;
  height: auto;
  object-fit: cover;
  margin-right: 20px;
}

footer {
  background-color: #f5f5f5;
  padding: 32px 192px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

footer .footer-right {
  display: flex;
  flex-flow: row;
  gap: 24px;
}

footer .footer-right-content {
  display: flex;
  flex-flow: column;
  justify-content: center;
}
</style>
