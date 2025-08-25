<template>
  <div class="homepage">
    <header>
      <div class="header">
        <div class="logo">
<<<<<<< HEAD
          <router-link to="/yuzubank/front"><img src="../../image/logo_horizontal.png" alt="logo" /></router-link>
=======
          <router-link to="/yuzubank/index"><img src="../../image/logo_white.svg" alt="logo" /></router-link>
>>>>>>> home3r6
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
<<<<<<< HEAD
                  <router-link to="/yuzubank/record">我的申請紀錄</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/myCard">我的卡片</router-link>
                </li>
                <li>
=======
>>>>>>> home3r6
                  <router-link to="/yuzubank/creditTransaction">交易</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/myBill">我的帳單</router-link>
                </li>
              </ul>
            </li>

            <li><router-link to="/yuzubank/loanHome">貸款</router-link></li>

            <li class="dropdown">
              <a href="#">基金</a>
              <ul class="dropdown-menu">
                <li>
                  <router-link to="/yuzubank/myFund">我的基金</router-link>
                </li>
                <li>
                  <router-link to="/yuzubank/buyFund">申購基金</router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- 未登入 -->
          <router-link v-if="!memberStore.isLoggedIn" to="/yuzubank/frontLogin" class="login-button">
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
      <div class="footer-container">
        <!-- 左側：公司資訊 -->
        <div class="footer-section company-info">
          <div class="company-logo">
            <img src="../../image/logo_horizontal.png" alt="柚子銀行" />
          </div>
          <p class="company-slogan">讓理財像剝柚子一樣自然、簡單</p>
          <!-- QR Code 區域 -->
          <div class="qr-section">
            <div class="qr-code">
              <v-icon size="64">mdi-qrcode-scan</v-icon>
            </div>
            <p class="qr-text">掃碼下載<br>柚子銀行 APP</p>
          </div>
        </div>

        <!-- 中左：服務項目 -->
        <div class="footer-section services">
          <h4>服務項目</h4>
          <ul>
            <li><a href="/yuzubank/accountHome">數位帳戶</a></li>
            <li><a href="/yuzubank/cardShowcase">信用卡服務</a></li>
            <li><a href="/yuzubank/loanHome">貸款服務</a></li>
            <li><a href="/yuzubank/fundHome">投資理財</a></li>
          </ul>
        </div>

        <!-- 中右：客戶服務 -->
        <div class="footer-section customer-service">
          <h4>客戶服務</h4>
          <ul>
            <li><a href="#">服務據點</a></li>
            <li><a href="#">客服中心</a></li>
            <li><a href="#">常見問題</a></li>
            <li><a href="#">費用說明</a></li>
          </ul>
        </div>

        <!-- 右側：聯絡資訊 -->
        <div class="footer-section contact-info">
          <h4>聯絡資訊</h4>
          <div class="contact-details">
            <div class="contact-item">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <div>
                <p class="contact-label">24小時客服專線</p>
                <p class="contact-value">(03)453-2632</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <p class="contact-label">客服信箱</p>
                <p class="contact-value">yuzubank202@gmail.com</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <p class="contact-label">總行地址</p>
                <p class="contact-value">桃園市中壢區新生路二段421號</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版權與法律資訊 -->
      <div class="footer-bottom">
        <div class="footer-bottom-container">
          <div class="legal-links">
            <a href="#">隱私權政策</a>
            <a href="#">服務條款</a>
            <a href="#">個資保護聲明</a>
            <a href="#">資訊安全</a>
            <a href="#">利率及匯率</a>
          </div>
          <div class="certifications">
            <div class="cert-item">
              <span class="cert-label">金管會許可證號：</span>
              <span class="cert-number">銀總字第 000123 號</span>
            </div>
            <div class="cert-item">
              <span class="cert-label">存款保險標章：</span>
              <span class="cert-number">中央存款保險公司</span>
            </div>
          </div>
          <div class="copyright">
            <p>© 2025 柚子銀行股份有限公司 版權所有 | YuzuBank Co., Ltd. All Rights Reserved.</p>
            <p class="warning-text">※ 銀行不會以電話或簡訊要求客戶提供帳戶資料，請慎防詐騙</p>
          </div>
        </div>
      </div>
    </footer>

    <!-- 登出確認視窗 -->
    <LogoutModal :visible="showLogoutModal" message="你確定要登出嗎？" @confirm="handleLogout"
      @cancel="showLogoutModal = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import router from "@/router";

// 登出確認 Modal
import LogoutModal from "@/components/logoutModal.vue";

const memberStore = useMemberStore();
const showLogoutModal = ref(false);

// 確認登出
const handleLogout = () => {
  memberStore.logout();
  showLogoutModal.value = false;
  router.push("/yuzubank/front");
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
  padding-top: 96px;
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
  margin: 0 0 0 88px;
  padding: 0;
}

.nav-list li {
  position: relative;
}

.nav-list a {
  text-decoration: none;
  color: #ffffff;
  font-size: 20px;
  font-weight: 400;
  padding: 10px 12px;
  transition: color 0.3s;
}

.nav-list a:hover {
  color: #ffffff;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  flex-direction: column;
  background-color: #0D111F;
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
  gap: 20px;
}

.member-info .avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.member-name {
  color: #fff;
  font-weight: 400;
  font-size: 20px;
}

.login-button {
  background-color: transparent;
  color: #ffffff;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  text-decoration: none;
  font-weight: 400;
  margin-left: auto;
  transition: all 0.3s ease;
  font-size: 18px;
}

.login-button:hover {
  background-color: #ffffff;
  border-color: #fff;
  color: #0D111F;
}

.logout-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 400;
  font-size: 18px;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #fff;
  color: #0D111F;
  border-color: #fff;
}

header {
  background-color: #0D111F;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  height: 96px;
  display: flex;
  justify-content: center;
  align-items: center;
}

header .header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 300px;
}

header .logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

header .logo img {
  height: 48px;
  width: auto;
  object-fit: cover;
}

/* Footer 專業銀行風格 */
footer {
  background: linear-gradient(135deg, #1a1f35 0%, #0D111F 100%);
  color: #ffffff;
  flex-shrink: 0;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 40px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 96px;
}

.footer-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #EBB211;
  margin-bottom: 20px;
  border-bottom: 2px solid #EBB211;
  padding-bottom: 8px;
}

/* 公司資訊區 */
.company-info .company-logo img {
  height: 40px;
  margin-bottom: 16px;
}

.company-slogan {
  font-size: 18px;
  font-weight: 500;
  color: #EBB211;
  margin-bottom: 12px;
  font-style: italic;
}

/* 服務項目與客戶服務 */
.services ul,
.customer-service ul {
  list-style: none;
}

.services li,
.customer-service li {
  margin-bottom: 8px;
}

.services a,
.customer-service a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s ease;
  display: block;
  padding: 4px 0;
}

.services a:hover,
.customer-service a:hover {
  color: #EBB211;
  padding-left: 8px;
}

/* 聯絡資訊區 */
.contact-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.contact-icon {
  width: 20px;
  height: 20px;
  color: #EBB211;
  margin-top: 2px;
  flex-shrink: 0;
}

.contact-icon svg {
  width: 100%;
  height: 100%;
}

.contact-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
}

.contact-value {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* QR Code 區域 */
.qr-section {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(235, 178, 17, 0.3);
}

.qr-code {
  color: #EBB211;
}

.qr-text {
  font-size: 16px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

/* Footer 底部 */
.footer-bottom {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legal-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legal-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.legal-links a:hover {
  color: #EBB211;
}

.certifications {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.cert-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.cert-label {
  color: rgba(255, 255, 255, 0.6);
}

.cert-number {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  text-align: center;
}

.copyright p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.warning-text {
  color: #EBB211 !important;
  font-weight: 500 !important;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .nav-list {
    margin: 0;
    gap: 16px;
  }

  .header {
    padding: 0 20px !important;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 20px;
  }

  .legal-links {
    justify-content: center;
  }

  .certifications {
    justify-content: center;
  }
}
</style>