<template>
  <div :class="['container1']">
    <div class="main">
      <div class="form">
        <div class="topbar">
          <img src="../../../image/member/rigster.png" alt="" />
          <h2>註冊</h2>
        </div>
        <form @submit.prevent="doLogin">
          <div>
            <div class="inputbox">
              <span class="must">*</span>
              <label for="mIdentity">姓名</label>
              <div class="input">
                <input
                  type="text"
                  id="mIdentity"
                  v-model="mIdentity"
                  placeholder="輸入身分證"
                  required
                /><span class="icon mdi mdi-eye-closed"></span>
              </div>
              <div class="warningtet">身分證字號</div>
            </div>
            <div class="inputArea">
              <div class="left">
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mIdentity">身分證字號</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mIdentity"
                      v-model="mIdentity"
                      placeholder="輸入身分證"
                      required
                    /><span class="icon mdi mdi-eye-closed"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mAccount">使用者帳號</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mAccount"
                      v-model="mAccount"
                      placeholder="帳號英文+數字"
                      required
                    /><span class="icon mdi mdi-eye-closed"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mPassword">居住地址</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mPassword"
                      v-model="mPassword"
                      placeholder="密碼英文+數字"
                      required
                    /><span class="icon mdi mdi-keyboard"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mPassword">出生日</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mPassword"
                      v-model="mPassword"
                      placeholder="密碼英文+數字"
                      required
                    /><span class="icon mdi mdi-keyboard"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
              </div>
              <div class="right">
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="gender">使用者性別</label>
                  <div class="input">
                    <select id="gender" name="gender">
                      <option value="">請選擇</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mAccount">使用者密碼</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mAccount"
                      v-model="mAccount"
                      placeholder="帳號英文+數字"
                      required
                    /><span class="icon mdi mdi-eye-closed"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mPassword">使用者電話</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mPassword"
                      v-model="mPassword"
                      placeholder="密碼英文+數字"
                      required
                    /><span class="icon mdi mdi-keyboard"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="mPassword">使用者信箱</label>
                  <div class="input">
                    <input
                      type="text"
                      id="mPassword"
                      v-model="mPassword"
                      placeholder="密碼英文+數字"
                      required
                    /><span class="icon mdi mdi-keyboard"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
              </div>
            </div>
            <button type="submit" class="btn">註冊</button>
          </div>
        </form>
      </div>
      <div class="decorate"></div>
    </div>
    <div class="register">
      我有加入了<button @click="moveslide">返回登入</button>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["moveslideClick"]);

const moveslide = () => {
  emit("moveslideClick");
};
</script>
<style scoped>
* {
  position: relative;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.active {
  top: -100%;
}

.container1 {
  top: 50px;
  width: 100%;
  height: 75%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo-img {
  width: 500px;
  height: auto;
  display: block;
  margin: 0 auto;
}
.main {
  width: 100%;
  height: 100%;
  border-radius: 30px;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.left {
  width: 50%;
}
.right {
  width: 50%;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 5px solid #00a8b8;
}
.inputArea {
  display: flex;
}
input,select{
  border: none;
  background: none;
  outline: none;
  width: 90%;
  height: 100%;
  padding: 10px 20px;
}
.input {
  display: flex;
  align-items: center;
  height: 50px;
  width: 80%;
  border: 1px solid gray;
  border-radius: 10px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}
.inputbox {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  width: 80%;
}
.warningtet {
  text-align: right;
}
button {
  margin-left: auto;
  margin-right: auto;
  display: block;
}
.btn {
  margin-top: 10px;
  height: 60px;
  width: 200px;
  border: 1px solid #02a9b9;
  border-radius: 50px;
  color: #02a9b9;
  background-color: #fff;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  font-weight: 700;
}
.btn:hover {
  background-color: #02a9b9;
  color: #fff;
  transition: 0.5s;
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
  color: #13aebd;
}
label {
  display: inline-block;
  margin-bottom: 8px;
  color: #aeaeae;
}
.warningtet {
  margin-right: auto;
  margin-left: auto;
  width: 70%;
  font-size: 12px;
  color: #de5858;
}
.form {
  z-index: 1;
  overflow: hidden;
}
.decorate {
  position: absolute;
  top: 950px;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f4fbfc;
  border-radius: 50%;
  width: 1500px;
  height: 500px;
}
.icon {
  margin-right: 8px;
  color: #13aebd;
}
.must {
  color: #de5858;
}
.register {
  position: absolute;
  top: 820px;
  left: 900px;
  display: flex;
}
.register > button {
  margin-left: 5px;
  color: #13aebd;
}
.register > button:hover {
  color: #18dbec;
}
</style>
