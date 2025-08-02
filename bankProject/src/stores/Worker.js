import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWorkerStore = defineStore(
  "WorkerStore",
  () => {
    const workerInfo = ref({
      isLoggedIn: false,
      wId:-1,
      wName:"",
      wAccount:"",
      wPassword:"",
      token: "",
    });

    // actions
    const login = (
      wId,
      wName,
      wAccount,
      wPassword,
      token
    ) => {
      workerInfo.value.isLoggedIn = true;
      workerInfo.value.wId = wId;
      workerInfo.value.wName = wName;
      workerInfo.value.wAccount = wAccount;
      workerInfo.value.wPassword = wPassword;
      workerInfo.value.token = token;
    };

    const logout = () => {
      memberInfo.value = {
        isLoggedIn: false,
        wId: -1,
        wName: "",
        wAccount: "",
        wPassword: "",
        token: ""
      };
    };

    // getters
    const isLoggedIn = computed(() => workerInfo.value.isLoggedIn);
    const wId = computed(() => workerInfo.value.wId);
    const wName = computed(() => workerInfo.value.wName);
    const wAccount = computed(() => workerInfo.value.wAccount);
    const wPassword = computed(() => workerInfo.value.wPassword);
    const token = computed(() => workerInfo.value.token);


    return {
      workerInfo,
      login,
      logout,
      isLoggedIn,
      wId,
      wName,
      wAccount,
      wPassword,
      token,
    };
  },
  {
    persist: {
      key: "WorkerStore",
      storage: localStorage,
      paths: ["workerInfo"], // 指定持久化的物件
    },
  }
);
