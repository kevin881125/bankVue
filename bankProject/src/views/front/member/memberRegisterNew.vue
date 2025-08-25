<template>
  <div :class="['container1']">
    <div class="main">
      <div class="topbar">
        <img src="../../../image/member/rigster.png" alt="" />
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
          <div class="error">{{ errorMessage[item.name] }}</div>
        </div>
        <div class="btnArea">
          <button type="submit" @click="submitForm" class="btn">註冊</button>
        </div>
      </div>
    </div>
  </div>
  <div class="register">
    我有加入了<button @click="moveslide">返回登入</button>
  </div>
</template>
<script setup>
import { request } from "@/utils/FontAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import { validateMember } from "@/utils/CheckMemberInformation";

const emit = defineEmits(["moveslideClick"]);

const moveslide = () => {
  emit("moveslideClick");
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

async function submitForm() {
  validateMember(form, fields);
  const data = await request({
    url: "/member/member",
    method: "POST",
    data: form,
  });
  moveslide();
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
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  top: 20px;
  padding: 10px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 5px solid #00a8b8;
}
.form {
  display: flex;
  flex-wrap: wrap;
}
.inputBox {
  width: 50%;
  padding: 10px 20px;
}
span {
  position: absolute;
  left: 8px;
}

input[type="text"] {
  all: unset;
  width: 100%;
  height: 100%;
  padding: 5px 20px;
  font-size: 20px;
}
select {
  width: 100%;
  height: 100%;
  text-align: center;
  text-align-last: center; /* Chrome / Edge / IE */
  -moz-text-align-last: center; /* Firefox */
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
  color: #aeaeae;
}

.error {
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
  width: 90%;
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
.btnArea {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
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
