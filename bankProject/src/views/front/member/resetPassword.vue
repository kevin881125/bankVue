<template>
  <div class="container">
    <div class="decorate"></div>
    <div class="dog">
      <img src="../../../image/member/img-kv-idpw.png" alt="" />
    </div>
    <div class="title">
      <h1>重設密碼</h1>
      <h3>YuzuBank幫你重新開啟</h3>
    </div>
    <div class="under">
      <div class="form">
        <div class="inputbox">
          <span class="must">*</span>
          <label for="mIdentityLogin">重新設定密碼</label>
          <div :class="['input', { error: error }]">
            <input
              :type="showpassword ? 'password' : 'text'"
              id="mIdentityLogin"
              v-model="password.password"
              required
            />
            <button type="button" @click="showpassword = !showpassword">
              <span
                :class="[
                  'icon mdi',
                  {
                    'mdi-eye-off-outline': showpassword,
                    'mdi-eye-outline': !showpassword,
                  },
                ]"
              ></span>
            </button>
          </div>
        </div>
        <div class="inputbox">
          <span class="must">*</span>
          <label for="mIdentityLogin">再輸入一次密碼</label>
          <div :class="['input', { error: error }]">
            <input
              :type="showpassword ? 'password' : 'text'"
              id="mIdentityLogin2"
              v-model="password.checkpassword"
              required
            /><button type="button" @click="showpassword = !showpassword">
              <span
                :class="[
                  'icon mdi',
                  {
                    'mdi-eye-off-outline': showpassword,
                    'mdi-eye-outline': !showpassword,
                  },
                ]"
              ></span>
            </button>
          </div>
          <div class="warningtet">{{ message }}</div>
        </div>
        <div class="btns">
          <button class="btn" @click="submit">確認送出</button>
          <button class="btn" @click="inputdate">一鍵輸入</button>
        </div>

        <div class="decorate2"></div>
      </div>
    </div>
  </div>
  <SuccessAnim v-model="showOK" message="重設成功" :duration="1400" />
</template>
<script setup>
import { useRoute } from "vue-router";
import { request } from "@/utils/FontAxiosUtil";
import { ref } from "vue";
import router from "@/router/index";
import SuccessAnim from "@/components/successAnim.vue";

const showpassword = ref(true);
const showOK = ref(false);
const password = ref({
  password: "",
  checkpassword: "",
});
const data = ref({
  password: "",
  token: "",
});

const inputdate = () => {
  password.value.password = "alice98981";
  password.value.checkpassword = "alice98981";
};

const error = ref(false);

const message = ref("");
const route = useRoute();
const token = route.query.token;

const submit = async () => {
  error.value = false;
  if (!token) {
    message.value = "Token 不存在或連結無效";
    return;
  }

  if (password.value.password !== password.value.checkpassword) {
    message.value = "兩次輸入的密碼不一致";
    error.value = true;
    return;
  }
  data.value.password = password.value.password;
  data.value.token = token;
  try {
    const res = await request({
      url: "/member/reset-password",
      method: "POST",
      data: data.value,
    });

    message.value = "密碼重設成功！即將跳轉登入頁";
    showOK.value = true;
    setTimeout(() => {
      router.push("/yuzubank/frontLogin");
    }, 2000);
  } catch (err) {
    message.value = "重設失敗，請確認連結是否有效或已過期";
    error.value = true;
  }
};
</script>
<style scoped>
* {
  position: relative;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  /*border: 1px solid #000;*/
}
.container {
  width: 100%;
  background-image: url("../../../image/member/bg-productpage-upper-03.png");
  background-size: 200%;
  background-position: -1000px -500px;
}
.decorate {
  width: 1200px;
  height: 800px;
  position: absolute;
  border-radius: 50%;
  background-color: #13aebd;
  top: -500px;
  left: -100px;
  background-image: url("../../../image/member/img-banner-star@2x.png");
  background-size: 50%;
  background-position: 300px 550px;
}

.title {
  padding-top: 80px;
  padding-left: 380px;
}
h1 {
  font-size: 60px;
  margin-bottom: 20px;
  color: #fff;
  font-weight: 500;
}
h3 {
  font-size: 24px;
  color: #fff;
  font-weight: 300;
}

/*表單*/
.form {
  margin-bottom: 100px;
  width: 600px;
  z-index: 1;
  overflow: hidden;
  border-radius: 30px;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  margin-top: 100px;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
input {
  border: none;
  background: none;
  outline: none;
  padding: 0;
  width: 90%;
  height: 100%;
}
.input {
  display: flex;
  align-items: center;
  height: 60px;
  width: 100%;
  border: 1px solid gray;
  border-radius: 50px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  padding: 0px 20px;
}
.inputbox {
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
}

label {
  display: inline-block;
  margin-bottom: 8px;
  color: #aeaeae;
}
.warningtet {
  text-align: right;
  font-size: 12px;
  color: #de5858;
}

.btns {
  width: 88%;
  display: flex;
  justify-content: space-around;
}
.btn {
  margin-top: 50px;
  height: 60px;
  width: 200px;
  border: 1px solid #02a9b9;
  border-radius: 50px;
  color: #02a9b9;
  background-color: #fff;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  font-weight: 700;
  z-index: 10;
}
.btn:hover {
  background-color: #02a9b9;
  color: #fff;
  transition: 0.5s;
}

.must {
  color: #de5858;
}
.decorate2 {
  position: absolute;
  top: 600px;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f4fbfc;
  border-radius: 50%;
  width: 1200px;
  height: 500px;
}
.under {
  width: 100%;
}
.dog {
  position: absolute;
  top: 120px;
  left: 1000px;
}
button > span {
  font-size: 20px;
  color: #ebb211;
}

.input.error {
  border-color: #de5858;
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(-5px);
  }
  20% {
    transform: translateX(5px);
  }
  30% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  60% {
    transform: translateX(5px);
  }
  70% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
  90% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
