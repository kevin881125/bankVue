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

  <div class="newWorker">
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
  <div class="rolePermission">
    <table>
      <thead>
        <tr>
          <th>角色</th>
          <th v-for="(page, pageIndex) in pageAll">
            {{ page.pageExp }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(role, index) in roleWithPageDatas" :key="index">
          <td>{{ role.role.roleName }}</td>
          <td v-for="(page, pageIndex) in pageAll" :key="pageIndex">
            <input
              type="checkbox"
              :checked="role.pages.some((p) => p.pageId === page.pageId)"
              @change="togglePermission(role.role.roleId, page.pageId, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="editRolePermission">確定更改</button>
    <table>
      <tbody>
        <tr>
          <td><input type="text"  v-mode="role.role.roleName"/></td>

          <td>
            <input
              v-for="(page, pageIndex) in pageAll"
              :key="pageIndex"
              type="checkbox"
              @change="newPermission(page, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
     <button @click="newRole">新增角色</button>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted, reactive } from "vue";
import workerRow from "@/components/member/workerRow.vue";

const workers = ref({});
const roledata = ref({});
const roleWithPageDatas = ref({});
const pageAll = ref({});

const worker = ref({
  wName: "",
  wAccount: "",
  wPassword: "",
  role: {
    roleId: null,
  },
});

const role = ref({
      role: {
            roleId: null,
            roleName:""
        },
      pages: [
            
        ]
})


const newWorker = async () => {
  const data = await request({
    url: "/worker/worker",
    method: "POST",
    data: worker.value,
  });
  getAllworker();
};

const getAllworker = async () => {
  const data = await request({
    url: "/worker/workerAll",
    method: "GET",
  });
  workers.value = data;
};

const getAllrole = async () => {
  const data = await request({
    url: "/api/roles/roleAll",
    method: "GET",
  });
  roledata.value = data;
};

const getAllRolesWithPage = async () => {
  const data = await request({
    url: "api/roles/rolesWithPages",
    method: "GET",
  });
  roleWithPageDatas.value = data;
};

const getAllPage = async () => {
  const data = await request({
    url: "page/pageAll",
    method: "GET",
  });
  pageAll.value = data;
};

const editRolePermission = async () => {
  const data = await request({
    url: "/api/roles/updatePermissions",
    method: "POST",
    data: roleWithPageDatas.value,
  });
};

const resetPage = () => {
  getAllworker();
  getAllrole();
  getAllRolesWithPage();
  getAllPage();
};

onMounted(() => {
  resetPage();
});

const togglePermission = (roleId, pageId, event) => {
  // 找到這個角色在 roleWithPageDatas 中
  const role = roleWithPageDatas.value.find((r) => r.role.roleId === roleId);
  if (role) {
    // 找到當前頁面對應的完整頁面物件
    const page = pageAll.value.find((p) => p.pageId === pageId);

    if (event.target.checked) {
      // 勾選：將完整頁面物件加入角色的權限中
      if (!role.pages.some((p) => p.pageId === pageId)) {
        role.pages.push(page);
      }
    } else {
      // 取消勾選：從角色的權限中移除該頁面
      role.pages = role.pages.filter((p) => p.pageId !== pageId);
    }
  }
};


const newPermission = (page, event)=>{
  
  if( event.target.checked){
      role.value.pages.push(page);
  }else{
    role.value.pages =  role.pages.filter((p) => p.pageId !== page.pageId)
  }
}

const newRole = async()=>{
  const data = await request({
    url: "api/roles/rolesWithPages",
    method: "POST",
    data:role.value
  });
}
</script>
<style scoped>
table {
  border-collapse: collapse;
}
</style>
