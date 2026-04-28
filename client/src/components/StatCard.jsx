export default function StatCard({ title, value, label, accent = 'text-yellow-400', icon: Icon }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
      style={{ background: '#161616', border: '1px solid #222', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#EAB30840'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1e1e1e' }}>
          <Icon size={17} className={accent} />
        </div>
      )}
      <div>
        <div className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</div>
        <div className="text-sm text-zinc-400 mt-0.5">{title}</div>
        {label && <div className="text-xs text-zinc-600 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}
