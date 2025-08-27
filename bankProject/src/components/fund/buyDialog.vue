<template>
    <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded-lg shadow-lg w-96 p-6">
            <!-- 標題 -->
            <h2 class="text-lg font-bold mb-4">基金申購</h2>

            <!-- 基金資訊 -->
            <p class="mb-2">基金：{{ fund?.fundName || "未選擇" }}</p>
            <p class="mb-4">單位淨值：{{ fund?.fundNav || "-" }}</p>

            <!-- 金額輸入 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">申購金額</label>
                <input type="number" v-model="localAmount" class="w-full border rounded px-3 py-2 mt-1"
                    placeholder="輸入金額" />
            </div>

            <!-- 按鈕區 -->
            <div class="flex justify-end space-x-2">
                <button class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400" @click="handleCancel"
                    :disabled="loading">
                    取消
                </button>
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="handleConfirm"
                    :disabled="loading">
                    <span v-if="loading">處理中...</span>
                    <span v-else>確認</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    visible: { type: Boolean, required: true },
    fund: { type: Object, default: null },
    amount: { type: Number, default: 0 },
    loading: { type: Boolean, default: false }
});

const emits = defineEmits(["update:visible", "update:amount", "confirm", "cancel"]);

const localAmount = ref(props.amount);

// 當外部的 amount 改變時，更新內部
watch(() => props.amount, (val) => {
    localAmount.value = val;
});

// 點擊確認
const handleConfirm = () => {
    emits("update:amount", localAmount.value);
    emits("confirm", localAmount.value);
};

// 點擊取消
const handleCancel = () => {
    emits("cancel");
    emits("update:visible", false);
};
</script>
