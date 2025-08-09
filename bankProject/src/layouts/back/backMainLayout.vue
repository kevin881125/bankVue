<template>
  <div class="container">
    <div class="leftbar">
      <div class="icon">
        <img
          style="width: 150px; height: 150px"
          src="../../image/logo_black.svg"
          alt=""
        />
      </div>
      <ul class="featurelist">
        <li>
          <router-link to="/backmain/member"
            ><span class="mdi mdi-account"></span>會員管理</router-link
          >
        </li>
        <li>
          <router-link to="/backmain/account">
            <span class="mdi mdi-piggy-bank"></span>帳戶管理</router-link
          >
        </li>
        <li>
          <router-link to="/backmain/accountapplication">
            <span class="mdi mdi-hand-coin"></span>帳戶申請管理</router-link
          >
        </li>
        <li>
          <router-link to="/backmain/creditCard">
            <span class="mdi mdi-credit-card"></span>信用卡管理</router-link
          >
        </li>
        <li>
          <router-link to="/backmain/loan">
            <span class="mdi mdi-cash"></span>貸款管理</router-link
          >
        </li>
        <li>
          <router-link to="/backmain/fund">
            <span class="mdi mdi-bank"></span>基金管理</router-link
          >
        </li>
      </ul>
    </div>
    <div class="rightArea">
      <div class="rightTop">
        <div class="rightTop-left"></div>
        <div class="rightTop-right">
          <div class="photo">
            <img src="" alt="" />
          </div>
          <div class="name">{{ wName }}:{{ wAccount }}</div>
          <button class="outbtn" @click="signOut">
            <span class="mdi mdi-logout"></span>
          </button>
        </div>
      </div>
      <div class="main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWorkerStore } from "@/stores/Worker";
import { ref } from "vue";
import router from "@/router/index";

const workerStore = useWorkerStore();

const wName = ref(workerStore.wName);
const wAccount = ref(workerStore.wAccount);

const signOut = () => {
  workerStore.logout();
  console.log(workerStore.wId);

  router.push("/backLogin");
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /*border: 1px solid #000;*/
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--white-color);
}
.leftbar {
  width: 250px;
  height: 100%;
  border-radius: 0 0 50px 0;
  background-color: var(--grey-color);
  border-radius: 20px 0 0 20px;
  box-shadow: -5px 0 3px rgba(0, 0, 0, 0.1);
}
.rightArea {
  width: calc(100% - 80px);
  height: 100%;
  display: flex;
  flex-direction: column;
}
.rightTop {
  height: 8%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rightTop-right {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
}

.mdi-logout {
  font-size: 50px;
}
.name {
  display: flex;
  align-items: center;
  font-size: 30px;
  padding: 0 20px;
}
.photo {
  width: 50px;
  height: 65%;
  border-radius: 50%;
  background-color: #616161;
  margin-right: 10px;
}
.title {
  color: var(--contrast-color);
  letter-spacing: 2px;
  font-size: 40px;
}

.main {
  height: calc(92% - 10px);
  width: 100%;
  padding: 10px;
  overflow: auto;
}
.icon {
  width: 100%;
  height: 20%;
  padding: 10px;
}
ul {
  margin-top: 20px;
}
li {
  width: 100%;
  height: 80px;

  list-style: none;
  &:hover {
    background-color: #f5f5f5;
    border-right: 10px solid orange;
  }
}
a {
  list-style: none;
  text-decoration: none;
  font-size: 20px;
  display: inline-block;
  width: 100%;
  height: 100%;
  padding-left: 50px;
  padding-top: 30px;
  font-weight: 300;
  color: rgb(0, 0, 0);
}
a > span {
  margin-right: 12px;
}
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
.outbtn:hover {
  color: orange;
}
</style>
