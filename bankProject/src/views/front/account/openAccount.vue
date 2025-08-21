<template>
  <div class="page-wrap">
    <div class="open-layout">
      <!-- 左側步驟流程 -->
      <AppStepBar :activeStep="step" />

      <!-- 右側表單卡片 -->
      <main class="form-area">
        <div class="form-card">
          <div class="padded">
            <!-- 用 v-if / v-else-if 切換子頁 -->
            <Step1 v-if="step === 1" @next="step = 2" />
            <Step2 v-else-if="step === 2" @prev="step = 1" @next="step = 3" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import AppStepBar from "@/components/account/frontAccount/accountapplication/AppStepBar.vue";
import Step1 from "@/components/account/frontAccount/accountapplication/Step1.vue";
import Step2 from "@/components/account/frontAccount/accountapplication/Step2.vue";
import Step3 from "@/components/account/frontAccount/accountapplication/Step3.vue";

const step = ref(1);

// 全流程共用資料：父層集中管理，子層用 v-model:form 綁定
const form = reactive({
  // Step1
  idNo: "",
  phone: "",
  captcha: "",
  twTaxResident: false,
  noUsPerson: false,
  // Step2（先預留欄位）
  name: "",
  birthday: "",
  address: "",
  idFront: null,
  idBack: null,
  secondId: null,
  // Step3（確認頁用）
});

// 流程控制
function goStep(n) {
  step.value = n;
}
async function submitAll() {
  // TODO: 串接最後送出 API
  // await request({ url:'/account/apply', method:'POST', data: form })
  alert("已送出！");
}
</script>

<style scoped>
.page-wrap {
  --brand: #ebb211;
  --accent: #ce1465;
  --ink: #222626;
  --line: #e5e7eb;

  min-height: 100vh;
  background: linear-gradient(135deg, var(--ink) 0%, #333 100%);
  padding: 48px 24px;
  color: var(--line);
}

.open-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 32px;
}

.form-card {
  width: 90%;
  border-radius: 24px;
  background: #fff;
}
.padded {
  padding: 32px 40px 28px 40px;
}
</style>
