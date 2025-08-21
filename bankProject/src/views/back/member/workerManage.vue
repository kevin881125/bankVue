<template>
    <h1>管理員清單</h1>
    <table>
        <thead>
          <tr>
            <th>員工編號</th>
            <th>員工名子</th>
            <th>帳號</th>
            <th>密碼</th>
            <th>角色</th>
            <th>編輯</th>
          </tr>
     </thead>
        <workerRow
            v-for="w in workers"
            :worker="w"
            :roledata1="roledata"
          ></workerRow>
    </table>

    <div class="new">
      <label for="">名稱</label>
      <input type="text" v-model="worker.wName" />
      <label for="">帳號</label>
    <input type="text" v-model="worker.wAccount" />
    <label for="">密碼</label>
    <input type="text" v-model="worker.wPassword" /><label for="">角色</label>
      <select v-model="worker.role.roleId">
        <option v-for="role in roledata" :key="role.roleId" :value="role.roleId">
          {{ role.roleName }}
        </option>
      </select>
      <button @click="newWorker">新增</button>
    </div>
    

    
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import workerRow from "@/components/member/workerRow.vue";

const workers = ref({});
const roledata = ref({});
const worker=ref({
  wName:"",
wAccount:"",
wPassword:"",
role:{
  roleId:null
}
})

const newWorker = async ()=>{
  console.log("我要新增員工");
  console.log(worker.value);
  
  const data = await request({
    url: "/worker/worker",
    method: "POST",
    data:worker.value
  });
  getAllworker()
}

const getAllworker = async () => {
  const data = await request({
    url: "/worker/workerAll",
    method: "GET",
  });
  console.log(data);
  workers.value = data;
};

const getAllrole = async () => {
  const data = await request({
    url: "/api/roles/roleAll",
    method: "GET",
  });
  console.log(data);
  roledata.value = data;
};
onMounted(()=>{
    getAllworker()
    getAllrole()
});



</script>
<style scoped>

table{
    border-collapse: collapse;
}
    
</style>