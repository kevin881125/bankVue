<template>
  <div class="search">
    <div class="searchbar">
      <label for="state">身分證</label>
      <input
        class="identity"
        v-model="condition.identity"
        placeholder="身分證"
      />
      <label for="state">姓名</label>
      <input class="name" v-model="condition.name" placeholder="姓名" />
      <label for="state">狀態：</label>
      <select v-model="condition.state" id="state">
        <option disabled value="">請選擇</option>
        <option v-for="(label, key) in statedata" :value="label">
          {{ key }}
        </option>
      </select>
      <label for="birthday">出生日期：</label>
      <input type="date" v-model="condition.birthday" id="birthday" />
      <label for="date">起始日期：</label>
      <input type="date" v-model="condition.startDate" id="startDate" />
      <label for="date">結束日期：</label>
      <input type="date" v-model="condition.endDate" id="endDate" />
      <button class="btn btnborder" @click="serch">查詢</button>
      <button class="btn btnborder1">新增</button>
    </div>
  </div>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>編號</th>
          <th>名子</th>
          <th>身分證</th>
          <th>性別</th>
          <th>出生</th>
          <th>電話</th>
          <th>信箱</th>
          <th>狀態</th>
          <th>查看</th>
          <th>修改</th>
        </tr>
      </thead>
      <memberRow v-for="m in members" :member="m" @click="openModal" ></memberRow>
    </table>
  </div>

    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <h3>詳細資料</h3>
        <p>{{memberdetail.mId}}</p>
        <p>信箱：</p>
        <p>電話：</p>
        <button @click="showModal = false">關閉</button>
      </div>
    </div>

  <div class="pagination"> 
    <button @click="changePage(condition.currentPage - 1)" :disabled="condition.currentPage === 1">
      上一頁
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="changePage(page)"
      :class="{ active: condition.currentPage === page }"
    >
      {{ page }}
    </button>

    <button
      @click="changePage(condition.currentPage + 1)"
      :disabled="condition.currentPage === totalPages"
    >
      下一頁
    </button>
  </div>
  
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted } from "vue";
import memberRow from "@/components/member/memberRow.vue";

const totalItems = ref(0);
const totalPages = ref(1);
const members = ref({});
const showModal = ref(false);
const memberdetail = ref({});
const condition = ref({
  identity: "",
  name: "",
  state: null,
  birthday: null,
  startDate: null,
  endDate: null,
  currentPage:1,
  pageSize:10
});
const statedata = ref({});
statedata.value = { 正常: 1, 停權: 0 };

const serch = async () => {
  const data = await request({
    url: "/member/search",
    method: "GET",
    params: condition.value
  });
  data.content.forEach((item) => {
    item.mBirthday = item.mBirthday.slice(0, 10);
  });
  members.value = data.content;
  
  condition.value.currentPage = data.number+1;
  totalItems.value = data.totalElements;
  totalPages.value = data.totalPages;
};

onMounted(async () => {
  const data = await request({ url: "/member/search", method: "GET" });
   members.value = data.content ;
   members.value.forEach((item) => {
  item.mBirthday = item.mBirthday.slice(0, 10);
  });
  totalItems.value = data.totalElements;
  totalPages.value = data.totalPages;
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    condition.value.currentPage = page;
    serch();
  }
}
const openModal = async (member) => {

  const data = await request({ url: "/member/"+member.mId, method: "GET" });
  
  memberdetail.value=data;
  console.log(memberdetail.value);
  showModal.value = true;

};










</script>






<style scoped>
* {
  box-sizing: border-box;
  position: relative;
}
table {
  width: 100%;
  height: 100%;
  background-color: rgb(255, 255, 255);
  border-collapse: collapse;
  box-shadow: 0 0 10px 10px gray;
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
  width: 100%;
  height: calc(7% - 10px);
  margin-top: 10px;
}
label {
  margin-right: 10px;
}
input,
select {
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
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
