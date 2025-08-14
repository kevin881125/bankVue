<template>
  <v-dialog v-model="internalShow" width="400" persistent>
    <v-card>
      <v-card-title>修改帳戶狀態</v-card-title>
      <v-card-text>
        <v-row class="mb-3">
          <v-col cols="12" class="text-h6">
            客戶名稱：{{ selectedAccount.member?.mName }}
          </v-col>
          <v-col cols="12" class="text-h6">
            帳戶名稱：{{ selectedAccount.accountName }}
          </v-col>
          <v-col cols="12" class="text-h6">
            帳戶號碼：{{ selectedAccount.accountId }}
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <v-select
              v-model="updateForm.status"
              label="狀態"
              :items="['啟用', '凍結', '限制']"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="updateForm.memo"
              label="備註"
              rows="2"
              auto-grow
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="emit('submit-update-status')">確定</v-btn>
        <v-btn text @click="internalShow = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  show: Boolean,
  selectedAccount: Object,
  updateForm: Object,
});

const emit = defineEmits(["update:show", "submit-update-status"]);

const internalShow = ref(props.show);
watch(
  () => props.show,
  (val) => (internalShow.value = val)
);

watch(internalShow, (val) => {
  emit("update:show", val);
  if (val) {
    props.updateForm.status = props.selectedAccount?.status || "";
    props.updateForm.memo = "";
  }
});
</script>
<style scoped></style>
