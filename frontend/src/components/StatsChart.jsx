import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Aucune donnée à afficher</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.currentState?.label || 'Inconnu'),
    datasets: [
      {
        data: data.map((item) => parseInt(item.count)),
        backgroundColor: data.map(
          (item) => item.currentState?.color || '#6b7280'
        ),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: 'Outfit',
            size: 12,
          },
          color: '#94a3b8',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          family: 'Outfit',
          size: 14,
        },
        bodyFont: {
          family: 'Outfit',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ${value} entités (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container doughnut-chart">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default StatsChart;


