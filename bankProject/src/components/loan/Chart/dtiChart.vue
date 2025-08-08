<!-- src/components/loan/pieChart/DtiChart.vue -->
<template>
  <canvas ref="dtiChart" width="200" height="200"></canvas>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  dtiRatio: Number, // 0~1之間的小數
});

const dtiChart = ref(null);

onMounted(() => {
  const ratioPercent = (props.dtiRatio ?? 0) * 100;
  new Chart(dtiChart.value, {
    type: "doughnut",
    data: {
      labels: ["負債比例", "剩餘收入"],
      datasets: [
        {
          data: [ratioPercent, 100 - ratioPercent],
          backgroundColor: ["#f44336", "#4caf50"], // 紅綠配色
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      cutout: "70%",
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label}: ${context.parsed.toFixed(2)}%`,
          },
        },
      },
    },
  });
});
</script>
