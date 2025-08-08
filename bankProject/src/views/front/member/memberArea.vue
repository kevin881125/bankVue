<template>
  <div>
    <label class="newlabel" for="mImage">大頭照</label>
    <input type="file" @change="onFileChange" accept="image/*" />
    <img
      v-if="previewUrl"
      :src="previewUrl"
      alt="預覽圖"
      style="width: 150px; height: 150px; border-radius: 50%"
    />
    <p>{{ mImage }}</p>
    <button @click = "subm">送出</button>
  </div>
</template>
<script setup>
import { request } from "@/utils/FontAxiosUtil";
import { ref } from "vue";
const previewUrl = ref({});
const mImage =ref({});
const formData = new FormData();

const onFileChange =(e)=> {
      const file = e.target.files[0];
      console.log("檔案在這裡"+file);
      
      mImage.value = file;
      previewUrl.value = URL.createObjectURL(file);
      formData.append("file",mImage.value)
    }

const subm = async()=>{
    console.log(formData);


    const data = await request({
    url: "/member/upload-mimage",
    method: "POST",
    data:formData
  });
  console.log("我已經結束了");
  console.log(mImage.value);
  
  

}

</script>
<style scoped>

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
</style>
