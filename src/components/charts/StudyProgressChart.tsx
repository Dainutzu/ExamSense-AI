import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StudyProgressChartProps {
  high: number;
  medium: number;
  low: number;
}

export default function StudyProgressChart({ high, medium, low }: StudyProgressChartProps) {
  const total = high + medium + low || 1;

  const data = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [high, medium, low],
      backgroundColor: ['rgba(244,63,94,0.85)', 'rgba(251,146,60,0.85)', 'rgba(34,211,238,0.85)'],
      borderColor: ['#f43f5e', '#fb923c', '#22d3ee'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(14,19,32,0.95)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} topic${ctx.raw !== 1 ? 's' : ''} (${Math.round((ctx.raw / total) * 100)}%)`,
        },
      },
    },
  };

  return <div style={{ height: 240 }}><Doughnut data={data} options={options} /></div>;
}
