import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ActivityChart = ({ data }) => {
  if (!data || !data.activity || data.activity.length === 0) {
    return (
      <div className="chart-empty">
        <p>Aucune activité à afficher</p>
      </div>
    );
  }

  const labels = data.activity.map((item) =>
    format(parseISO(item.date), 'dd MMM', { locale: fr })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Activité',
        data: data.activity.map((item) => parseInt(item.count)),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      ...(data.newEntities && data.newEntities.length > 0
        ? [
            {
              label: 'Nouvelles entités',
              data: data.newEntities.map((item) => parseInt(item.count)),
              fill: false,
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              borderDash: [5, 5],
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Outfit',
            size: 11,
          },
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          font: {
            family: 'Outfit',
            size: 11,
          },
          color: '#64748b',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="chart-container line-chart">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ActivityChart;


