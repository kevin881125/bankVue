import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMemberStore = defineStore(
  "MemberStore",
  () => {
    const memberInfo = ref({
      isLoggedIn: false,
      token: "",
      memberName: "",
      memberPhoto: "",
      memberId: -1,
    });

    // actions
    const login = (jwtToken, memberName, memberPhoto, memberId) => {
      memberInfo.value.isLoggedIn = true;
      memberInfo.value.memberId = memberId;
      memberInfo.value.token = jwtToken;
      memberInfo.value.memberName = memberName;
      memberInfo.value.memberPhoto = memberPhoto;
    };

    const logout = () => {
      memberInfo.value = {
        isLoggedIn: false,
        token: "",
        memberName: "",
        memberPhoto: "",
        memberId: -1,
      };
    };

    // getters
    const isLoggedIn = computed(() => memberInfo.value.isLoggedIn);
    const memberName = computed(() => memberInfo.value.memberName);
    const token = computed(() => memberInfo.value.token);
    const memberPhoto = computed(() => memberInfo.value.memberPhoto);
    const memberId = computed(() => memberInfo.value.memberId);

    return {
      memberInfo,
      login,
      logout,
      isLoggedIn,
      memberName,
      token,
      memberPhoto,
      memberId,
    };
  },
  {
    persist: {
      key: "MemberStore",
      storage: localStorage,
      paths: ["memberInfo"], // 指定持久化的物件
    },
  }
);
