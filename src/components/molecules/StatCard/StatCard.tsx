import React from 'react';
import { Typography } from '@atoms/Typography/Typography';
import { Icon, type IconName } from '@atoms/Icon/Icon';
import './StatCard.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: IconName;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend = 'neutral',
  className = '',
}) => {
  const trendIcon: IconName | undefined =
    trend === 'up' ? 'chart' : trend === 'down' ? 'chart' : undefined;
  const trendClass =
    trend === 'up' ? 'stat-card__trend--up' : trend === 'down' ? 'stat-card__trend--down' : '';

  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card__header">
        {icon && <Icon name={icon} size={20} />}
        <Typography variant="small" className="stat-card__label">
          {label}
        </Typography>
      </div>
      <div className={`stat-card__value ${trendClass}`}>
        <Typography variant="h2">{value}</Typography>
        {trendIcon && <Icon name={trendIcon} size={16} />}
      </div>
    </div>
  );
};
