<template>
  <tr v-if="show">
    <td>{{ localWorker.wId }}</td>
    <td>{{ localWorker.wName }}</td>
    <td>{{ localWorker.wAccount }}</td>
    <td>{{ localWorker.wPassword }}</td>
    <td>{{ localWorker.role.roleName }}</td>
    <td>
      <button class="edit" @click="viewEdit">
        <span class="mdi mdi-lead-pencil"></span>
      </button>
    </td>
  </tr>
  <tr v-if="!show">
    <td>{{ localWorker.wId }}</td>
    <td>
      <input type="text" v-model="localWorker.wName" />
    </td>
    <td><input type="text" v-model="localWorker.wAccount" /></td>
    <td><input type="text" v-model="localWorker.wPassword" /></td>
    <td>
      <select v-model="localWorker.role.roleId">
        <option
          v-for="role in roledata1"
          :key="role.roleId"
          :value="role.roleId"
        >
          {{ role.roleName }}
        </option>
      </select>
    </td>
    <td>
      <button class="edit" @click="conmit">
        <span>確認修改</span>
      </button>
    </td>
  </tr>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { request } from "@/utils/BackAxiosUtil";

const show = ref(true);

const viewEdit = () => {
  show.value = !show.value;
};

const localWorker = ref({});

const conmit = async () => {
  console.log("我有執行" + localWorker.value);

  const data = await request({
    url: "/worker/" + localWorker.value.wId,
    method: "PUT",
    data: localWorker.value,
  });

  console.log(data);
  localWorker.value = data;

  show.value = !show.value;
};

const props = defineProps({
  worker: {
    type: Object,
  },
  roledata1: {
    type: Object,
  },
});

watch(
  () => props.worker,
  (newWorker) => {
    localWorker.value = JSON.parse(JSON.stringify(newWorker));
  },
  { immediate: true }
);
</script>
<style scoped>
* {
  box-sizing: border-box;
  position: relative;
}
tr {
  width: 100%;
  &:hover {
    background-color: #f3f2f2;
  }
}
td {
  border-bottom: 1px solid rgb(212, 211, 211);
  color: rgb(59, 59, 59);
  font-weight: 350;
  height: 62px;
  text-align: center;
}

.edit {
  width: 80%;
  height: 80%;
  border-radius: 5px;
  box-sizing: border-box;

  &:hover {
    color: rgb(1, 146, 33);
  }
}

.disabled-text {
  color: red;
  font-weight: bold;
}
.disabled-text2 {
  color: rgb(156, 156, 156);
  font-weight: bold;
}
input,
select {
  width: 100px;
  border: 1px solid #c2bebe;
  text-align: center;
  border-radius: 10px;
}
.newWorker > input:active,
input:active {
  border: 1px solid #353434;
}
</style>
