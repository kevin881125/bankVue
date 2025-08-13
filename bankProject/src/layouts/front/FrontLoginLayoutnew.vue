<template>
  <div class="background">
    <div :class="['outlay',{active:slide}]">
        <div :class="['container']">
          <div class="left">
            <h1>登入你的YuzuBank</h1>
            <h3>簡單存錢 簡單轉帳</h3>
            <img class="logo-img" src="../../image/member/log.png" alt="" />
          </div>
          <div class="right">
            <div class="form">
              <div class="topbar">
                <img src="../../image/member/logicon.png" alt="" />
                <h2>我要登入</h2>
              </div>
              <div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="">身分證字號</label>
                  <div class="input">
                    <input type="text" /><span
                      class="icon mdi mdi-eye-closed"
                    ></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="">使用者帳號</label>
                  <div class="input">
                    <input type="text" /><span
                      class="icon mdi mdi-eye-closed"
                    ></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <div class="inputbox">
                  <span class="must">*</span>
                  <label for="">使用者密碼</label>
                  <div class="input">
                    <input type="text" /><span class="icon mdi mdi-keyboard"></span>
                  </div>
                  <div class="warningtet">你有錯誤</div>
                </div>
                <button class="btn">登入</button>
                <button class="forgetbtn">忘記帳號或密碼</button>
              </div>
            </div>
            <div class="decorate"></div>
          </div>
          <div class="register">你還沒有加入會員嗎?<button @click="moveslide">立即註冊</button></div>
        </div>
    </div>
    <div :class="['outlay','cc',{active:slide}]">

    </div>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive } from "vue";

const slide = ref(false);

const moveslide = ()=>{
    slide.value = !slide.value
}

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
  background-image: url("../../image/member/background.png");
  background-position: 100px -80px;
  background-repeat: no-repeat;
  background-size: 80% auto;
  overflow: hidden;
}
.outlay{
  top: 0;
  width: 60%;
  height: 100%;
  margin-right: auto;
  margin-left: auto;
  transition: 0.5s;
}
.active{
    top: -100%;
}
.cc{
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
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 5px solid #00a8b8;
}
input {
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
  border-radius: 50px;
  margin-left: auto;
  margin-right: auto;
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
  margin-top: 80px;
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
.forgetbtn {
  margin-top: 20px;
  color: #02a9b9;
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
  top: 850px;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f4fbfc;
  border-radius: 50%;
  width: 1000px;
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
  top: 700px;
  left: 750px;
  display: flex;
}
.register > button {
  margin-left: 5px;
  color: #13aebd;
}
</style>
