import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWorkerStore = defineStore(
  "WorkerStore",
  () => {
    const workerInfo = ref({
      isLoggedIn: false,
      wId: -1,
      wName: "",
      wAccount: "",
      token: "",
      role:null
    });

    // actions
    const login = (wId, wName, wAccount, token,role) => {
      workerInfo.value.isLoggedIn = true;
      workerInfo.value.wId = wId;
      workerInfo.value.wName = wName;
      workerInfo.value.wAccount = wAccount;
      workerInfo.value.role = role;
      workerInfo.value.token = token;
    };

    const logout = () => {
      workerInfo.value = {
        isLoggedIn: false,
        wId: -1,
        wName: "",
        wAccount: "",
        token: "",
        role:null
      };
    };

    // getters
    const isLoggedIn = computed(() => workerInfo.value.isLoggedIn);
    const wId = computed(() => workerInfo.value.wId);
    const wName = computed(() => workerInfo.value.wName);
    const wAccount = computed(() => workerInfo.value.wAccount);
    const token = computed(() => workerInfo.value.token);
    const role = computed(() => workerInfo.value.role);

    return {
      workerInfo,
      login,
      logout,
      isLoggedIn,
      wId,
      wName,
      wAccount,
      token,
      role
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
