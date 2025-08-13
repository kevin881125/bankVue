<template>
  <div class="homepage">
    <header>
      <div class="logo">
        <img src="../../image/logo_white.svg" alt="logo" />
      </div>
      <nav class="main-nav">
        <ul class="nav-list">
          <li><router-link to="/login">我的帳戶</router-link></li>

          <li class="dropdown">
            <a href="#">信用卡</a>
            <ul class="dropdown-menu">
              <li><router-link to="/login">信用卡申請</router-link></li>
              <li><router-link to="/login">我的申請紀錄</router-link></li>
            </ul>
          </li>

          <li class="dropdown">
            <a href="#">貸款</a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/yuzubank/loanHome">貸款申請</router-link>
              </li>
              <li><router-link to="/login">我的申請紀錄</router-link></li>
            </ul>
          </li>

          <li><router-link to="/login">繳費</router-link></li>
          <li><router-link to="/login">基金</router-link></li>
        </ul>
        <router-link to="/yuzubank/frontLogin" class="login-button">登入</router-link>
      </nav>
    </header>
    <div class="main">
      <router-view></router-view>
    </div>

    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title1">你需要的?</h1>
        <h1 class="hero-title2">All in YuzuBank</h1>
        <p class="hero-subtitle">最多人使用的數位銀行</p>
        <div class="hero-buttons">
          <button @click="goToRegister">立即開戶</button>
          <button @click="goToLearnMore">了解更多</button>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="../../image/img-black.png
        "
          alt="理財插畫"
        />
      </div>
    </section>
    <section class="account-content">
      <div class="account-text">
        <h2>存錢、消費、理財</h2>
        <h2>一次搞定</h2>
        <p>
          APP即可申請臺幣、外幣、台新證券交割帳戶，並享有新戶優利
          <strong>3.5%</strong>，首次基金投資免手續費。
        </p>
        <router-link to="/login">
          <button class="open-account-btn">看開戶指南</button>
        </router-link>
      </div>
      <div class="account-image">
        <img src="../../image/richart.png" alt="開戶宣傳圖" />
      </div>
    </section>

    <section class="credit-section">
      <h1 class="title">信用卡申請</h1>
      <div class="steps credit-steps">
        <div class="step">
          <v-icon size="40">mdi-book-check</v-icon>
          <h3>填寫資料</h3>
          <p>線上填寫申請資料</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-card-account-details</v-icon>
          <h3>進行驗證</h3>
          <p>準備身分證進行驗證</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-file-search</v-icon>
          <h3>案件審核</h3>
          <p style="text-align: center">送出申請後<br />隨時可追蹤案件狀態</p>
        </div>
      </div>
      <router-link to="/login" class="apply-button">立即申請</router-link>
    </section>

    <section class="loan-section">
      <h1 class="title">貸款申請，隨借隨用</h1>
      <div class="steps">
        <div class="step">
          <v-icon size="40">mdi-book-check</v-icon>
          <h3>填寫資料</h3>
          <p>線上填寫申請資料</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-card-account-details</v-icon>
          <h3>進行驗證</h3>
          <p>準備身分證進行驗證</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-file-search</v-icon>
          <h3>案件審核</h3>
          <p style="text-align: center">送出申請後<br />隨時可追蹤案件狀態</p>
        </div>
        <v-icon size="40">mdi-chevron-right</v-icon>
        <div class="step">
          <v-icon size="40">mdi-cash-multiple</v-icon>
          <h3>取得額度</h3>
          <p>最快 20 分鐘完成審核</p>
        </div>
      </div>
      <router-link to="/login" class="apply-button">立即申請</router-link>
    </section>

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
  </div>
</template>

<script setup>
import { useMemberStore } from "@/stores/MemberStore";
import { ref } from "vue";
import router from "@/router/index";

const memberStore = useMemberStore();

const mName = ref(memberStore.mName);
const mAccount = ref(memberStore.mAccount);

const signOut = () => {
  memberStore.logout();
  console.log(memberStore.mId);

  router.push("/yuzubank/frontLogin");
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.account-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 48px;
  flex-direction: row;
}
@media (max-width: 576px) {
  .account-content {
    flex-direction: column;
    text-align: center;
  }
}
.account-content .account-text {
  flex: 1;
}
.account-content .account-text h2 {
  font-size: 48px;
  margin-bottom: 8px;
  color: #222;
}
.account-content .account-text p {
  font-size: 24px;
  line-height: 1.6;
  margin: 16px 0;
  color: #555;
}
.account-content .account-text .open-account-btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 24px;
  background-color: #ebb211;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}
.account-content .account-text .open-account-btn:hover {
  background-color: rgb(187.4404761905, 141.9761904762, 13.5595238095);
}
.account-content .account-image {
  flex: 1;
  text-align: right;
}
.account-content .account-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
@media (max-width: 768px) {
  .account-content .account-image {
    text-align: center;
  }
}
.material-symbols-outlined {
  padding: 8px;
  font-size: 40px;
  color: #222626;
}
section {
  background-color: #1b2028;
  display: flex;
  flex-flow: column;
  align-items: center;
  margin: 72px 0px;
  padding-top: 96px;
}
.title {
  font-size: 32px;
  text-align: center;
}
.steps {
  width: calc(100% - 576px);
  padding: 72px 192px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
}
.steps .step {
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 4px;
}
.credit-steps {
  width: calc(100% - 640px);
  padding: 48px 96px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
}
.credit-steps .step {
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 8px;
}
.apply-button {
  width: fit-content;
  background-color: #ebb211;
  font-size: 16px;
  color: #ffffff;
  padding: 16px 32px;
  text-decoration: none;
  border-width: 0;
  border-radius: 32px;
}
.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 40px;
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
  padding: 10px 8px;
  transition: color 0.3s;
}
.nav-list a:hover {
  color: #ffffff;
  font-weight: 600;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  display: none;
  flex-direction: column;
  background-color: #000000;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  list-style: none;
  padding: 16px 0;
  margin: 0;
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
.dropdown-menu li a:hover {
  background-color: #f5f5f542;
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
  margin-right: 50px;
  transition: background-color 0.3s, color 0.3s, border 0.3s;
}
.login-button:hover {
  background-color: #ffffff;
  border: none;
  color: #222626;
}
.credit-section {
  background-color: #f8f9fa;
  padding: 80px;
}
.loan-section {
  background-color: #ffffff;
}
.credit-section .title {
  color: #ce1465;
}
.loan-section .title {
  color: #009e60;
}

.hero-content {
  color: white;
  font-size: 48px;
}

form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px;
  background-color: #f9f9f9;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

form label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

form input,
form select {
  width: 100%;
  padding: 12px 15px 12px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 50px;
  /* 圓角 */
  background-color: #fff;
  transition: border-color 0.2s ease-in-out;
  box-sizing: border-box;
}

form input:focus,
form select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -webkit-appearance: none;
  /* Chrome, Safari */
  -moz-appearance: textfield;
  /* Firefox */
  appearance: none;
  /* 標準寫法 */
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-unit input {
  width: 100%;
  padding-right: 2rem;
}

.input-with-unit span {
  margin-left: -2rem;
  pointer-events: none;
  color: #333;
}

form button {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #ebb211;
  border: none;
  border-radius: 50px;
  /* 圓角 */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

form button:hover {
  background-color: #357ab8;
}

/* 外層容器 */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

/* 隱藏系統預設箭頭 */
.custom-select-wrapper select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #fff;
  padding: 12px 48px 12px 20px; /* 注意右側 padding 留空間給 icon */
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 50px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out;
}

/* 自訂箭頭 icon */
.custom-select-wrapper .custom-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 24px;
}

header {
  background-color: #222626;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
header .logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
header .logo img {
  width: 128px;
  height: 80px;
  object-fit: cover;
}

footer {
  background-color: #f5f5f5;
  padding: 32px 192px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
footer .material-symbols-rounded {
  font-size: 80px;
  color: #222626;
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
