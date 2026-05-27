import type { FC } from 'react';
import { useMemo } from 'react';

import { Typography } from '@atoms/Typography';

import './PointsChart.css';

export interface PointEntry {
  date: Date;
  points: number;
  cumulative: number;
  matchId?: string;
}

export interface PointsChartProps {
  data: PointEntry[];
  translations: {
    title: string;
    noData: string;
    points: string;
    matches: string;
  };
  className?: string;
}

export const PointsChart: FC<PointsChartProps> = ({ data, translations, className = '' }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

    const points = sorted.reduce(
      (acc, entry) => {
        const cumulative =
          acc.length > 0 ? acc[acc.length - 1].cumulative + entry.points : entry.points;
        acc.push({ ...entry, cumulative });
        return acc;
      },
      [] as Array<PointEntry & { cumulative: number }>,
    );

    const maxPoints = Math.max(...points.map((p) => p.cumulative), 0);
    const minDate = points[0].date.getTime();
    const maxDate = points[points.length - 1].date.getTime();
    const dateRange = maxDate - minDate || 1;

    return { points, maxPoints, minDate, dateRange };
  }, [data]);

  if (!chartData || chartData.points.length === 0) {
    return (
      <div className={`points-chart ${className}`}>
        <Typography variant="h4">{translations.title}</Typography>
        <div className="points-chart__empty">
          <Typography variant="body">{translations.noData}</Typography>
        </div>
      </div>
    );
  }

  const { points, maxPoints, minDate, dateRange } = chartData;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (date: Date) => {
    return padding.left + ((date.getTime() - minDate) / dateRange) * chartWidth;
  };

  const getY = (pts: number) => {
    return padding.top + chartHeight - (pts / (maxPoints || 1)) * chartHeight;
  };

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.date)} ${getY(p.cumulative)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(points[points.length - 1].date)} ${padding.top + chartHeight} L ${getX(points[0].date)} ${padding.top + chartHeight} Z`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxPoints / yTicks) * i),
  );

  const xTickCount = Math.min(points.length, 5);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / (xTickCount - 1)) * (points.length - 1)),
  );

  return (
    <div className={`points-chart ${className}`}>
      <Typography variant="h4">{translations.title}</Typography>
      <div className="points-chart__container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="points-chart__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {yTickValues.map((val) => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="var(--border-color)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 8}
                y={getY(val) + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="var(--font-body)"
              >
                {val}
              </text>
            </g>
          ))}

          {xTickIndices.map((idx) => {
            const point = points[idx];
            return (
              <text
                key={idx}
                x={getX(point.date)}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="var(--font-body)"
              >
                {point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            );
          })}

          <path d={areaD} fill="url(#pointsGradient)" />
          <path d={pathD} fill="none" stroke="var(--color-accent-500)" strokeWidth="2" />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={getX(p.date)}
              cy={getY(p.cumulative)}
              r="4"
              fill="var(--bg-card)"
              stroke="var(--color-accent-500)"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
      <div className="points-chart__summary">
        <span className="points-chart__stat">
          <Typography variant="small">{translations.points}:</Typography>
          <Typography variant="small" className="points-chart__value">
            {points.reduce((sum, p) => sum + p.points, 0)}
          </Typography>
        </span>
        <span className="points-chart__stat">
          <Typography variant="small">{translations.matches}:</Typography>
          <Typography variant="small" className="points-chart__value">
            {points.length}
          </Typography>
        </span>
      </div>
    </div>
  );
};
