<template>
  <!-- 新增帳戶 addDialog -->
  <v-dialog v-model="internalShow" width="300" persistent>
    <v-card>
      <v-card-title>新增帳戶</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newAccount.mId"
          clearable
          label="會員編號"
        ></v-text-field>
        <v-text-field
          v-model="newAccount.accountName"
          clearable
          label="帳戶名稱"
        ></v-text-field>
        <v-select
          v-model="newAccount.currency"
          label="幣別"
          :items="['台幣', '外幣']"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="submitNewAccount">新增</v-btn>
        <v-btn text @click="internalShow = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { request } from "@/utils/BackAxiosUtil";

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(["update:show", "added"]);

const internalShow = ref(props.show);
watch(
  () => props.show,
  (val) => (internalShow.value = val)
);

watch(internalShow, (val) => {
  emit("update:show", val);
  if (val) {
    newAccount.value = {
      mId: "",
      accountName: "",
      currency: "",
    };
  }
});

const newAccount = ref({
  mId: "",
  accountName: "",
  currency: "",
});

const submitNewAccount = async () => {
  if (
    !newAccount.value.mId ||
    !newAccount.value.accountName ||
    !newAccount.value.currency
  ) {
    alert("請填寫所有欄位");
    return;
  }

  // 驗證會員編號是否存在
  try {
    const mIdresult = await request({
      url: "/member/" + newAccount.value.mId,
      method: "GET",
    });

    if (!mIdresult) {
      alert("會員編號不存在");
      return;
    }

    if (newAccount.value.currency === "台幣") {
      newAccount.value.currency = "NT";
    }

    const result = await request({
      url: "/account/insert",
      method: "POST",
      data: {
        mId: newAccount.value.mId,
        accountName: newAccount.value.accountName,
        currency: newAccount.value.currency,
      },
      headers: { "Content-Type": "application/json" },
    });

    alert("新增帳戶成功");
    newAccount.value = { mId: "", accountName: "", currency: "" }; // 清空欄位
    emit("added");
    internalShow.value = false;
  } catch (error) {
    alert("新增失敗，請稍後再試");
    console.error(error);
  }
};
</script>

<style scoped></style>
