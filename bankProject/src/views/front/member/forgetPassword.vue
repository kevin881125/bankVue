<template>
  <div class="container">
    <div class="decorate"></div>
    <div class="dog">
        <img src="../../../image/logo_white.svg" alt="">
    </div>
    <div class="title">
      <h1>忘記密碼</h1>
      <h3>YuzuBank幫你找回</h3>
    </div>
    <div class="under">
      <div class="form">
        <div class="inputbox">
          <span class="must">*</span>
          <label for="mIdentityLogin">輸入email</label>
          <div  :class="['input',{error:error}]" >
            <input
              type="text"
              id="mIdentityLogin"
                v-model="forgetPassword.email"
              required
            />
          </div>
          <div class="warningtet" >{{errotMessage}}</div>
        </div>

        <input type="text"  />
        <button class="btn" @click="submit">送出</button>

        <div class="decorate2"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { request } from "@/utils/FontAxiosUtil";

const forgetPassword = ref({
  email: "",
});

const errotMessage = ref(""
)
const error = ref(false);


const submit = async () => {
  console.log("我進來了");
  error.value = false;
 
    const data = await request({
      url: "/member/forgot-password",
      method: "POST",
      data: forgetPassword.value,
    });
    if(data==undefined){
      error.value = true
      errotMessage.value ="沒有找到email";
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
  /* background-image: url("../../../image/member/bg-productpage-upper-03.png");
  background-size: 200%;
  background-position: -1100px -500px; */
  height: 850px;
}
.decorate {
  width: 1200px;
  height: 800px;
  position: absolute;
  border-radius: 50%;
  background-color: #ebb521;
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
  width: 90%;
  height: 100%;
  padding: 10px 20px;
}
.input {
  display: flex;
  align-items: center;
  height: 50px;
  width: 100%;
  border: 1px solid gray;
  border-radius: 50px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
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

.btn {
  margin-top: 20px;


  height: 60px;
  width: 200px;
  border: 1px solid #EBB211;
  border-radius: 50px;
  color: #EBB211;
  background-color: #fff;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  font-weight: 700;
  z-index: 10;
  
}
.btn:hover {
  background-color: #EBB211;
  color: #fff;
  transition: 0.5s;
}

.must {
  color: #de5858;
}
.decorate2 {
  position: absolute;
  top: 500px;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff7dc;
  border-radius: 50%;
  width: 1200px;
  height: 500px;
}
.under{
    width: 100%;
}
.dog{
    position: absolute;
    top: 80px;
   left: 1000px;   
}
.dog img{
  width: 500px;
  
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
