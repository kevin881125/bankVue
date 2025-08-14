<template>
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
</template>
<script setup></script>
<style scoped>
.credit-section {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 讓標題與步驟置中 */
}

.credit-section .title {
  color: #ce1465;
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 48px;
}

.steps {
  max-width: 1000px; /* 限制最大寬度 */
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 水平置中 */
  align-items: center;
  gap: 40px; /* 元素間距 */
}

.steps .step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.apply-button {
  margin-top: 40px;
  background-color: #ebb211;
  font-size: 16px;
  color: #ffffff;
  padding: 16px 32px;
  text-decoration: none;
  border: none;
  border-radius: 32px;
}
</style>
