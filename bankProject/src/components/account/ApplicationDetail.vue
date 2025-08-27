<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="600px"
  >
    <v-card>
      <v-card-title>申請詳細資訊</v-card-title>
      <v-card-text>
        <v-row>
          <!-- 每個資料項目一行兩欄 -->
          <v-col cols="5" class="font-weight-bold">申請編號：</v-col>
          <v-col cols="7">{{ selectedItem.applicationId }}</v-col>

          <v-col cols="5" class="font-weight-bold">會員編號：</v-col>
          <v-col cols="7">{{ selectedItem.mId }}</v-col>

          <v-col cols="5" class="font-weight-bold">會員姓名：</v-col>
          <v-col cols="7">{{ selectedItem.member.mName }}</v-col>

          <v-col cols="5" class="font-weight-bold">身份證字號：</v-col>
          <v-col cols="7">{{ selectedItem.member.mIdentity }}</v-col>

          <v-col cols="5" class="font-weight-bold">性別：</v-col>
          <v-col cols="7">{{ selectedItem.member.mGender }}</v-col>

          <v-col cols="5" class="font-weight-bold">生日：</v-col>
          <v-col cols="7">{{
            formatDateOnly(selectedItem.member.mBirthday)
          }}</v-col>

          <v-col cols="5" class="font-weight-bold">電話：</v-col>
          <v-col cols="7">{{ selectedItem.member.mPhone }}</v-col>

          <v-col cols="5" class="font-weight-bold">Email：</v-col>
          <v-col cols="7">{{ selectedItem.member.mEmail }}</v-col>

          <v-col cols="5" class="font-weight-bold">地址：</v-col>
          <v-col cols="7">{{ selectedItem.member.mAddress }}</v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- 圖片區 -->
        <v-row class="align-center justify-space-between" dense>
          <v-col cols="12" sm="4" v-if="selectedItem.idCardFront">
            <p><strong>身份證正面</strong></p>
            <v-img
              :src="`http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.idCardFront}`"
              alt="身份證正面"
              aspect-ratio="7/9"
              cover
              class="cursor-pointer"
              @click="
                openDialog(
                  `http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.idCardFront}`
                )
              "
            />
          </v-col>
          <v-col cols="12" sm="4" v-if="selectedItem.idCardBack">
            <p><strong>身份證反面</strong></p>
            <v-img
              :src="`http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.idCardBack}`"
              alt="身份證反面"
              aspect-ratio="7/9"
              cover
              class="cursor-pointer"
              @click="
                openDialog(
                  `http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.idCardBack}`
                )
              "
            />
          </v-col>
          <v-col cols="12" sm="4" v-if="selectedItem.secondDoc">
            <p><strong>第二證件</strong></p>
            <v-img
              :src="`http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.secondDoc}`"
              alt="第二證件"
              aspect-ratio="7/9"
              cover
              class="cursor-pointer"
              @click="
                openDialog(
                  `http://localhost:8080/bank/uploadImg/accountImg/${selectedItem.secondDoc}`
                )
              "
            />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- 下方可編輯區 -->
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="狀態"
              dense
              outlined
              required
              :readonly="props.readonly"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="note"
              label="備註(例如退件原因)"
              auto-grow
              rows="2"
              dense
              outlined
              :readonly="props.readonly"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-card-actions class="justify-end">
          <v-btn color="primary" v-if="!props.readonly" @click="submitUpdate"
            >送出</v-btn
          >
          <v-btn text @click="emit('update:modelValue', false)">取消</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
  <!-- 共用的 Dialog -->
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-img :src="selectedImage" aspect-ratio="7/9" cover />
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="dialog = false">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <ErrorMessage
    :visible="showError"
    :errorMessage="errorMsg"
    @cancel="showError = false"
  ></ErrorMessage>
  <SuccessMessage
    :visible="showSuccess"
    :errorMessage="successMsg"
    @cancel="showSuccess = false"
  ></SuccessMessage>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
import { useWorkerStore } from "@/stores/Worker";
import { formatDateOnly } from "@/utils/DataUtil";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SuccessMessage from "@/components/SuccessMessage.vue";
import { request } from "@/utils/BackAxiosUtil";
const workerStore = useWorkerStore();

const props = defineProps({
  modelValue: Boolean,
  selectedItem: Object,
  readonly: Boolean,
});

const emit = defineEmits(["update:modelValue", "updated"]);
const showError = ref(false);
const errorMsg = ref("");

const showSuccess = ref(false);
const successMsg = ref("");
const dialog = ref(false);
const selectedImage = ref("");

function openDialog(src) {
  selectedImage.value = src;
  dialog.value = true;
}

// 下拉式選單的狀態選項
const statusOptions = ["待補件", "通過", "未通過"];

// 狀態與備註欄位
const selectedStatus = ref("");
const note = ref("");

// 當selectedItem 變動時，自動設定預設狀態
watch(
  () => props.selectedItem,
  (val) => {
    if (val) {
      selectedStatus.value = val.status || "";
      note.value = val.note || "";
    }
  },
  { immediate: true }
);

// 送出更新資料到後端
const submitUpdate = async () => {
  if (!selectedStatus.value) {
    errorMsg.value = "請選擇狀態！";
    showError.value = true;
    return;
  }

  if (selectedStatus.value !== "通過" && !note.value.trim()) {
    errorMsg.value = "備註為必填（如退件原因）！";
    showError.value = true;
    return;
  }

  const workerId = workerStore.wId;

  const updateBean = {
    status: selectedStatus.value,
    reviewerId: workerId,
    rejectionReason: note.value,
    applicationId: props.selectedItem.applicationId,
    mId: props.selectedItem.mId,
  };

  console.log(updateBean);

  try {
    const res = await request({
      url: "/account/application/update",
      method: "PUT",
      data: updateBean,
  });

    if (!res) throw new Error("更新失敗");

    successMsg.value = "狀態更新成功！";
    showSuccess.value = true;
    emit("updated"); //通知父元件刷新資料
    emit("update:modelValue", false); // 關閉dialog
  } catch (error) {
    errorMsg.value = error;
    showError.value = true;
  }
};
</script>

<style scoped></style>
