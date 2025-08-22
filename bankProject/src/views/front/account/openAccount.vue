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
            <Step2
              v-else-if="step === 2"
              @prev="step = 1"
              @next="handleStep2Next"
            />
            <Step3
              v-else-if="step === 3"
              :app-id="serverAppId"
              :email="serverEmail"
              @prev="step = 2"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppStepBar from "@/components/account/frontAccount/accountapplication/AppStepBar.vue";
import Step1 from "@/components/account/frontAccount/accountapplication/Step1.vue";
import Step2 from "@/components/account/frontAccount/accountapplication/Step2.vue";
import Step3 from "@/components/account/frontAccount/accountapplication/Step3.vue";
import { useMemberStore } from "@/stores/MemberStore";

const memberStore = useMemberStore();
const step = ref(1);
// 從 Step2 帶上來的資料
const serverAppId = ref("");
const serverEmail = memberStore.mEmail || ""; // 預設從會員資料中取 email

function handleStep2Next(payload) {
  // payload 來自 Step2 emit：{ appId, mEmail }
  serverAppId.value = payload?.appId || "";
  step.value = 3; // 再切到 Step3
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
