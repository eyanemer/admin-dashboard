import React from 'react';

/**
 * Composant pour afficher des indicateurs de performance (KPI).
 */
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-muted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-dark">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 ${trend === 'up' ? 'text-success' : 'text-danger'} font-medium`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue} <span className="text-muted font-normal">vs mois dernier</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-${color}-light text-${color}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatCard;
