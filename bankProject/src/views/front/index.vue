<template>
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title1">讓理財更簡單</h1>
        <h1 class="hero-title2">讓生活更自在</h1>
        <p class="hero-subtitle">柚子銀行，你的專業財務夥伴</p>
        <div class="hero-buttons">
          <button @click="goToRegister">立即開戶</button>
        </div>
      </div>
      <div class="modal-image">
        <img src="../../image/indexImage.png" alt="首頁圖" />
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
/* * {
  border: 1px solid #fff;
} */

section {
  background-color: #0D111F;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 100px 320px 0px 320px;
}

.hero-section {
  position: relative;
  width: 100%;
  min-height: 880px;
  /* 可依需求調整 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-content {
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.hero-text {
  color: white;
  max-width: 600px;
  font-size: 48px;
}

.hero-text .hero-title1,
.hero-text .hero-title2 {
  font-size: 72px;
  font-weight: 700;
}

.hero-text h1 {
  font-size: 30px;
  margin-bottom: -16px;
}

.hero-text p {
  font-size: 24px;
  padding-top: 12px;
  font-weight: 200;
  letter-spacing: 4px;
}

.hero-buttons {
  font-size: 24px;
  font-weight: 500;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 48px;
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding: 8px 16px;
  background-color: #EBB211;
  border-radius: 50px;
  color: #0D111F;
}

.modal-image {
  width: 60%;
  height: auto;
}

.modal-image img {
  width: 100%;
  justify-content: center;
  height: auto;
}
</style>
