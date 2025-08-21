<template>
  <!-- 左側步驟流程 -->
  <aside class="steps">
    <ol class="step-list">
      <li class="step active">
        <div class="icon">
          <span class="mdi mdi-cellphone-check step-icon"></span>
        </div>
        <div class="text">
          <div class="title">嗨，第一次見面</div>
          <div class="bold">1. 綁定手機號碼</div>
        </div>
      </li>
      <li class="step">
        <div class="icon">
          <span class="mdi mdi-image-multiple step-icon"></span>
        </div>
        <div class="text">
          <div class="muted">準備好，亮出證件</div>
          <div class="bold">2. 填寫開戶資料</div>
        </div>
      </li>
      <li class="step">
        <div class="icon">
          <span
            class="mdi mdi-file-document-arrow-right-outline step-icon"
          ></span>
        </div>
        <div class="text">
          <div class="muted">送出審核申請</div>
          <div class="bold">3. 完成開戶申請</div>
        </div>
      </li>
    </ol>
  </aside>
</template>
<script setup>

const props = defineProps({ activeStep: { type: Number, default: 1 } })
</script>
<style scoped></style>
