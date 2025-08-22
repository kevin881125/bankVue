<template>
  <section class="done">
    <div class="done__icon">✓</div>
    <h2 class="done__title">申請已送出</h2>

    <p class="done__desc">
      我們已收到你的資料，將於
      <strong>5 個工作天</strong> 左右完成審核。
      <template v-if="email"
        >確認信已寄到 <strong>{{ email }}</strong
        >。</template
      >
    </p>

    <div class="done__summary">
      <div class="row">
        <span>申請編號</span>
        <code v-if="appId" @click="copy(appId)">{{ appId }}</code>
        <span v-else>—</span>
      </div>

      <div class="row"><span>狀態</span><b>已送出，審核中</b></div>
    </div>

    <ul class="next-steps" v-if="!approved && !needsMore">
      <li>審核時間約 5 個工作天，結果將以 Email通知。</li>
      <li>請勿重複送出申請，避免申請編號混淆。</li>
      <li>若需補件，將以 Email 告知補件內容與方式。</li>
      <li>若申請未通過，將以 Email 告知原因。</li>
      <li>若有疑問請聯繫客服：02-0000-0000。</li>
    </ul>

    <div class="actions">
      <RouterLink class="next-btn" to="/yuzubank/index">返回首頁</RouterLink>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  appId: { type: String, default: "" },
  email: { type: String, default: "" },
});

function copy(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
}
</script>

<style scoped>
.done {
  text-align: center;
  padding: 28px 12px;
}
.done__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf9f0;
  color: #2e7d32;
  font-size: 30px;
  font-weight: 900;
}
.done__title {
  font-size: 22px;
  margin: 12px 0 6px;
  color: var(--accent);
}
.done__desc {
  color: #6b7f95;
  margin: 0 0 12px;
}
.done__summary {
  max-width: 520px;
  margin: 14px auto;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafbfc;
}
.done__summary .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 2px;
  border-bottom: 1px dashed #e6e8ea;
  color: #6b7f95;
}
.done__summary .row:last-child {
  border-bottom: 0;
}
.done__summary code {
  background: #f0f3f6;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
}
.next-steps {
  max-width: 520px;
  margin: 10px auto 18px;
  text-align: left;
  color: #6b7f95;
}
.next-steps li {
  margin: 6px 0;
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  border-radius: 999px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  cursor: pointer;
  font-weight: 700;
}
.btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.btn.ghost {
  background: #fff;
  color: var(--ink);
}

.next-btn {
  min-width: 150px;
  border-radius: 999px;
  font-weight: 500;
  background: #fff;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 10px 20px;
  cursor: pointer;
}
.next-btn:disabled {
  cursor: not-allowed;
}
.next-btn:hover {
  background: var(--accent);
  color: #fff;
}
</style>
