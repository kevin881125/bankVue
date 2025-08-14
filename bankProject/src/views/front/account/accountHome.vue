<template>
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
      <img src="../../../image/richart.png" alt="開戶宣傳圖" />
    </div>
  </section>
</template>
<script setup></script>
<style scoped>
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
</style>
