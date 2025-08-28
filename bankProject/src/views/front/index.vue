<template>
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title1">請更換路由為</h1>
        <h1 class="hero-title2">/yuzubank/front</h1>
        <h1 class="hero-title1">此頁面已作廢</h1>
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
  padding: 24px 320px 0px 320px;
}

.hero-section {
  position: relative;
  width: 100%;
  min-height: 880px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-content {
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 24px;
}

.hero-text {
  color: white;
  max-width: 600px;
  font-size: 48px;
}

.hero-text .hero-title1 {
  font-size: 72px;
  font-weight: 700;
  margin-bottom: 24px;
}

.hero-text .hero-title2 {
  font-size: 100px;
  font-weight: 700;
  margin-bottom: 24px;
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
