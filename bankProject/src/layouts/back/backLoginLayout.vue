<template>
  <div class="contain">
    <div class="login-container">
      <h2>登入</h2>
      <form @submit.prevent="doLogin">
        <div class="form-group">
          <label for="username">帳號</label>
          <input
            type="text"
            id="mAccount"
            v-model="wAccount"
            placeholder="輸入帳號"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input
            type="password"
            id="mPassword"
            v-model="wPassword"
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
import { request } from "@/utils/BackAxiosUtil";
import { useWorkerStore } from "@/stores/Worker";
import { ref } from "vue";
import router from "@/router/index";
import { usePermissionStore } from "@/stores/usePermissionStore";

const permissionStore = usePermissionStore();
const workerStore = useWorkerStore();
const wAccount = ref("");
const wPassword = ref("");

const doLogin = async () => {
  try {
    const response = await request({
      url: "/auth/backlogin",
      method: "POST",
      data: {
        mAccount: wAccount.value,
        mPassword: wPassword.value,
      },
    });

    workerStore.login(
      response.wid,
      response.wname,
      response.waccount,
      response.token,
      response.role
    );
    const response2 = await request({
      url: "/api/roles/pages",
      method: "GET",
    });
    permissionStore.setPageMap(response2);
   router.push("/yuzubank/backmain/"+permissionStore.allowedPages[0].name);
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
