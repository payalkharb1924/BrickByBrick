import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Send, Users, MessageSquare, CalendarCheck } from 'lucide-react';
import StatCard from '../StatCard';

const STATUS_COLORS = {
  Applied:               '#EAB308',
  'Referral Asked':      '#c084fc',
  'Interview Scheduled': '#4ade80',
  Rejected:              '#f87171',
  'No Response':         '#444',
};

export default function JobStats({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ background: '#161616', border: '1px solid #222' }}>
        <h2 className="text-sm font-semibold text-white mb-2">Stats</h2>
        <p className="text-zinc-500 text-sm">No applications yet. Start applying!</p>
      </div>
    );
  }

  const total = applications.length;
  const referralCount = applications.filter(a => a.referral).length;
  const interviews = applications.filter(a => a.status === 'Interview Scheduled').length;
  const responded = applications.filter(a => ['Interview Scheduled', 'Rejected'].includes(a.status)).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const statusCounts = {};
  for (const app of applications) statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Applied"   value={total}            accent="text-yellow-400" icon={Send} />
        <StatCard title="With Referral"   value={referralCount}    accent="text-yellow-400" icon={Users} />
        <StatCard title="Response Rate"   value={`${responseRate}%`} accent="text-yellow-400" icon={MessageSquare} />
        <StatCard title="Interviews"      value={interviews}       accent="text-yellow-400" icon={CalendarCheck} />
      </div>
      <div className="rounded-xl p-5" style={{ background: '#161616', border: '1px solid #222' }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Application Status Breakdown</h3>
        <PieChart width={300} height={220}>
          <Pie data={pieData} cx={140} cy={100} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {pieData.map(entry => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#444'} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', color: '#fff', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ color: '#888', fontSize: '12px' }} />
        </PieChart>
      </div>
    </div>
  );
}
