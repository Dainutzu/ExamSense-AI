import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Topic } from '../../lib/supabase';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopicFrequencyChartProps {
  topics: Topic[];
  height?: number;
}

export default function TopicFrequencyChart({ topics, height = 300 }: TopicFrequencyChartProps) {
  if (!topics || topics.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No topic data available
      </div>
    );
  }

  const sorted = [...topics].sort((a, b) => b.count - a.count).slice(0, 8);

  const bgColors = sorted.map(t =>
    t.priority === 'high'   ? 'rgba(244,63,94,0.8)'   :
    t.priority === 'medium' ? 'rgba(251,146,60,0.8)'  :
                              'rgba(34,211,238,0.8)'
  );
  const borderColors = sorted.map(t =>
    t.priority === 'high'   ? '#f43f5e' :
    t.priority === 'medium' ? '#fb923c' :
                              '#22d3ee'
  );

  const data = {
    labels: sorted.map(t => t.name.length > 22 ? t.name.slice(0, 22) + '…' : t.name),
    datasets: [{
      label: 'Times Appeared',
      data: sorted.map(t => t.count),
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options: any = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(14,19,32,0.95)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: (ctx: any) => ` Appeared ${ctx.raw} time${ctx.raw !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', font: { size: 12 } },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 } },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
