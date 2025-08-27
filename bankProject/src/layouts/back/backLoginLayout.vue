<template>
  <div class="contain">
    <div class="login-container">

      <img src="../../image/backLoginImage.png" alt="">
      <h2>登入帳號</h2>

        <div class="form-group">

          <input
            type="text"
            id="mAccount"
            v-model="wAccount"
            placeholder="帳號"
            required
          />
        </div>
        <div class="form-group">

          <input
            type="password"
            id="mPassword"
            v-model="wPassword"
            placeholder="密碼"
            required
          />
        </div>
        <button  @click="doLogin" class="login-button">登入</button>
 

    </div>
  </div>
    <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { useWorkerStore } from "@/stores/Worker";
import { ref ,onMounted, onBeforeUnmount} from "vue";
import router from "@/router/index";
import { usePermissionStore } from "@/stores/usePermissionStore";
import ErrorMessage from "@/components/ErrorMessage.vue";

const permissionStore = usePermissionStore();
const workerStore = useWorkerStore();
const wAccount = ref("");
const wPassword = ref("");
const showError = ref(false);
const errorMsg = ref("");

function handleGlobalEnter(event) {
  if (event.key === 'Enter') {
    doLogin();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalEnter);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalEnter);
});

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

    
    if (permissionStore.allowedPages.length > 0) {

      let name= permissionStore.allowedPages[0].name;
      // 跳轉到用戶的第一個可訪問頁面
      router.push("/yuzubank/backmain/" + name) ;// 強制刷新一次畫面（保底方案）
    
    } else {
      // 如果沒有權限頁面，重定向到登錄頁
      errorMsg.value = "您沒有可訪問的頁面，請聯繫管理員！";
      showError.value =true;
    
    }
  } catch (error) {
      errorMsg.value = error;
      showError.value =true;
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
  padding-top: 200px;
}

.login-container {
  padding: 30px;
  width: 100%;
  max-width: 500px;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 30px;
  background-color: #c4c4c417;


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
  width: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background-color: #f3f3f3;
}

.login-button {
  width: 300px;
  padding: 12px;
  background-color: #f8c22c;
  color: rgb(0, 0, 0);
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.login-button:hover {
  background-color: #e0aa14;
}


img{
width: 300px; 
height: auto;

}
h2{
  margin-top: 30px;
  font-size: 30px;
  margin-bottom: 10px;
}
</style>
