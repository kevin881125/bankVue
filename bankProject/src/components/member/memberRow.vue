<template>
  <tr>
    <td>{{ member.mId }}</td>
    <td>{{ member.mName }}</td>
    <td>{{ member.mIdentity }}</td>
    <td>{{ member.mGender }}</td>
    <td>{{ member.mBirthday }}</td>
    <td>{{ member.mPhone }}</td>
    <td>{{ member.mEmail }}</td>
    <td>{{ member.mState }}</td>
    <td>
      <button class="look" @click="viewDetail">
        <span class="mdi mdi-eye"></span>
      </button>
    </td>
    <td>
      <button class="edit" @click="viewEdit">
        <span class="mdi mdi-lead-pencil"></span>
      </button>
    </td>
  </tr>
</template>
<script setup>
import { defineProps, defineEmits, ref } from "vue";

const props = defineProps({
  member: {
    type: Object,
  },
});

const emit = defineEmits(["click", "edit"]);

const viewDetail = () => {
  emit("click", props.member);
};
const viewEdit = () => {
  emit("edit", props.member);
};
</script>
<style scoped>
* {
  box-sizing: border-box;
  position: relative;
}
tr {
  width: 100%;
  &:hover {
    background-color: #e2e1e1;
  }
}
td {
  border-bottom: 1px solid rgb(100, 100, 100);
  color: rgb(156, 156, 156);
  font-weight: 350;
  text-align: center;
}
.look {
  width: 80%;
  height: 80%;
  border-radius: 5px;
  box-sizing: border-box;

  &:hover {
    color: #ebb211;
    background-color: #fff;
  }
}
.edit {
  width: 80%;
  height: 80%;
  border-radius: 5px;
  box-sizing: border-box;

  &:hover {
    color: rgb(1, 146, 33);
    background-color: #fff;
  }
}
</style>
