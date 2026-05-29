import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Typography } from '@atoms/Typography';

import './PointsChart.css';

export interface PointEntry {
  date: Date;
  points: number;
  cumulative: number;
  matchId?: string;
}

export interface PredictorSeries {
  id: string;
  name: string;
  color: string;
  data: PointEntry[];
}

export interface PointsChartProps {
  series: PredictorSeries[];
  translations: {
    title: string;
    noData: string;
    points: string;
    matches: string;
  };
  className?: string;
}

const CHART_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#A29BFE', '#FD79A8'];

function assignColors(seriesList: PredictorSeries[]): PredictorSeries[] {
  return seriesList.map((s, i) => ({
    ...s,
    color: s.color || CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export const PointsChart: FC<PointsChartProps> = ({ series, translations, className = '' }) => {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const processed = useMemo(() => {
    if (series.length === 0) return null;

    const colored = assignColors(series);

    const withCumulative = colored.map((s) => {
      const sorted = [...s.data].sort((a, b) => a.date.getTime() - b.date.getTime());
      const cumulative: PointEntry[] = [];
      let total = 0;
      for (const entry of sorted) {
        total += entry.points;
        cumulative.push({ ...entry, cumulative: total });
      }
      return { ...s, data: cumulative, totalPoints: total };
    });

    const allDates = withCumulative.flatMap((s) => s.data.map((e) => e.date.getTime()));
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);
    const dateRange = maxDate - minDate || 1;

    const maxPoints = Math.max(
      ...withCumulative.flatMap((s) => s.data.map((e) => e.cumulative)),
      0,
    );

    return { series: withCumulative, minDate, dateRange, maxPoints };
  }, [series]);

  if (!processed || processed.series.every((s) => s.data.length === 0)) {
    return (
      <div className={`points-chart ${className}`}>
        <Typography variant="h4">{translations.title}</Typography>
        <div className="points-chart__empty">
          <Typography variant="body">{translations.noData}</Typography>
        </div>
      </div>
    );
  }

  const { series: chartSeries, minDate, dateRange, maxPoints } = processed;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (date: Date) => padding.left + ((date.getTime() - minDate) / dateRange) * chartWidth;

  const getY = (pts: number) => padding.top + chartHeight - (pts / (maxPoints || 1)) * chartHeight;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxPoints / yTicks) * i),
  );

  const allPoints = chartSeries.flatMap((s) => s.data);
  const xTickCount = Math.min(allPoints.length, 5);
  const uniqueDates = [...new Set(allPoints.map((p) => p.date.getTime()))].sort((a, b) => a - b);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i / (xTickCount - 1)) * (uniqueDates.length - 1));
    return uniqueDates[idx];
  });

  const handleLegendClick = (id: string) => {
    setHighlightedId((prev) => (prev === id ? null : id));
  };

  const handleChartClick = () => {
    setHighlightedId(null);
  };

  const totalPointsAcross = chartSeries.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalMatches = allPoints.length;

  return (
    <div className={`points-chart ${className}`}>
      <Typography variant="h4">{translations.title}</Typography>
      <div className="points-chart__container" onClick={handleChartClick}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="points-chart__svg"
          preserveAspectRatio="xMidYMid meet"
        >
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

          {xTickIndices.map((ts) => {
            const date = new Date(ts);
            return (
              <text
                key={ts}
                x={getX(date)}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="var(--font-body)"
              >
                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            );
          })}

          {chartSeries.map((s) => {
            const isDimmed = highlightedId !== null && highlightedId !== s.id;
            return (
              <g
                key={s.id}
                className={`points-chart__line-group ${isDimmed ? 'points-chart__line-group--dimmed' : ''}`}
              >
                <path
                  d={s.data
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.date)} ${getY(p.cumulative)}`)
                    .join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                />
                {s.data.map((p, i) => (
                  <circle
                    key={i}
                    cx={getX(p.date)}
                    cy={getY(p.cumulative)}
                    r="3"
                    fill="var(--bg-card)"
                    stroke={s.color}
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="points-chart__legend">
        {chartSeries.map((s) => {
          const isDimmed = highlightedId !== null && highlightedId !== s.id;
          const isActive = highlightedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`points-chart__legend-item ${isDimmed ? 'points-chart__legend-item--dimmed' : ''} ${isActive ? 'points-chart__legend-item--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLegendClick(s.id);
              }}
              aria-label={`Toggle highlight for ${s.name}`}
            >
              <span className="points-chart__legend-swatch" style={{ backgroundColor: s.color }} />
              <span className="points-chart__legend-name">{s.name}</span>
              <span className="points-chart__legend-value">{s.totalPoints}</span>
            </button>
          );
        })}
      </div>

      <div className="points-chart__summary">
        <span className="points-chart__stat">
          <Typography variant="small">{translations.points}:</Typography>
          <Typography variant="small" className="points-chart__value">
            {totalPointsAcross}
          </Typography>
        </span>
        <span className="points-chart__stat">
          <Typography variant="small">{translations.matches}:</Typography>
          <Typography variant="small" className="points-chart__value">
            {totalMatches}
          </Typography>
        </span>
      </div>
    </div>
  );
};
