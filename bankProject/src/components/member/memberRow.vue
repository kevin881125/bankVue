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
    <td><button class="look"><span class="mdi mdi-eye"></span></button></td>
    <td><button class="edit"><span class="mdi mdi-lead-pencil"></span></button></td>
  </tr>
</template>
<script setup>
import { defineProps } from "vue";

defineProps({
  member: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped>
    tr{
        width: 100%;
         &:hover{
            background-color: #e2e1e1;
        }
        
    }
    td{
        border-bottom: 1px solid rgb(100, 100, 100);
        padding-left: 10px;
        color: rgb(156, 156, 156);
        font-weight: 350;
    }
    .look{
        color: rgb(0, 241, 161);
    }
    .edit{
        color:red
    }
</style>
