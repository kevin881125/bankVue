import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMemberStore = defineStore(
  "MemberStore",
  () => {
    const memberInfo = ref({
      isLoggedIn: false,
      mId: -1,
      mName: "",
      mIdentity: "",
      mGender: "",
      mAddress: "",
      mPhone: "",
      mEmail: "",
      token: "",
      mImage:""
    });

    // actions
    const login = (
      mId,
      mName,
      mIdentity,
      mGender,
      mAddress,
      mPhone,
      mEmail,
      token,
      mImage
    ) => {
      memberInfo.value.isLoggedIn = true;
      memberInfo.value.mId = mId;
      memberInfo.value.mName = mName;
      memberInfo.value.mIdentity = mIdentity;
      memberInfo.value.mGender = mGender;
      memberInfo.value.mAddress = mAddress;
      memberInfo.value.mPhone = mPhone;
      memberInfo.value.mEmail = mEmail;
      memberInfo.value.token = token;
      memberInfo.value.mImage = mImage;
    };

    const logout = () => {
      memberInfo.value = {
        isLoggedIn: false,
        mId: -1,
        mName: "",
        mIdentity: "",
        mGender: "",
        mAddress: "",
        mPhone: "",
        mEmail: "",
        token: "",
        mImage:""
      };
    };

    // getters
    const isLoggedIn = computed(() => memberInfo.value.isLoggedIn);
    const mId = computed(() => memberInfo.value.mId);
    const mName = computed(() => memberInfo.value.mName);
    const mIdentity = computed(() => memberInfo.value.mIdentity);
    const mGender = computed(() => memberInfo.value.mGender);
    const mAddress = computed(() => memberInfo.value.mAddress);
    const mPhone = computed(() => memberInfo.value.mPhone);
    const mEmail = computed(() => memberInfo.value.mEmail);
    const token = computed(() => memberInfo.value.token);
    const mImage = computed(() => memberInfo.value.mImage);


    const setmImage=(mImage)=>{
      memberInfo.value.mImage = mImage;
    }
    const setmName=(name)=>{
      memberInfo.value.mName = name;
    }

    return {
      memberInfo,
      login,
      logout,
      isLoggedIn,
      mId,
      mName,
      mIdentity,
      mGender,
      mAddress,
      mPhone,
      token,
      mEmail,
      mImage,
      setmImage,
      setmName
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
