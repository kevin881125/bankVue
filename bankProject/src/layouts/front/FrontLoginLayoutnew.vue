<template>
  <div :class="['background', { blackout: blackout }]">
    <div :class="['outlay', { active: slide }]">
      <div :class="['container']">
        <div class="title">
          <div class="h1 fade-up">Welecome</div>
          <div class="h3 fade-up">最懂你的柚子銀行</div>

        </div>
          <div class="form fade-up">
            <div class="topbar">
              <h2>Login</h2>
            </div>
            <div class="form1">
              <div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mIdentityLogin">身分證字號</label>
                  <div
                    :class="[
                      'input',
                      { activecolor: mIdentityEmpty, shake: mIdentityEmpty },
                    ]"
                  >
                    <input
                      type="text"
                      id="mIdentityLogin"
                      v-model="mIdentity"
                      placeholder="輸入身分證"
                      maxlength="10"
                      @input="mIdentity = mIdentity.toUpperCase()"
                    />
                  </div>
                  <div class="warningtet">{{ mIdentityErrorMessage }}</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mAccountLogin">使用者帳號</label>

                  <div
                    :class="[
                      'input',
                      { activecolor: mAccountEmpty, shake: mAccountEmpty },
                    ]"
                  >
                    <input
                      type="text"
                      id="mAccountLogin"
                      v-model="mAccount"
                      placeholder="帳號英文+數字"
                    />
                  </div>
                  <div class="warningtet">{{ mAccountErrorMessage }}</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mPasswordLogin">使用者密碼</label>

                  <div
                    :class="[
                      'input',
                      { activecolor: mPasswordEmpty, shake: mPasswordEmpty },
                    ]"
                  >
                    <input
                      :type="showpassword ? 'password' : 'text'"
                      id="mPasswordLogin"
                      v-model="mPassword"
                      placeholder="密碼英文+數字"
                    /><button
                      type="button"
                      @click="showpassword = !showpassword"
                    >
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
                  <div class="warningtet">{{ errorMessage }}</div>
                </div>
                <div class="btns">
                  <button @click="doLogin" class="btn">登入</button>
                  <button @click="OneClickInput" class="btn">一鍵輸入</button>
                </div>
              </div>
            </div>
            <button class="forgetbtn" @click="forgetbtn">忘記帳號或密碼</button>
          </div>
        <div class="register">
          你還沒有加入會員嗎?<button @click="moveslide">立即註冊</button>
        </div>
        <button class="backindex" @click="backindex">返回首頁</button>
      </div>
    </div>
    <div :class="['outlay', { active: slide }]">
      <memberRegister @moveslideClick="moveslide"></memberRegister>
    </div>
  </div>

  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
</template>
<script setup>
import { request } from "@/utils/FontAxiosUtil";
import { useMemberStore } from "@/stores/MemberStore";
import { ref } from "vue";
import router from "@/router/index";

import memberRegister from "@/views/front/member/memberRegister.vue";

import ErrorMessage from "@/components/ErrorMessage.vue";


/*登入邏輯*/
const memberStore = useMemberStore();
const mAccount = ref("");
const mPassword = ref("");
const mIdentity = ref("");
const blackout = ref(false);
const showpassword = ref(true);
const errorMessage = ref("");
const mIdentityErrorMessage = ref("");
const mAccountErrorMessage = ref("");

const mIdentityEmpty = ref(false);
const mPasswordEmpty = ref(false);
const mAccountEmpty = ref(false);

const showError = ref(false);
const errorMsg = ref("");

const checkEmpty = () => {
  let check = true;
  if (mIdentity.value.trim() === "") {
    mIdentityEmpty.value = true;
    mIdentityErrorMessage.value = "身分證沒有填寫";
    check = false;
  }
  if (mAccount.value.trim() === "") {
    mAccountEmpty.value = true;
    mAccountErrorMessage.value = "帳號沒有填寫";
    check = false;
  }
  if (mPassword.value.trim() === "") {
    mPasswordEmpty.value = true;
    errorMessage.value = "密碼沒有填寫";
    check = false;
  }
  return check;
};
const checkclean = () => {
  mIdentityEmpty.value = false;
  mIdentityErrorMessage.value = "";
  mAccountEmpty.value = false;
  mAccountErrorMessage.value = "";
  mPasswordEmpty.value = false;
  errorMessage.value = "";
};

const openError = () => {
  mIdentityEmpty.value = true;
  mAccountEmpty.value = true;
  mPasswordEmpty.value = true;
};

const OneClickInput = () => {
  mAccount.value = "alice9898";
  mPassword.value = "alice9898";
  mIdentity.value = "H287196898";
};

const backindex = ()=>{
  router.push("/yuzubank/front");
}


const doLogin = async () => {
  checkclean();
  if (checkEmpty()) {
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
      await memberStore.login(
        response.mid,
        response.mname,
        response.midentity,
        response.mgender,
        response.maddress,
        response.mphone,
        response.memail,
        response.token,
        "http://localhost:8080" + response.mimage
      );

      console.log(memberStore.mId);
      router.push("/yuzubank/front");
    } catch (error) {
      errorMessage.value = error;
      console.error(error);

      openError();
    }
  }
};

//切換滑動

const slide = ref(false);

const moveslide = () => {
  slide.value = !slide.value;
  blackout.value = !blackout.value;
};

//忘記密碼
const forgetbtn = () => {
  router.push("/yuzubank/memberforget");
};
</script>

<style scoped>
* {
  position: relative;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.background {
  height: 100%;
  width: 100%;
  background-image: url("../../image/member/memberlogin2.png");
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
  transition: 0.8s;
}

.background.blackout {
  background-image: url("../../image/member/rbgc.png");
  background-position: -200px 0px;
  background-color: #010204;

}

.outlay {

  top: 0;
  width: 100%;
  min-height: 100%;
  margin-right: auto;
  margin-left: auto;
  transition: 0.5s;
}

.active {
  top: -100%;
}

.cc {
  background-color: #991212;
}

.container {
  top: 120px;
  width: 100%;
  height: 75%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.container1{
  width: 80%;
}

.logo-img {
  width: 500px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.right {
  width: 50%;
  height: 100%;
  border-radius: 30px;
  padding: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(235, 178, 17,0.4);
  margin-bottom: 40px;
}
.topbar span{
  font-size: 80px;
  color: #ebb211;
}
.topbar >h2{
  font-size: 48px;
  padding-top: 24px;
  padding-bottom: 24px;
  font-weight: 900;
  color: rgba(235, 178, 17,0.8);
}

input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
  font-size: 20px;
  color: rgb(255, 255, 255);
}
input::placeholder{
  color:rgba(255, 255, 255,0.5);
}

.input {
  display: flex;
  align-items: center;
  height: 60px;
  width: 80%;
  border: 1px solid rgba(255, 255, 255,0.8);
  border-radius: 50px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}
.input:hover{
   border-color:  rgb(255, 255, 255);
}

.inputbox {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  width:100%;
}
.activecolor{
  border-color: #de5858;
}
button {
  margin-left: auto;
  margin-right: auto;
  display: block;
}
.btns{
   margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
}

.btn {
  margin-top: 40px;
  height: 60px;
  width: 150px;
  border: 1px solid rgba(255, 255, 255,0.8);
  border-radius: 50px;
  color: rgba(255, 255, 255,0.8);

  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  font-weight: 700;
  font-size: 20px;
}

.btn:hover {
  background-color: #ebb211;
  color: #fff;
  transition: 0.5s;
  border:none;
}

.forgetbtn {
  margin-top: 20px;
  color: #ebb211;
  font-size: 16px;
  &:hover {
    color: #ebb211;
  }
}

h1 {
  font-size: 40px;
  font-weight: 500;
  color: white;
}

h3 {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 300;
  color: white;
}

h2 {
  color: #ebb211;
}

label {
  display: inline-block;
  width: 200px;
  margin-bottom: 8px;
  color: rgb(255, 255, 255);
  font-size: 20px;
 
}
span{
  display: inline-block;
   margin-left: 60px;
   
}

.warningtet {
  text-align: right;
  margin-right: auto;
  margin-left: auto;
  width: 70%;
  font-size: 16px;
  height: 15px;
  color: #de5858;
}

.form {
  position: absolute;
  left: 980px;
  top: 0px;
  z-index: 1;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);       /* 半透明白色背景 */
  backdrop-filter: blur(10px);               /* 模糊背景 */
  -webkit-backdrop-filter: blur(10px);       /* Safari 支援 */
  border-radius: 30px;                       /* 圓角 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 淡淡邊框讓層次更清楚 */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);  /* 陰影 */
  width: 600px;
  height: 700px;
}


.icon {
  margin-right: 8px;
  color: #ebb211;
}

.must {
  color: #de5858;
  font-size: 20px;
}

.register {
  position: absolute;
  top: 740px;
  left: 850px;
  display: flex;
  color:white;
  z-index: 10;
}

.register > button {
  margin-left: 5px;
  color: #ebb211;
}

.register > button:hover {
  color: #c4920a;
}

.backindex{
  position: absolute;
  right: -300px;
  top:-80px;
}

/*浮上動畫*/
.fade-up {
  opacity: 0;
  transform: translateY(20px); /* 從底下移動上來 */
  animation: fadeUp 0.6s ease-out forwards;
}
.title{
  position: absolute;
  top: 180px;
  left: 150px;
  text-align: center;
  
}
.title .h1{
  font-size: 120px;
  font-weight: 700;
  color: #ffffff;
  
}
.title .h3{
  font-size: 60px;
  font-weight: 700;
   color: #ffffff;
   margin: -24px;
}


@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/*搖晃動畫*/
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

.shake {
  animation: shake 0.6s ease-in-out;
}
</style>
