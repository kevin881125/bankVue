<template>
  <div class="search">
    <div class="searchbar">
      <label for="state">身分證</label>
      <input
        class="identity serchbarinput"
        v-model="condition.identity"
        placeholder="最多10個字"
        maxlength="10"
      />
      <label for="state">姓名</label>
      <input
        class="name serchbarinput"
        v-model="condition.name"
       
      />
      <label for="state">狀態：</label>
      <select v-model="condition.state" id="state" class="serchbarinput">
        <option disabled value="">請選擇</option>
        <option v-for="(label, key) in statedata" :value="label">
          {{ key }}
        </option>
      </select>
      <label for="birthday">出生日期：</label>
      <input
        type="date"
        v-model="condition.birthday"
        id="birthday"
        class="serchbarinput"
      />
      <label for="date">起始日期：</label>
      <input
        type="date"
        v-model="condition.startDate"
        id="startDate"
        class="serchbarinput"
      />
      <label for="date">結束日期：</label>
      <input
        type="date"
        v-model="condition.endDate"
        id="endDate"
        class="serchbarinput"
      />
      <button class="btn btnborder" @click="serch">查詢</button>
      <button class="btn btnborder1" @click="()=>{shownew = true;serch();} ">新增</button>
      <button class="btn btnborder2" @click="clean">清除</button>
    </div>
  </div>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">編號</th>
          <th style="width: 12%;">名子</th>
          <th style="width: 8%;">身分證</th>
          <th style="width: 5%;">性別</th>
          <th style="width: 12%;">出生</th>
          <th style="width: 12%;">電話</th>
          <th style="width: 20%;">信箱</th>
          <th style="width: 12%;">創辦日期</th>
          <th >狀態</th>
          <th >查看</th>
          <th >修改</th>
        </tr>
      </thead>
      <memberRow
        v-for="m in members"
        :member="m"
        @click="openModal"
        @edit="edit"
      ></memberRow>
    </table>
  </div>
  <!-- 查看詳細資料-->
  <div class="modal" v-if="showModal">
    <div class="modal-content" v-if="!isEditing">
      <h3>詳細資料</h3>
      <div class="detail">
        <p>編號:</p>
        <p>{{ memberdetail.mId }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>姓名:</p>
        <p>{{ memberdetail.mName }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>身分證:</p>
        <p>{{ memberdetail.mIdentity }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>性別:</p>
        <p>{{ memberdetail.mGender }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>帳號:</p>
        <p>{{ memberdetail.mAccount }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>密碼:</p>
        <p>{{ memberdetail.mPassword }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>地址:</p>
        <p>{{ memberdetail.mAddress }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>電話:</p>
        <p>{{ memberdetail.mPhone }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>生日:</p>
        <p>{{ memberdetail.mBirthday }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>信箱:</p>
        <p>{{ memberdetail.mEmail }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>創建日期:</p>
        <p>{{ memberdetail.creation }}</p>
      </div>
      <hr />
      <div class="detail">
        <p>狀態:</p>
        <p :class="memberdetail.mState === 0 ? 'disabled-text' : ''">
          {{ memberdetail.mState === 1 ? "正常" : "停用" }}
        </p>
      </div>
      <hr />
      <div class="detail">
        <button @click="showModal = false">關閉</button>
        <button @click="edit2">編輯</button>
      </div>
    </div>

    <div class="modal-content" v-else>
      <h3>修改資料</h3>
      <div class="detail">
        <p>編號:</p>
        <p>{{ memberdetail.mId }}</p>
      </div>
      <div class="detail">
        <p>姓名:</p>
        <p><input type="text" v-model="memberdetail.mName" /></p>
      </div>
      <div class="detail">
        <p>身分證:</p>
        <p>{{ memberdetail.mIdentity }}</p>
      </div>
      <div class="detail">
        <p>性別:</p>
        <p>
          <select id="gender" v-model="memberdetail.mGender">
            <option value="">請選擇</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </p>
      </div>
      <div class="detail">
        <p>帳號:</p>
        <p><input type="text" v-model="memberdetail.mAccount" /></p>
      </div>
      <div class="detail">
        <p>密碼:</p>
        <p><input type="text" v-model="memberdetail.mPassword" /></p>
      </div>
      <div class="detail">
        <p>地址:</p>
        <p><input type="text" v-model="memberdetail.mAddress" /></p>
      </div>
      <div class="detail">
        <p>電話:</p>
        <p><input type="text" v-model="memberdetail.mPhone" /></p>
      </div>

      <div class="detail">
        <p>生日:</p>
        <p><input type="date" v-model="memberdetail.mBirthday" /></p>
      </div>
      <div class="detail">
        <p>信箱:</p>
        <p><input type="text" v-model="memberdetail.mEmail" /></p>
      </div>
      <div class="detail">
        <p>創建日期:</p>
        <p>{{ memberdetail.creation }}</p>
      </div>
      <div class="detail">
        <p>狀態:</p>
        <p>
          <select v-model="memberdetail.mState" id="state" class="serchbarinput">
            <option disabled value="">請選擇</option>
            <option v-for="(label, key) in statedata" :value="label">
              {{ key }}
            </option>
          </select>
        </p>
      </div>
      <div class="detail">
        <button @click="showModal = false">關閉</button>
        <button @click="editok()">確認更改</button>
      </div>
    </div>
  </div>
  <div class="modal" v-if="shownew">
    <div class="modal-content">
      <div class="form-container">
        <h2>新增會員</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="newlabel" for="mName">姓名</label>
            <input type="text" id="mName" v-model="form.mName" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mIdentity">身分證字號</label>
            <input type="text" id="mIdentity" v-model="form.mIdentity" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mGender">性別</label>
            <select id="mGender" v-model="form.mGender">
              <option value="">請選擇</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <div class="form-group">
            <label class="newlabel" for="mAccount">帳號</label>
            <input type="text" id="mAccount" v-model="form.mAccount" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mPassword">密碼</label>
            <input type="password" id="mPassword" v-model="form.mPassword" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mAddress">地址</label>
            <input type="text" id="mAddress" v-model="form.mAddress" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mPhone">電話</label>
            <input type="tel" id="mPhone" v-model="form.mPhone" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mBirthday">生日</label>
            <input type="date" id="mBirthday" v-model="form.mBirthday" />
          </div>

          <div class="form-group">
            <label class="newlabel" for="mEmail">電子信箱</label>
            <input type="email" id="mEmail" v-model="form.mEmail" />
          </div>

          <div class="btns">
            <button class="newbutton" type="submit" @click="shownew = false">註冊</button>
            <button class="newbutton" @click="shownew = false">關閉</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="pagination">
    <button
      class="previous-page"
      @click="changePage(condition.currentPage - 1)"
      :disabled="condition.currentPage === 1"
    >
      上一頁
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="changePage(page)"
      :class="['page', { active: condition.currentPage === page }]"
    >
      {{ page }}
    </button>

    <button
      class="next-page"
      @click="changePage(condition.currentPage + 1)"
      :disabled="condition.currentPage === totalPages"
    >
      下一頁
    </button>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import memberRow from "@/components/member/memberRow.vue";

const totalItems = ref(0);
const totalPages = ref(1);
const members = ref({});
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
  
});
const form = reactive({
  mName: "",
  mIdentity: "",
  mGender: "",
  mAccount: "",
  mPassword: "",
  mAddress: "",
  mPhone: "",
  mBirthday: null,
  mEmail: ""
});
const showModal = ref(false);
const shownew = ref(false);
const condition = ref({
  identity: "",
  name: "",
  state: null,
  birthday: null,
  startDate: null,
  endDate: null,
  currentPage: 1,
  pageSize: 10,
});
const clean = () => {
  condition.value.identity = "";
  condition.value.name = "";
  condition.value.state = null;
  condition.value.birthday = null;
  condition.value.startDate = null;
  condition.value.endDate = null;
};

const statedata = ref({});
statedata.value = { 正常: 1, 停用: 0 };
const isEditing = ref(false);
const serch = async () => {
  const data = await request({
    url: "/member/search",
    method: "GET",
    params: condition.value,
  });
  data.content.forEach((item) => {
    item.mBirthday = item.mBirthday.slice(0, 10);
  });
  members.value = data.content;

  condition.value.currentPage = data.number + 1;
  totalItems.value = data.totalElements;
  totalPages.value = data.totalPages;
};

onMounted(async () => {
  serch();
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    condition.value.currentPage = page;
    serch();
  }
};
const openModal = async (member) => {
  const data = await request({ url: "/member/" + member.mId, method: "GET" });
  data.mBirthday = data.mBirthday.slice(0, 10);
  data.creation = data.creation.slice(0, 10);
  memberdetail.value = data;
  console.log(memberdetail.value);
  showModal.value = true;
  isEditing.value = false;
};
const edit2 = () => {
  showModal.value = true;
  isEditing.value = true;
};
const edit = async (member) => {
  const data = await request({ url: "/member/" + member.mId, method: "GET" });
  data.mBirthday = data.mBirthday.slice(0, 10);
  data.creation = data.creation.slice(0, 10);
  memberdetail.value = data;
  console.log("我有抓到直" + memberdetail.value.mId);

  showModal.value = true;
  isEditing.value = true;
};
const editok = async () => {
  const data = await request({
    url: "/member/" + memberdetail.value.mId,
    method: "PUT",
    data: memberdetail.value,
  });
  data.mBirthday = data.mBirthday.slice(0, 10);
  data.creation = data.creation.slice(0, 10);
  console.log("我有傳回來喔" + data);

  memberdetail.value = data;
  isEditing.value = false;

  serch();
};
async function submitForm() {
  console.log("我有近來新增");
  const data = await request({
    url: "/member/member",
    method: "POST",
    data: form,
  });

  console.log(data);
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  position: relative;
}
table {
  width: 100%;
  background-color: rgb(255, 255, 255);
  border-collapse: collapse;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
}
thead {
  width: 100%;
  height: 50px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1);
}
th {
  color: #555555;
  border-right: 1px solid #ffffff;
  border-left: 1px solid #ffffff;
}

.table {
  height: 85%;
  border-collapse: collapse;
  overflow: auto;
}
.search {
  width: 100%;
  height: calc(8% - 10px);
  background-color: #ffffff;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(7% - 10px);
  margin-top: 10px;
}
label {
  margin-right: 10px;
}
.serchbarinput {
  width: 100px;
  border: 1px solid black;
  margin-right: 30px;
}
.identity,
.name {
  width: 180px;
}

.btn {
  width: 60px;
  height: 30px;
  margin-right: 10px;
  border-radius: 5px;
}
.btnborder {
  border: 1px solid orange;
  color: orange;
  &:hover {
    background-color: orange;
    color: white;
  }
  &:active {
    box-shadow: inset 0 0 10px 5px rgba(0, 0, 0, 0.3);
  }
}
.btnborder1 {
  border: 1px solid rgb(1, 146, 33);
  color: rgb(1, 146, 33);
  &:hover {
    background-color: rgb(1, 146, 33);
    color: white;
  }
  &:active {
    box-shadow: inset 0 0 10px 5px rgba(0, 0, 0, 0.3);
  }
}
.btnborder2 {
  border: 1px solid rgb(255, 102, 0);
  color: rgb(255, 102, 0);
  &:hover {
    background-color: rgb(255, 102, 0);
    color: white;
  }
  &:active {
    box-shadow: inset 0 0 10px 5px rgba(0, 0, 0, 0.3);
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  min-width: 20%;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

/*新增表單區域*/
.form-container {
  max-width: 500px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.newlabel {
  margin-bottom: 6px;
  font-weight: bold;
}

input,
select {
  height: 30px;
  width: 350px;
  padding: 3px;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 14px;
}
.btns {
  display: flex;
}
.newbutton {
  margin: 10px;
  width: 100%;
  padding: 10px;
  color: orange;
  border: 1px solid orange;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.newbutton:hover {
  background-color: orange;
  color: white;
}
.detail {
  display: flex;

  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 10px;
}
.detail:last-child {
  justify-content: center;
}
.detail > p:first-child {
  width: 80px;
  margin-right: 20px;
  padding: 0 5px;
}
h3 {
  text-align: center;
}
.detail > button {
  width: 40%;
  height: 50px;
  margin: 10px;
  color: orange;
  border: 1px solid orange;
  border-radius: 4px;
}
.detail > button:hover {
  background-color: orange;
  color: white;
}

/*分頁按鈕*/

.page {
  width: 30px;
  height: 30px;
  background-color: #fff;
  border-radius: 4px;
  margin: 5px;
}
.page.active{
  background-color:rgb(1, 146, 33) ;
  color: white;
}

.page:hover {
  background-color: rgb(1, 146, 33);
  color: white;
}

.disabled-text {
  color: red;
  font-weight: bold;
}
</style>
