<template>
  <div :class="['container1']">
    <div class="main">
      <div class="topbar">
        <!-- <img src="../../../image/member/rigster.png" alt="" /> -->

        <span class="mdi mdi-account-plus"></span>
        <h2>註冊</h2>
      </div>
      <div class="form">
        <div class="inputBox" v-for="(item, index) in fields">
          <span>*</span><label :for="item.name">{{ item.ch }}</label>
          <div :class="['input', { error: item.error }]">
            <input
              v-if="item.type === 'text' || item.type === 'date'"
              :type="item.type"
              :id="item.name"
              v-model="form[item.name]"
              :placeholder="`輸入${item.ch}`"
              :maxlength="item.maxlength"
              @input="filterInput(item.name)"
            />
            <select
              v-else-if="item.type === 'select'"
              :id="item.name"
              v-model="form[item.name]"
            >
              <option disabled value="">請選擇{{ item.ch }}</option>
              <option v-for="(opt, i) in item.data" :key="i" :value="opt">
                {{ opt }}
              </option>
            </select>
          </div>
          <div :class="['error1', { error2: item.error }]">
            {{ errorMessage[item.name] }}
          </div>
        </div>
        <div class="btnArea">
          <button @click="submitForm" class="btn">註冊</button>
          <button @click="OneClickInput" class="btn">一鍵輸入</button>
        </div>
      </div>
    </div>
  </div>
  <div class="register">
    我有加入了<button @click="moveslide">返回登入</button>
  </div>
  <SuccessToast v-model="showToast" message="註冊已成功！" :duration="2000" />
  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
</template>
<script setup>
import { request } from "@/utils/FontAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import { validateMember } from "@/utils/CheckMemberInformation";
import SuccessToast from "@/components/successAnim.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const emit = defineEmits(["moveslideClick"]);
const showToast = ref(false);
const showError = ref(false);
const errorMsg = ref("");

const moveslide = () => {
  emit("moveslideClick");
  form.mName="";
  form.mIdentity="";
  form.mGender= "";
  form.mAccount= "";
  form.mPassword= "";
  form.mAddress= "";
  form.mPhone= "";
  form.mBirthday= null;
  form.mEmail= "";
  fields.value.forEach((f)=>{
    f.error=false;
  })


};

const filterInput = (field) => {
  let value = form[field];

  switch (field) {
    case "mAccount":
    case "mPassword":
      // 英文數字
      form[field] = value.replace(/[^a-zA-Z0-9]/g, "");
      break;
    case "mPhone":
      // 數字
      form[field] = value.replace(/\D/g, "");
      break;
    case "mIdentity":
      // 身分證英文數字
      form[field] = value.replace(/[^A-Z0-9]/g, "");
      break;
    case "mEmail":
      // 信箱：可以先過濾空白
      form[field] = value.replace(/\s/g, "");
      break;
    default:
      // 其他不過濾
      break;
  }
};

const form = reactive({
  mName: "",
  mIdentity: "",
  mGender: "",
  mAccount: "",
  mPassword: "",
  mAddress: "",
  mPhone: "",
  mBirthday: null,
  mEmail: "",
});

const OneClickInput = () => {
  form.mName = "陳晏慈";
  form.mIdentity = "H287196898";
  (form.mGender = "女"), (form.mAccount = "alice9898");
  form.mPassword = "alice9898";
  form.mAddress = "330桃園市桃園區中正路123號";
  form.mPhone = "0901234567";
  form.mBirthday = "2005-08-25";
  form.mEmail = "yuzubank202@gmail.com";
};

const errorMessage = reactive({
  mName: "",
  mIdentity: "",
  mGender: "",
  mAccount: "",
  mPassword: "",
  mAddress: "",
  mPhone: "",
  mBirthday: null,
  mEmail: "",
});

const fields = ref([
  { name: "mName", ch: "姓名", type: "text", maxlength: 5, error: false },
  {
    name: "mIdentity",
    ch: "身分證",
    type: "text",
    maxlength: 10,
    error: false,
  },
  {
    name: "mGender",
    ch: "性別",
    type: "select",
    data: ["男", "女"],
    error: false,
  },
  {
    name: "mAccount",
    ch: "帳號",
    type: "text",
    maxlength: 20,
    error: false,
  },
  {
    name: "mPassword",
    ch: "密碼",
    type: "text",
    maxlength: 20,
    error: false,
  },
  { name: "mAddress", ch: "地址", type: "text", maxlength: 25, error: false },
  {
    name: "mPhone",
    ch: "手機",
    type: "text",
    maxlength: 10,
    error: false,
  },
  { name: "mBirthday", ch: "生日", type: "date" },
  {
    name: "mEmail",
    ch: "信箱",
    type: "text",
    maxlength: 30,
    error: false,
  },
]);

const clearError = () => {
  for (let i = 0; i < fields.value.length; i++) {
    fields.value[i].error = false;
    fields.value[i].error = false;
    errorMessage[fields.value[i].name] = "";
  }
};

async function submitForm() {
  clearError();
  if (validateMember(form, fields, errorMessage)) {
    try {
      const data = await request({
        url: "/member/member",
        method: "POST",
        data: form,
      });
      if (data) {
        showToast.value = true;
        moveslide();
      }
    }catch (error){
      if(error==="身分證已註冊過"){
        fields.value[1].error = true;
      }
      if(error==="信箱已註冊過"){
        fields.value[8].error = true;
      }
      errorMsg.value = error;
      showError.value = true;
      
    }

  }
}
</script>
<style scoped>
* {
  position: relative;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.container1 {
  margin: auto;
  width: 70%;
  border-radius: 10px;
  top: 10px;
  padding: 10px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: center;

}
.topbar > span {
  font-size: 80px;
  color: #ebb211;
}
.topbar > h2 {
  font-size: 50px;
  color: #ebb211;
}
.form {
  background: rgba(255, 255, 255, 0.1);       /* 半透明白色背景 */
  backdrop-filter: blur(10px);               /* 模糊背景 */
  -webkit-backdrop-filter: blur(10px);       /* Safari 支援 */
  border-radius: 30px;                       /* 圓角 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 淡淡邊框讓層次更清楚 */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);  /* 陰影 */
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
}
.inputBox {
  width: 50%;
  padding: 10px 20px;
}
.inputBox > span {
  position: absolute;
  left: 8px;
}

input[type="text"] {
  all: unset;
  width: 100%;
  height: 100%;
  padding: 5px 20px;
  font-size: 20px;
  color: rgb(255, 255, 255);
}
select {
  width: 100%;
  height: 100%;
  text-align: center;
  text-align-last: center; /* Chrome / Edge / IE */
  -moz-text-align-last: center; /* Firefox */
  color: rgb(255, 255, 255);
}

/* select 的下拉選單 */
select option {
  width: 100%;
  height: 100%;
  text-align: center;
}

/* date */
input[type="date"] {
  width: 100%;
  height: 100%;
  text-align: center; /* 讓輸入框內的文字置中 */
  color: rgb(255, 255, 255);
}

.input {
  border-radius: 50px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-top: 5px;
  border: 1px solid gray;
}
label {
  font-size: 20px;
  color: rgb(255, 255, 255);
}
.error1 {
  height: 20px;
}
.error2 {
  text-align: right;
  height: 20px;
  color: #de5858;
}
span {
  color: #de5858;
}

.warningtet {
  margin-right: auto;
  margin-left: auto;
  width: 70%;
  font-size: 12px;
  color: hsl(0, 67%, 61%);
}
.btn {
  margin-top: 10px;
  height: 60px;
  width: 40%;
  border: 1px solid #fff;
  border-radius: 50px;
  color: #fff;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  font-weight: 700;
}
.btn:hover {
  background-color: #ebb211;
  color: #fff;
  border: none;
  transition: 0.5s;
}
.btnArea {
  width: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.register {
  position: absolute;
  top: 880px;
  left: 900px;
  display: flex;
  color: white;
}
.register > button {
  margin-left: 5px;
  color: #ebb211;
}
.register > button:hover {
  color: #f7cc58;
}

/*錯誤動畫*/
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
