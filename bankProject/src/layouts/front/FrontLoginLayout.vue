<template>
  <div class="contain">
    <div class="login-container">
      <h2>登入</h2>
      <form @submit.prevent="doLogin">
        <div class="form-group">
          <label for="mIdentity">身分證</label>
          <input
            type="text"
            id="mIdentity"
            v-model="mIdentity"
            placeholder="輸入帳號"
            required
          />
          <label for="username">帳號</label>
          <input
            type="text"
            id="mAccount"
            v-model="mAccount"
            placeholder="輸入帳號"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            type="password"
            id="mPassword"
            v-model="mPassword"
            placeholder="輸入密碼"
            required
          />
        </div>
        <button type="submit" class="login-button">登入</button>
        <div class="register-link">還沒有帳號？<a href="#">註冊</a></div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { request } from "@/utils/FontAxiosUtil"; // 你剛才寫的 axios service
import { useMemberStore } from "@/stores/MemberStore";
import { ref } from "vue";
import router from "@/router/index";

const memberStore = useMemberStore();
const mAccount = ref("");
const mPassword = ref("");
const mIdentity = ref("");

const doLogin = async () => {
  try {
    const response = await request({
      url: "/auth/login",
      method: "POST",
      data: {
        mIdentity: mIdentity.value,
        mAccount: mAccount.value,
        mPassword: mPassword.value,
      },
    });
    console.log(response);

    console.log(memberStore);

    memberStore.login(
      response.mid,
      response.mname,
      response.midentity,
      response.mgender,
      response.maddress,
      response.mphone,
      response.memail,
      response.token
    );

    console.log(memberStore.mId);
    router.push("/MembersArea");
  } catch (error) {
    alert("登入失敗，請確認帳號密碼");
    console.error(error);
  }
};
</script>
<style scoped>
* {
  box-sizing: border-box;
}
.contain {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.login-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #45a049;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.register-link a {
  color: #4caf50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
