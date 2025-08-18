<template>
  <div class="account-home">
    <NoAccountHome v-if="!hasLogin" />
    <AccountOverview v-else />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import NoAccountHome from "@/components/account/frontAccount/NoAccountHome.vue";
import AccountOverview from "@/components/account/frontAccount/AccountOverview.vue";

const memberStore = useMemberStore();
const hasLogin = ref(false);

onMounted(() => {
  hasLogin.value = memberStore.isLoggedIn;
});

</script>
<style scoped></style>
