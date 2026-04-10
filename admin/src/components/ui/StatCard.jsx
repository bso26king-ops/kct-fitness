export default function StatCard({ icon, label, value, trend, trendLabel }) {
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-text-secondary';

  return (
    <div className="bg-card p-6 rounded-lg border border-secondary">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-2">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {trendLabel && <p className="text-xs text-text-secondary mt-2">{trendLabel}</p>}
    </div>
  );
}
