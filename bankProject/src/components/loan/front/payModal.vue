<template>
  <v-dialog v-model="innerVisible" max-width="500px" persistent>
    <v-card>
      <!-- 標題 -->
      <v-card-title class="text-h6 font-weight-bold">
        立即繳費
      </v-card-title>
      <v-divider></v-divider>

      <!-- 下一期繳費資訊 -->
      <v-card-text>
        <div class="mb-4">
          <p>
            <strong>下一期到期日：</strong>
            {{ schedule?.dueDate || "尚未生成" }}
          </p>
          <p>
            <strong>應繳金額：</strong>
            NT$ {{ formatMoney(schedule?.amountDue) }}
          </p>
        </div>

        <!-- 繳費方式 -->
        <v-radio-group v-model="selectedMethod" column>
          <v-radio label="帳戶轉帳" value="account" />
          <v-radio label="Line Pay" value="linepay" />
        </v-radio-group>
      </v-card-text>

      <v-divider></v-divider>

      <!-- 底部操作 -->
      <v-card-actions class="d-flex justify-end">
        <v-btn text color="grey" @click="closeDialog">取消</v-btn>
        <v-btn color="primary" @click="confirmPayment">確認繳費</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { request } from "@/utils/FontAxiosUtil";

// 接收 props
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  loanId: { type: String, required: true },
});

// 定義 emit
const emit = defineEmits(["update:modelValue", "success"]);

// 內部 dialog 狀態
const innerVisible = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (innerVisible.value = val)
);
watch(innerVisible, (val) => emit("update:modelValue", val));

// 下一期繳費資訊
const schedule = ref(null);

// 繳費方式，預設帳戶轉帳
const selectedMethod = ref("account");

// 當 dialog 開啟時載入資料
watch(
  () => innerVisible.value,
  async (val) => {
    if (val) await fetchNextSchedule();
  }
);

// API：取得下一期繳費資訊
const fetchNextSchedule = async () => {
  try {
    const res = await request({
      url: `/loans/${props.loanId}/schedules`,
      method: "get",
    });
    const list = res.data || res;
    schedule.value = list.find((s) => s.paymentStatus === "pending") || null;
  } catch (err) {
    console.error("取得下一期繳費資訊失敗:", err);
    schedule.value = null;
  }
};

// API：確認繳費
const confirmPayment = async () => {
  if (!schedule.value) {
    alert("尚無繳費資訊");
    return;
  }
  try {
    const res = await request({
      url: `/schedules/pay`,
      method: "post",
      data: {
        scheduleId: schedule.value.scheduleId,
        method: selectedMethod.value,
      },
    });
    alert("繳費成功！");
    emit("success", res.data || res); // 通知父元件更新
    innerVisible.value = false; // 關閉 dialog
  } catch (err) {
    console.error("繳費失敗:", err);
    alert("繳費失敗，請稍後再試");
  }
};

// 關閉 dialog
const closeDialog = () => {
  innerVisible.value = false;
};

// 金額格式化
const formatMoney = (amount) =>
  amount != null ? Math.round(amount).toLocaleString() : 0;
</script>
