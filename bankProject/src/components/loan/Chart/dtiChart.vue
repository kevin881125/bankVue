<template>
  <div class="chart-container">
    <canvas ref="dtiChart"></canvas>
    <div class="chart-info">
      <p class="chart-value">{{ (dtiRatio * 100).toFixed(1) }}%</p>
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

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const props = defineProps({
  dtiRatio: {
    type: Number, // 0~1
    required: true,
  },
});

const dtiChart = ref(null);
let chartInstance = null;

const ratioPercent = computed(() => Math.min((props.dtiRatio ?? 0) * 100, 100));

// 狀態判斷
const statusClass = computed(() => {
  if (ratioPercent.value > 50) return "status-danger";
  if (ratioPercent.value > 35) return "status-warning";
  return "status-safe";
});

const statusText = computed(() => {
  if (ratioPercent.value > 50) return "過高";
  if (ratioPercent.value > 35) return "偏高";
  return "正常";
});

const getChartColors = () => {
  if (ratioPercent.value > 50) {
    return { used: "#CE1465", remaining: "#F8F9FA" };
  } else if (ratioPercent.value > 35) {
    return { used: "#EBB211", remaining: "#F8F9FA" };
  } else {
    return { used: "#059669", remaining: "#F8F9FA" };
  }
};

const renderChart = () => {
  if (!dtiChart.value) return;
  if (chartInstance) chartInstance.destroy();

  const colors = getChartColors();
  chartInstance = new Chart(dtiChart.value, {
    type: "doughnut",
    data: {
      labels: ["負債比例", "剩餘收入"],
      datasets: [
        {
          data: [ratioPercent.value, 100 - ratioPercent.value],
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
            label: (context) =>
              `${context.label}: ${context.parsed.toFixed(2)}%`,
          },
        },
      },
    },
  });
};

watch(() => props.dtiRatio, renderChart, { immediate: true });
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
