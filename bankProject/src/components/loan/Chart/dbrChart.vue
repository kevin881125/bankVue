<template>
  <div class="dbr-chart-container">
    <canvas ref="chartCanvas"></canvas>
    <div class="dbr-info">
      <p class="dbr-value">{{ dbrValue.toFixed(1) }} 倍</p>
      <p class="dbr-status" :class="statusClass">
        {{ statusText }}
        <span v-if="dbrValue > 22" class="warning-icon">⚠️</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  dbrValue: {
    type: Number,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

// 計算使用率和狀態
const dbrPercent = computed(() => {
  return Math.min((props.dbrValue / 22) * 100, 100);
});

const statusClass = computed(() => {
  if (props.dbrValue > 22) return 'status-danger';
  if (props.dbrValue > 15) return 'status-warning';
  return 'status-safe';
});

const statusText = computed(() => {
  if (props.dbrValue > 22) return '違規';
  if (props.dbrValue > 15) return '注意';
  return '安全';
});

const getChartColors = () => {
  if (props.dbrValue > 22) {
    return {
      used: '#CE1465',
      remaining: '#F8F9FA'
    };
  } else if (props.dbrValue > 15) {
    return {
      used: '#EBB211',
      remaining: '#F8F9FA'
    };
  } else {
    return {
      used: '#059669',
      remaining: '#F8F9FA'
    };
  }
};

const renderChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const colors = getChartColors();
  const usedPercent = Math.min(dbrPercent.value, 100);
  const remainingPercent = Math.max(100 - usedPercent, 0);

  chartInstance = new Chart(chartCanvas.value, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [usedPercent, remainingPercent],
          backgroundColor: [colors.used, colors.remaining],
          borderWidth: 0,
          cutout: '70%',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataIndex === 0 ? 'DBR 使用率' : '剩餘額度';
              return `${label}: ${context.parsed.toFixed(1)}%`;
            }
          }
        },
      },
      animation: {
        animateRotate: true,
        duration: 800,
      },
    },
  });
};

watch(() => props.dbrValue, renderChart, { immediate: true });

onMounted(renderChart);
</script>

<style scoped>
.dbr-chart-container {
  max-width: 100px;
  margin-top: 24px;
  position: relative;
}

.dbr-info {
  text-align: center;
  margin-top: 24px;
}

.dbr-value {
  font-size: 18px;
  font-weight: 700;
  color: #222626;
  margin: 4px 0;
  letter-spacing: -0.2px;
}

.dbr-status {
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
  color: #EBB211;
}

.status-danger {
  background: rgba(206, 20, 101, 0.1);
  color: #CE1465;
}

.warning-icon {
  font-size: 12px;
}

canvas {
  max-height: 150px;
}
</style>