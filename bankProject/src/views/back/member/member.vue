<template>
  <div class="search"></div>
  <div class="table">
    <table>
        <thead>
            <tr><th>編號</th><th>名子</th><th>身分證</th><th>性別</th><th>出生</th><th>電話</th><th>信箱</th><th>狀態</th><th>查看</th><th>修改</th></tr>
        </thead>
      <memberRow v-for="m in members" :member="m"></memberRow>
    </table>
  </div>
</template>
<script setup>
import { request } from "@/utils/BackAxiosUtil";
import { ref, onMounted } from "vue";
import memberRow from "@/components/member/memberRow.vue";

const members = ref({});

onMounted(async () => {
  members.value = await request({ url: "/member/memberAll", method: "GET" });
});
</script>
<style scoped>
table {
  width: 100%;
  height: 100%;
  background-color: rgb(255, 255, 255);
   border-collapse: collapse;
   box-shadow: 0 0 10px 10px gray;
   padding-left: 10px;
   padding-right: 10px;
}
thead{
    width: 100%;
    height: 50px;
    background-color:rgb(255, 255, 255);
    box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1); 
}
th{
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
  height: 15%;
  background-color: #ffffff;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(83, 83, 83, 0.1);
}
</style>
