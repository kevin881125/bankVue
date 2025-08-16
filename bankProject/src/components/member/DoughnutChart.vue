<template>
  <div class="chart-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  centerText: { type: String, default: "" },
});

const canvas = ref(null);
let chartInstance = null;

// 插件：圓心文字
const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { width, height },
    } = chart;
    ctx.save();
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(props.centerText, width / 2, height / 2);
    ctx.restore();
  },
};

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();

  const ctx = canvas.value.getContext("2d");
  const total = props.values.reduce((sum, val) => sum + val, 0);

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: "統計",
          data: props.values,
          backgroundColor: ["#13aebd", "#EBB211", "#CE1465"],
          borderColor: ["#13aebd", "#EBB211", "#CE1465"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
          labels: {
            generateLabels: (chart) => {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, i) => {
                const value = dataset.data[i];
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label} (${value} / ${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: isNaN(dataset.data[i]) || dataset.data[i] <= 0,
                  index: i,
                };
              });
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
    plugins: [centerTextPlugin],
  });
};

onMounted(renderChart);
watch(() => [props.labels, props.values, props.centerText], renderChart, {
  deep: true,
});
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<style scoped>
.chart-container {
  width: 350px; /* 圓環圖寬度 */
  height: 350px;
  margin: auto;
}
</style>
