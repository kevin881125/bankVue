<template>
  <div class="homepage">
    <!-- 頂部導航區 - 僅登入後顯示 -->
    <header
      v-show="memberStore.isLoggedIn"
      class="top-header"
      :class="{ 'header-animate-enter': isAnimating }"
    >
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <router-link to="/yuzubank/front">
            <img src="../../image/logo_horizontal.png" alt="柚子銀行" />
          </router-link>
        </div>

        <!-- 登入區域 -->
        <div class="auth-section">
          <div class="member-section">
            <div class="member-info">
              <div class="avatar">
                <router-link to="/yuzubank/memberProfile">
                  <img :src="memberStore.mImage" alt="會員頭像" />
                </router-link>
              </div>
              <span class="welcome-text">歡迎，{{ memberStore.mName }}</span>
            </div>
            <button class="logout-btn" @click="showLogoutModal = true">
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主視覺區域 -->
    <section
      class="hero-section"
      :class="{ 'with-header': memberStore.isLoggedIn }"
    >
      <div class="hero-content">
        <!-- 左側標語區 -->
        <div class="hero-text">
          <div
            v-show="!memberStore.isLoggedIn"
            class="hero-logo"
            :class="{ 'logo-animate-up': isAnimating }"
          >
            <img src="../../image/logo_horizontal.png" alt="柚子銀行" />
          </div>

          <h1 class="hero-title1" :class="{ 'title-animate-up': isAnimating }">
            讓理財更簡單
          </h1>
          <h1 class="hero-title2" :class="{ 'title-animate-up': isAnimating }">
            帳戶安全更放心
          </h1>
          <p
            class="hero-subtitle"
            :class="{ 'subtitle-animate-up': isAnimating }"
          >
            | 柚子銀行 | 最瞭解您的專業財務夥伴
          </p>
          <div
            class="hero-buttons"
            :class="{ 'button-animate-fade': isAnimating }"
          >
            <button @click="handleMainAction">
              {{ memberStore.isLoggedIn ? "立即開戶" : "立即加入" }}
            </button>
          </div>
        </div>

        <!-- 右側主視覺圖片 -->
        <div class="hero-image" :class="{ 'image-animate-scale': isAnimating }">
          <img src="../../image/indexImage.png" alt="柚子銀行主視覺" />
        </div>
      </div>
    </section>

    <!-- 功能卡片區域 -->
    <section
      class="services-section"
      :class="{ 'services-with-header': memberStore.isLoggedIn }"
    >
      <div class="services-container">
        <div class="service-cards">
          <!-- 我的帳戶 -->
          <div
            class="service-card"
            :class="{ 'card-animate-enter': isAnimating }"
          >
            <router-link to="/yuzubank/accountHome" class="card-link">
              <div class="card-icon">
                <div class="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <h3>我的帳戶</h3>
              <p>查看餘額、交易紀錄與帳戶管理</p>
            </router-link>
          </div>

          <!-- 信用卡 -->
          <div
            class="service-card multi-option-card"
            :class="{ 'card-animate-enter': isAnimating }"
            @mouseenter="hoveredCard = 'credit'"
            @mouseleave="hoveredCard = null"
          >
            <div v-show="hoveredCard !== 'credit'" class="card-content">
              <div class="card-icon">
                <div class="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="6"
                      width="20"
                      height="12"
                      rx="2"
                      fill="currentColor"
                    />
                    <rect x="2" y="10" width="20" height="2" fill="#EBB211" />
                  </svg>
                </div>
              </div>
              <h3>信用卡</h3>
              <p>申請、管理與帳單查詢</p>
            </div>

            <div v-show="hoveredCard === 'credit'" class="options-list">
              <router-link to="/yuzubank/cardShowcase" class="option-item"
                >信用卡申請</router-link
              >
              <router-link to="/yuzubank/record" class="option-item"
                >申請紀錄</router-link
              >
              <router-link to="/yuzubank/myCard" class="option-item"
                >我的卡片</router-link
              >
              <router-link to="/yuzubank/creditTransaction" class="option-item"
                >交易紀錄</router-link
              >
              <router-link to="/yuzubank/myBill" class="option-item"
                >我的帳單</router-link
              >
            </div>
          </div>

          <!-- 貸款 -->
          <div
            class="service-card"
            :class="{ 'card-animate-enter': isAnimating }"
          >
            <router-link to="/yuzubank/loanHome" class="card-link">
              <div class="card-icon">
                <div class="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
              <h3>貸款</h3>
              <p>房貸、車貸與信貸服務</p>
            </router-link>
          </div>

          <!-- 基金 -->
          <div
            class="service-card multi-option-card"
            :class="{ 'card-animate-enter': isAnimating }"
            @mouseenter="hoveredCard = 'fund'"
            @mouseleave="hoveredCard = null"
          >
            <div v-show="hoveredCard !== 'fund'" class="card-content">
              <div class="card-icon">
                <div class="icon-circle">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 17L9 11L13 15L21 7"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M21 7H15V1"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
              <h3>基金</h3>
              <p>投資理財與資產配置</p>
            </div>

            <div v-show="hoveredCard === 'fund'" class="options-list">
              <router-link to="/yuzubank/myFund" class="option-item"
                >我的基金</router-link
              >
              <router-link to="/yuzubank/buyFund" class="option-item"
                >申購基金</router-link
              >
              <router-link to="/yuzubank/#" class="option-item"
                >市場行情</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 登出確認視窗 -->
    <LogoutModal
      :visible="showLogoutModal"
      message="您確定要登出嗎？"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import { useRoute } from "vue-router";
import router from "@/router";
import LogoutModal from "@/components/logoutModal.vue";

const memberStore = useMemberStore();
const route = useRoute();
const showLogoutModal = ref(false);
const hoveredCard = ref(null);
const isAnimating = ref(false);

// 監聽登入狀態變化
watch(
  () => memberStore.isLoggedIn,
  (newValue, oldValue) => {
    if (oldValue === false && newValue === true) {
      triggerAnimation();
    }
    if (oldValue === true && newValue === false) {
      triggerAnimation();
    }
  }
);

// 掛載時強制觸發一次動畫
onMounted(() => {
  triggerAnimation();
});

// 觸發動畫
const triggerAnimation = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 350);
};

// 登出
const handleLogout = () => {
  memberStore.logout();
  showLogoutModal.value = false;
  router.push("/yuzubank/front");
};

// 主要按鈕
const handleMainAction = () => {
  if (memberStore.isLoggedIn) {
    router.push("/yuzubank/accountHome");
  } else {
    router.push("/yuzubank/frontLogin");
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  background-color: #0d111f;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.top-header {
  flex-shrink: 0;
  height: 96px;
  background: rgba(13, 17, 31, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1000;
  /* 統一使用 transition 動畫 */
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  /* 初始狀態：在上方隱藏 */
  transform: translateY(-100%);
  opacity: 0;
}

/* Header 動畫：移除 keyframes，改用 transition */
.top-header:not(.header-animate-enter) {
  transform: translateY(0);
  opacity: 1;
}

.top-header.header-animate-enter {
  transform: translateY(-100%);
  opacity: 0;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img {
  height: 48px;
  width: auto;
}

/* auth */
.auth-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.welcome-text {
  font-weight: 400;
  font-size: 20px;
  color: #fff;
}

.logout-btn {
  background: transparent;
  color: #fff;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 400;
  transition: all 0.3s ease;
  font-size: 18px;
}

.logout-btn:hover {
  background: #fff;
  color: #0d111f;
  border-color: #fff;
}

/* 主視覺區域 */
.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 80px 0 280px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.hero-section.with-header {
  padding-top: 0;
  transform: translateY(-50px);
  overflow: hidden;
}

.hero-content {
  max-width: 1920px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
}

.hero-text {
  color: white;
  max-width: 600px;
}

/* Hero Logo - 僅未登入時顯示 */
.hero-logo {
  margin-bottom: 16px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-logo.logo-animate-up {
  opacity: 0;
  transform: translateY(50px);
}

.hero-logo img {
  height: 96px;
  width: auto;
}

.hero-title1,
.hero-title2 {
  font-size: 80px;
  font-weight: 600;
  line-height: 1.1;
  background: #ffffff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 10px 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 標題動畫 - 僅登入時 */
.hero-title1.title-animate-up {
  transform: translateY(-50px);
}

.hero-title2.title-animate-up {
  transform: translateY(-50px);
}

.hero-subtitle {
  font-size: 24px;
  padding-top: 12px;
  font-weight: 400;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: -8px;
  margin-bottom: 24px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 副標題動畫 - 僅登入時 */
.hero-subtitle.subtitle-animate-up {
  transform: translateY(-50px);
}

.hero-buttons {
  display: inline-block;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 按鈕動畫 - 僅登入時 */
.hero-buttons.button-animate-fade {
  opacity: 0.7;
  transform: translateY(-30px);
}

.hero-buttons button {
  font-size: 24px;
  font-weight: 500;
  width: 160px;
  height: 48px;
  background: #ebb211;
  border-radius: 50px;
  color: #0d111f;
  box-shadow: 0 8px 25px rgb(136, 193, 79, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.hero-buttons button:hover {
  border: 1.5px solid#EBB211;
  color: #0d111f;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(176, 193, 79, 0.2);
}

.hero-image {
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-bottom: 48px;
  margin-left: 160px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* 圖片動畫 - 僅登入時 */
.hero-image.image-animate-scale {
  transform: translateY(-30px) scale(0.98);
}

.hero-image img {
  max-width: 70%;
  height: auto;
  max-height: calc(100vh - 200px);
  object-fit: contain;
}

/* 功能卡片區域 */
.services-section {
  flex-shrink: 0;
  height: 192px;
  background: linear-gradient(180deg, #0d111f 0%, #1a1f35 100%);
  display: flex;
  align-items: center;
  padding: 40px 40px 80px 40px;
  margin-top: -80px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.services-section.services-with-header {
  transform: translateY(-40px);
}

.services-container {
  max-width: 1920px;
  margin: 0 auto;
  width: 100%;
}

.service-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.service-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  height: 232px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  /* 統一動畫：初始狀態 */
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 卡片動畫效果 - 僅登入時 */
.service-card.card-animate-enter {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.service-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(235, 178, 17, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  height: 100%;
  justify-content: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
}

.card-icon {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 48px;
  height: 48px;
  background-color: #ebb211;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.service-card:hover .icon-circle {
  transform: scale(1.1);
  background: linear-gradient(135deg, #ebb211, #ce1465);
  border: none;
  box-shadow: 0 8px 25px rgba(235, 178, 17, 0.3);
}

.icon-circle svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

.service-card h3 {
  font-size: 26px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #d7d7d7;
}

.service-card p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 多選項卡片樣式 */
.multi-option-card {
  cursor: pointer;
}

.options-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: 4px;
}

.option-item {
  display: block;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: 400;
}

.option-item:hover {
  background: rgba(235, 178, 17, 0.1);
  color: #ebb211;
  transform: translateX(4px);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .hero-content {
    gap: 60px;
  }

  .hero-title1,
  .hero-title2 {
    font-size: 60px;
  }
}

@media (max-width: 768px) {
  .homepage {
    height: auto;
    min-height: 100vh;
  }

  .hero-section {
    flex: none;
    padding: 40px 20px;
  }

  .hero-content {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .hero-title1,
  .hero-title2 {
    font-size: 42px;
  }

  .service-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .header-content {
    padding: 0 20px;
  }

  .services-section {
    height: auto;
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .service-cards {
    grid-template-columns: 1fr;
  }

  .hero-title1,
  .hero-title2 {
    font-size: 32px;
  }
}
</style>
