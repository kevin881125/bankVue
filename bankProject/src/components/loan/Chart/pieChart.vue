<template>
  <canvas ref="pieChart" width="200" height="200"></canvas>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  score: Number,
  label: String,
});

const pieChart = ref(null);

onMounted(() => {
  new Chart(pieChart.value, {
    type: "doughnut",
    data: {
      labels: [props.label, "滿分1000"],
      datasets: [
        {
          data: [props.score, 1000 - props.score],
          backgroundColor: ["#4caf50", "#eee"],
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
            label: (context) => `${context.label}: ${context.parsed}`,
          },
        },
      },
    },
  });
});
</script>
