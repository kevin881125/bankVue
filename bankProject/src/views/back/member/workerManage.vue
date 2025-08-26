<template>
  <div class="container">
    <div class="worker">
      <h1>管理員清單</h1>
      <div class="newWorker">
        <label for="">名稱:</label>
        <input type="text" v-model="worker.wName" />
        <label for="">帳號:</label>
        <input type="text" v-model="worker.wAccount" />
        <label for="">密碼:</label>
        <input type="text" v-model="worker.wPassword" /><label for=""
          >角色:</label
        >
        <select v-model="worker.role.roleId">
          <option
            v-for="role in roledata"
            :key="role.roleId"
            :value="role.roleId"
          >
            {{ role.roleName }}
          </option>
        </select>
        <button @click="newWorker">新增</button>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 40px">編號</th>
            <th style="width: 100px">員工名子</th>
            <th style="width: 100px">帳號</th>
            <th style="width: 100px">密碼</th>
            <th style="width: 100px">角色</th>
            <th style="width: 80px">編輯</th>
          </tr>
        </thead>
        <workerRow
          v-for="w in workers"
          :worker="w"
          :roledata1="roledata"
        ></workerRow>
      </table>
    </div>
    <div class="rolePermission">
      <h1>角色管理</h1>
      <table class="roletable">
        <thead class="roletitle">
          <tr>
            <th>角色</th>
            <th v-for="page in pageAll">
              {{ page.pageExp }}
            </th>
            <th>新增</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="text" v-model="role.role.roleName" /></td>
            <td v-for="(page, pageIndex) in pageAll">
              <input
                :key="pageIndex"
                type="checkbox"
                :value="page"
                v-model="role.pages"
              />
            </td>
            <td>
              <button @click="newRole">新增</button>
            </td>
          </tr>
        </tbody>
      </table>

      <table class="roleList" v-if="!roleEdit">
        <thead>
          <tr>
            <th>角色</th>
            <th v-for="page in pageAll">
              {{ page.pageExp }}
            </th>
            <th>刪除</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(role, index) in roleWithPageDatas" :key="index">
            <td>{{ role.role.roleName }}</td>
            <td v-for="(page, pageIndex) in pageAll" :key="pageIndex">
              <input
                type="checkbox"
                :checked="role.pages.some((p) => p.pageId === page.pageId)"
                @change="
                  togglePermission(role.role.roleId, page.pageId, $event)
                "
              />
            </td>
            <td>
              <button class="deletebtn" @click="showConfirm(role.role.roleId,role.role.roleName)">
                <span class="mdi mdi-delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="roleList" v-if="roleEdit">
        <thead>
          <tr>
            <th>角色</th>
            <th v-for="page in pageAll">
              {{ page.pageExp }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(role, index) in roleWithPageDatas" :key="index">
            <td>{{ role.role.roleName }}</td>
            <td v-for="(page, pageIndex) in pageAll" :key="pageIndex">
              <span
                v-if="role.pages.some((p) => p.pageId === page.pageId)"
                class="mdi mdi-check-bold color"
              ></span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="btn">
        <button v-if="roleEdit" @click="roleEdit = false">編輯</button>
        <button v-if="!roleEdit" @click="editRolePermission">確定更改</button>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal">
      <div class="modal-content">
        <p>你確定要刪除{{roleName}}這個角色嗎？</p>
        <button @click="deleteRole">確定</button>
        <button @click="cancelDelete">取消</button>
      </div>
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
const roleEdit = ref(true);



/*刪除確認功能*/
const showModal =ref(false);
const roleIdToDelete=ref({});
const roleName=ref("");
const showConfirm=(roleId,name)=> {
      roleIdToDelete.value = roleId;
      showModal.value = true;
      roleName.value = name;
    }
const cancelDelete=()=> {
      showModal.value = false;
      roleIdToDelete.value = null;
      roleName.value = "";
    }
const deleteRole = async () => {
  if(checkWorkersinRole(workers.value,roleIdToDelete.value)){
    const data = await request({
      url: "/api/roles/" + roleIdToDelete.value,
      method: "DELETE",
    });
    getAllRolesWithPage();
  }else{
    window.alert("不能刪除此角色還在被使用中")
  }
  getAllrole();
  cancelDelete()
};


const worker = ref({
  wName: "",
  wAccount: "",
  wPassword: "",
  role: {
    roleId: null,
  },
});
const checkWorlerNew = ()=>{
let check = true;

if(worker.value.wName ===""){
  window.alert("名稱沒有填寫")
  check=false;
}
if(worker.value.wAccount ===""){
  window.alert("帳號沒有填寫")
  check=false;
}
if(worker.value.wPassword ===""){
  window.alert("密碼沒有填寫")
  check=false;
}
if(worker.value.role.roleId === null){
  window.alert("角色沒有選擇")
  check=false;
}
  workers.value.forEach((oworker) => {
    if (oworker.wAccount === worker.value.wAccount) {
      window.alert("此帳號已存在請更換")
      check = false;
    }
  });
return check;
}

const cleanWorker = () => {
  worker.value.wName = "";
  worker.value.wAccount = "";
  worker.value.wPassword = "";
  worker.value.role.roleId = null;
};

const role = ref({
  role: {
    roleId: null,
    roleName: "",
  },
  pages: [],
});

const clearRole = () => {
  role.value.role.roleId = null;
  role.value.role.roleName = "";
  role.value.pages = [];
};

const checkWorkersinRole = (workers, id) => {
  let check = true;
  workers.forEach((worker) => {
    if (worker.role.roleId === id) {
      console.log(
        "編號:" + worker.wId + ",角色正在使用:" + worker.role.roleName
      );
      check = false;
    }
  });
  return check;
};



const newWorker = async () => {
  if(checkWorlerNew()){
    const data = await request({
      url: "/worker/worker",
      method: "POST",
      data: worker.value,
    });
    getAllworker();
    cleanWorker();
  }
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
  roleEdit.value = true;
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

// const newPermission = (page, event) => {
//   if (event.target.checked) {
//     role.value.pages.push(page);
//   } else {
//     role.value.pages = role.value.pages.filter((p) => p.pageId !== page.pageId);
//   }
// };

const newRole = async () => {
  const data = await request({
    url: "api/roles/role",
    method: "POST",
    data: role.value,
  });
  clearRole();
  getAllRolesWithPage();
  getAllrole();
};
</script>
<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
}
table {
  border-collapse: collapse;
}
thead {
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}
th {
  padding: 10px;
}

.worker {
  width: 800px;
  height: 100%;
  margin-right: 20px;
}
.rolePermission {
  width: 800px;
  height: 100%;
}

.worker > table {
  width: 100%;
  height: 80%;
  background-color: #fff;
  border-radius: 10px;
}
/*工作者新增欄位*/
.newWorker {
  width: 100%;
  padding: 20px 0px;
  background-color: #fff;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.newWorker > input {
  width: 100px;
  border: 1px solid #c2bebe;
  border-radius: 10px;
  margin-right: 20px;
  padding: 3px 10px;
}
.newWorker > select {
  width: 100px;
  border: 1px solid #c2bebe;
  border-radius: 10px;
  margin-right: 20px;
  padding: 3px 10px;
}

.newWorker > input:active {
  border: 1px solid #353434;
}
.newWorker > label {
  margin-right: 5px;
}
.newWorker > button {
  width: 80px;
  height: 34px;
  background-color: #ebb211;
  color: #fff;
  border-radius: 10px;
}
.newWorker > button:hover {
  background-color: #e0a911;
}

/*角色的新增*/

.roletable {
  width: 100%;
  height: 100px;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}
.roletable td {
  text-align: center;
}

.roletable input[type="text"] {
  width: 100px;
  border: 1px solid #c2bebe;
  border-radius: 10px;
  padding: 3px 10px;
}
.roletable input[type="text"]:active {
  border: 1px solid #353434;
}
.roletable button {
  width: 80px;
  height: 34px;
  background-color: #ebb211;
  color: #fff;
  border-radius: 10px;
}
.roletable button:hover {
  background-color: #e0a911;
}
.roletitle {
  box-shadow: none;
}
/*角色清單*/
.roleList {
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 10px;
}
.roleList > thead {
  width: 100%;
}

.roleList td {
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid rgb(212, 211, 211);
  height: 50px;
}
.color {
  color: green;
}

/*編輯按鈕*/
.btn {
  float: right;
  margin-bottom: 10px;
}
.btn > button {
  margin-right: 10px;
  width: 80px;
  height: 34px;
  background-color: #ebb211;
  color: #fff;
  border-radius: 10px;
}

.deletebtn{
  width: 100%;
  height: 100%;
}
.deletebtn:hover{

  color:#de5858 ;
}


/*確認頁面*/
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Modal 本體 */
.modal-content {
  background-color: #fff;
  padding: 30px 20px;
  border-radius: 12px;
  width: 300px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease-in-out;
}

/* 提示文字 */
.modal-content p {
  font-size: 16px;
  margin-bottom: 20px;
  color: #333;
}

/* 按鈕區塊 */
.modal-content button {
  background-color: #ebb211;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.modal-content button:hover {
  background-color: #d19b0f;
}

/* 動畫（可選） */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
