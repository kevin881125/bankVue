<template>
  <div class="chart-container">
    <canvas ref="pieChart"></canvas>
    <div class="chart-info">
      <p class="chart-value">{{ score }} 分</p>
      <p class="chart-status" :class="statusClass">
        {{ statusText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController,);

const props = defineProps({
  score: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: "信用分數",
  },
});

const pieChart = ref(null);
let chartInstance = null;

// 狀態判斷
const statusClass = computed(() => {
  if (props.score < 600) return "status-danger";
  if (props.score < 750) return "status-warning";
  return "status-safe";
});

const statusText = computed(() => {
  if (props.score < 600) return "偏低";
  if (props.score < 750) return "普通";
  return "良好";
});

const getChartColors = () => {
  if (props.score < 600) {
    return { used: "#CE1465", remaining: "#F8F9FA" };
  } else if (props.score < 750) {
    return { used: "#EBB211", remaining: "#F8F9FA" };
  } else {
    return { used: "#059669", remaining: "#F8F9FA" };
  }
};

const renderChart = () => {
  if (!pieChart.value) return;
  if (chartInstance) chartInstance.destroy();

  const colors = getChartColors();
  chartInstance = new Chart(pieChart.value, {
    type: "doughnut",
    data: {
      labels: [props.label, "滿分1000"],
      datasets: [
        {
          data: [props.score, 1000 - props.score],
          backgroundColor: [colors.used, colors.remaining],
          borderWidth: 0,
          cutout: "70%",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}`,
          },
        },
      },
    },
  });
};

watch(() => props.score, renderChart, { immediate: true });
onMounted(renderChart);
</script>

<style scoped>
.chart-container {
  max-width: 100px;
  margin-top: 24px;
  position: relative;
}

.chart-info {
  text-align: center;
  margin-top: 24px;
}

.chart-value {
  font-size: 18px;
  font-weight: 700;
  color: #222626;
  margin: 4px 0;
  letter-spacing: -0.2px;
}

.chart-status {
  font-size: 14px;
  font-weight: 600;
  margin: 8px 0;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.2px;
}

.status-safe {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}
.status-warning {
  background: rgba(235, 178, 17, 0.1);
  color: #ebb211;
}
.status-danger {
  background: rgba(206, 20, 101, 0.1);
  color: #ce1465;
}
</style>
