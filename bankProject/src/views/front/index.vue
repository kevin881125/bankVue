<template>
  <section class="hero-section">
    <div class="hero-image">
      <img src="../../image/img-black.png" alt="理財插畫" />
    </div>
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title1">你需要的?</h1>
        <h1 class="hero-title2">All in YuzuBank</h1>
        <p class="hero-subtitle">最多人使用的數位銀行</p>
        <div class="hero-buttons">
          <button @click="goToRegister">立即開戶</button>
          <button @click="goToLearnMore">了解更多</button>
        </div>
      </div>
      <div class="modal-image">
        <img src="../../image/modal.png" alt="模特" />
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
section {
  background-color: #1b2028;
  display: flex;
  flex-flow: column;
  align-items: center;
  margin: 0px;
  padding-top: 100px;
}

.hero-section {
  position: relative;
  width: 100%;
  min-height: 880px; /* 可依需求調整 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute; /* 底圖在最底層 */
  top: 0;
  left: 0;
  z-index: 1;
}

.hero-content {
  position: relative; /* 疊加在底圖上 */
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  gap: 160px;
  padding-left: 320px;
}

.hero-text {
  color: white;
  max-width: 600px;
  font-size: 48px;
}

.hero-text .hero-title2{
  font-size: 72px;
}

.hero-text h1 {
  margin: 0 0 16px 0;
  font-size: 30px;
}
.hero-text p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.hero-buttons {
  font-size: 16px;
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.modal-image img {
  width: 60%; /* 或依需求調整 */
  height: auto;
}
</style>
