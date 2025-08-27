<template>
  <div class="bgc">
    <div class="container">
      <div class="topbar">
        <div class="Headshot">
          <img :src="topImage" alt="" />
          <button @click="toggleForm">
            <span class="mdi mdi-pencil"></span>
          </button>
          <h1>你好,{{originname}}</h1>
        </div>
        <div class="total">
          <div class="all">
            <div class="title">淨資產</div>
            <div class="number">TWD 83415</div>
          </div>
          <div class="hh"></div>
          <div class="down">
            <div class="assets">
              <div class="title">資產</div>
              <div class="number">TWD 83415</div>
            </div>
            <div class="cc"></div>
            <div class="dept">
              <div class="title">信用卡與貸款</div>
              <div class="number">TWD 83415</div>
            </div>
          </div>
        </div>
      </div>
      <div class="totalAssets">
        <div class="assetGraphics">
          <DoughnutChart
            :labels="['帳戶', '基金']"
            :values="[12, 19]"
            centerText="總計 38"
          />
        </div>
        <div class="debtGraphic">
          <DoughnutChart
            :labels="['信用卡', '貸款']"
            :values="[12, 19]"
            centerText="總計 38"
          />
        </div>
      </div>

      <transition name="slide-down"  @after-enter="scrollToForm">
        <div class="PersonalInf" ref="formRef" v-if="showForm">
          <form @submit.prevent="submitForm">
            <h1>個人資料修改</h1>
            <div class="top">
              <div class="left">
                <img :src="memberdetail.mImage" alt="" />
                <button @click="$refs.fileInput.click()" v-if="!isReadonly">
                  <span class="mdi mdi-camera"></span>
                </button>
                <input  style="display: none" type="file" @change="onFileChange" ref="fileInput" accept="image/*" />
              </div>
              <div class="right">
                <div class="inputbox">
                  <div class="text">編號:{{ memberdetail.mId }}</div>

                  <div class="text">身分證:{{ memberdetail.mIdentity }}</div>
                </div>
              </div>
            </div>
            <div  class="inputbox"  >
              <span class="must">*</span>
              <label for="mName">姓名</label>
              <div :class="['input',{error:errors.mName}]">
                <input
                  type="text"
                  id="mName"
                  v-model="memberdetail.mName"
                  placeholder="輸入姓名"
                  maxlength = "5"
                  :readonly="isReadonly"
                  
                />
              </div>
              <div :class="[{ warningtet: errors.mName }]">{{errorMessage.mName}}</div>
            </div>

            <div class="inputbox">
              <span class="must">*</span>
              <label for="mAccount">帳號</label>
              <div :class="['input',{error:errors.mAccount}]">
                <input
                  type="text"
                  id="mAccount"
                  v-model="memberdetail.mAccount"
                  placeholder="帳號英文+數字"
                  :readonly="isReadonly"
                  
                />
              </div>
                <div :class="[{warningtet:errors.mAccount}]">{{errorMessage.mAccount}}</div>
            </div>
            <div class="inputbox">
              <span class="must">*</span>
              <label for="mPassword">密碼</label>
              <div :class="['input',{error:errors.mPassword}]" >
                <input
                  type="text"
                  id="mPassword"
                  v-model="memberdetail.mPassword"
                  placeholder="帳號英文+數字"
                  :readonly="isReadonly"
                
                />
              </div>
               <div :class="[{warningtet:errors.mPassword}]">{{errorMessage.mPassword}}</div>
            </div>
            <div class="inputbox" >
              <span class="must">*</span>
              <label for="mPhone">電話</label>
              <div :class="['input',{error:errors.mPhone}]">
                <input
                  type="text"
                  id="mPhone"
                  v-model="memberdetail.mPhone"
                  placeholder="密碼英文+數字"
                  :readonly="isReadonly"
          
                />
              </div>
             <div :class="[{warningtet:errors.mPhone}]">{{errorMessage.mPhone}}</div>
            </div>
            <div class="inputbox">
              <span class="must">*</span>
              <label for="mEmail">信箱</label>
              <div :class="['input',{error:errors.mEmail}]">
                <input
                  type="text"
                  id="mEmail"
                  v-model="memberdetail.mEmail"
                  placeholder="密碼英文+數字"
                  :readonly="isReadonly"
             
                />
              </div>
               <div :class="[{warningtet:errors.mEmail}]">{{errorMessage.mEmail}}</div>
            </div>
            <div class="inputbox">
              <span class="must">*</span>
              <label for="mAddress">居住地址</label>
              <div :class="['input',{error:errors.mAddress}]">
                <input
                  type="text"
                  id="mAddress"
                  v-model="memberdetail.mAddress"
                  placeholder="密碼英文+數字"
                  :readonly="isReadonly"
                
                />
              </div>
              <div :class="[{warningtet:errors.mAddress}]">{{errorMessage.mAddress}}</div>
            </div>
            <div class="inputbox">
              <span class="must">*</span>
              <label for="mBirthday">出生日</label>
              <div :class="['input',{error:errors.mBirthday}]">
                <input
                  type="date"
                  id="mBirthday"
                  v-model="memberdetail.mBirthday"
                  placeholder="密碼英文+數字"
                  :readonly="isReadonly"
                  
                />
              </div>
                 <div :class="[{warningtet:errors.mBirthday}]">{{errorMessage.mBirthday}}</div>
            </div>

            <div class="inputbox">
              <span class="must">*</span>
              <label for="mGender">性別</label>
              <div :class="['input',{error:errors.mGender}]" >
                <select
                  id="mGender"
                  name="gender"
                  v-model="memberdetail.mGender"
                  :readonly="isReadonly"
                >
                  <option value="">請選擇</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
                
              </div>
                 <div :class="[{warningtet:errors.mGender}]">{{errorMessage.mGender}}</div>
              <div class="btns">
                <button type="submit" class="btn" @click="toggleForm">
                  取消
                </button>
                <button type="submit" v-if="!isReadonly" class="btn" @click="editok">
                  確定修改
                </button>
                  <button type="submit"  v-if="isReadonly" class="btn" @click="isReadonly=false">
                  編輯
                </button>
                <SuccessAnim
                  v-model="showOK"
                  message="修改成功"
                  :duration="1400"
                />
              </div>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, nextTick } from "vue";
import { useMemberStore } from "@/stores/MemberStore";
import { request } from "@/utils/FontAxiosUtil";
import SuccessAnim from "@/components/successAnim.vue";
import DoughnutChart from "@/components/member/DoughnutChart.vue";
import { validateMember2 } from "@/utils/CheckMemberInformation";
const memberStore = useMemberStore();
const showOK = ref(false);
const mImage =ref({});
const topImage = ref();
const formData = new FormData();
const originname = ref("");

const isReadonly = ref(true);

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
const errors = ref({
  mName: false,
  mIdentity: false,
  mGender: false,
  mAccount: false,
  mPassword:false,
  mAddress: false,
  mPhone: false,
  mBirthday: false,
  mEmail: false,
})
const memberdetail = ref({
  mId: null,
  mName: "",
  mIdentity: "",
  mGender: "",
  mAccount: "",
  mPassword: "",
  mAddress: "",
  mPhone: "",
  mBirthday: null,
  mEmail: "",
  creation: null,
  mState: null,
  mImage: "",
});
const getdata = async()=>{
  console.log("有近來去拿資料");
  
  const data = await request({
    url: "/member/" + memberStore.mId,
    method: "GET",
  });
   memberdetail.value = data;
  memberdetail.value.mImage ="http://localhost:8080" + memberdetail.value.mImage;
  originname.value = structuredClone( memberdetail.value.mName)
   topImage.value = memberdetail.value.mImage;
}

onMounted(
  getdata
 );


const editok = async () => {
if(validateMember2(memberdetail,errors,errorMessage)){
  isReadonly.value = true;
  if(formData.has("file")){
    const img = await request({
    url: "/member/upload-mimage",
    method: "POST",
    data:formData
  });
  console.log(img);
  
  memberdetail.value.mImage =img["新增成功路徑為"];
  
  }else{
    memberdetail.value.mImage = topImage.value.slice(21);
  }
  const data = await request({
    url: "/member/" + memberdetail.value.mId,
    method: "PUT",
    data: memberdetail.value,
  });
  data.mBirthday = data.mBirthday.slice(0, 10);
  data.creation = data.creation.slice(0, 10);
  memberdetail.value = data;
    memberdetail.value.mImage ="http://localhost:8080" + memberdetail.value.mImage;
    memberStore.setmImage(memberdetail.value.mImage);
    memberStore.setmName(memberdetail.value.mName);
  originname.value = structuredClone( memberdetail.value.mName)
   topImage.value = memberdetail.value.mImage;
  showOK.value = true;

}

};

/*圖片上傳*/
const onFileChange = (e) => {
  const file = e.target.files[0];
  console.log("檔案在這裡" + file);

  mImage.value = file;
  memberdetail.value.mImage = URL.createObjectURL(file);
  console.log("檔案"+mImage.value);
  
  formData.set("file", mImage.value);
};

const subm = async () => {
  console.log(formData);
  const data = await request({
    url: "/member/upload-mimage",
    method: "POST",
    data: formData,
  });
  showpictrue.value = "http://localhost:8080" + data["新增成功路徑為"];
  console.log(showpictrue.value);
};
/*切換動畫*/
const showForm = ref(false);
const formRef = ref(null);

const toggleForm = async () => {
  showForm.value = !showForm.value;
isReadonly.value = true;
  if (showForm.value) {

    // 等表單渲染完成再滾動
    await nextTick();

  }else {
    // ❗這裡才是真正觸發還原的時機
    await getdata();  // 重新撈取資料 → 蓋掉被更動的 memberdetail
  }

};
const scrollToForm = () => {
  const offset = 100;
  const top = formRef.value.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
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
.bgc {
  width: 100%;
  background-image: url("../../../image/member/f1.jpg"), url();
  background-position: -210px -380px;
  background-size: 120%;
  display: flex;
  background-color: #fafafa;
  justify-content: center;
}
.container {
  min-width: 1280px;
  margin-top: 200px;
}

/*-----------------------上--------------------*/
.topbar {
  width: 100%;
  height: 150px;
  background-color: #fff;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.Headshot {
  width: 30%;
  display: flex;
  align-items: center;
  padding: 5px;
}
.Headshot > img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin-right: 50px;
}
.Headshot > button {
  position: absolute;
  width: 30px;
  height: 30px;
  top: 75%;
  left: 25%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(211, 211, 211, 0.8);
  &:hover {
    background-color: rgba(211, 211, 211, 1);
  }
}
.total {
  width: 66%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.total > .down {
  display: flex;
}
.assets {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
.dept {
  width: 50%;
  display: flex;
  justify-content: space-between;
}
.all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  font-size: 20px;
  border-left: 5px solid #EBB211;
  padding-left: 10px;
}
.number {
  text-align: right;
  font-size: 20px;
}
.hh {
  margin-bottom: 10px;
  width: 99%;
  height: 1px;
  margin-right: auto;
  margin-left: auto;
  background-color: #dbd9d9;
}
.cc {
  height: 100%;
  width: 1px;
  background-color: #dbd9d9;
  margin-right: 10px;
  margin-left: 10px;
}
/*-----------------------中--------------------*/

.totalAssets {
  width: 100%;
  height: 350px;
  background-color: #fff;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
}
.assetGraphics {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.assetGraphics > .graphics {
  width: 200px;
  height: 200px;
  background-color: #cf0000;
  border-radius: 50%;
  margin-right: 50px;
}
.assetGraphics > .illustrate {
}

.debtGraphic {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
/*-----------------------下--------------------*/
.PersonalInf {
  width: 100%;
  background-color: #fff;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
input,
select {
  border: none;
  background: none;
  outline: none;
  width: 100%;
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

  overflow: hidden;
}
.inputbox {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}
label {
  display: inline-block;
  margin-bottom: 8px;
  color: #aeaeae;
}
.warningtet {
  text-align: right;
  margin-right: auto;
  margin-left: auto;
  font-size: 12px;
  color: #de5858;
}
form {
  width: 70%;
}
.form {
  z-index: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  width: 70%;
}

.must {
  color: #de5858;
}
.left {
  width: 50%;
}
.right {
  width: 50%;
}
.left > img {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  margin-right: 50px;
}
.top {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.left > button {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 85%;
  left: 48%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(211, 211, 211, 0.8);
  &:hover {
    background-color: rgba(211, 211, 211, 1);
  }
}
.right label {
  font-size: 24px;
  border-left: 5px solid #EBB211;
  padding-left: 10px;
}
.text {
  font-size: 32px;
  border-left: 5px solid #EBB211;
  padding-left: 10px;
}
.text:first-child {
  margin-bottom: 20px;
}
.btns {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
}
.btns > button {
  width: 300px;
  height: 80px;
  font-size: 20px;
  font-weight: 700;
  border: 1px solid #EBB211;
  border-radius: 50px;
  color: #EBB211;
  transition: 0.1s;
  &:hover {
    background-color: #EBB211;
    color: #fff;
  }
  &:active {
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  }
}

/*表單動畫*/
.form-container {
  overflow: hidden; /* 保證動畫不外溢 */
}

/* slide-down 動畫 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 2000px; /* 根據表單高度調整 */
  opacity: 1;
}
h1 {
  text-align: center;
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
