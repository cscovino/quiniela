import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Typography } from '@atoms/Typography';
import { bucketByLocalDay } from '@utils/points-history';

import './PointsChart.css';

export interface PointEntry {
  date: Date;
  points: number;
  cumulative?: number;
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
    chartAriaLabel: string;
    legendToggleAria: string;
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

    const seriesWithBuckets = colored.map((s) => {
      const bucket = bucketByLocalDay(s.data);
      const totalPoints = Array.from(bucket.values()).reduce((a, b) => a + b, 0);
      return { ...s, bucket, totalPoints };
    });

    const allDateKeys = [
      ...new Set(seriesWithBuckets.flatMap((s) => Array.from(s.bucket.keys()))),
    ].sort();

    const maxDelta = Math.max(
      ...seriesWithBuckets.flatMap((s) => Array.from(s.bucket.values())),
      0,
    );

    return { series: seriesWithBuckets, allDateKeys, maxDelta };
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

  const { series: chartSeries, allDateKeys, maxDelta } = processed;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getY = (pts: number) => padding.top + chartHeight - (pts / (maxDelta || 1)) * chartHeight;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxDelta / yTicks) * i),
  );

  const totalDays = allDateKeys.length;
  const slotWidth = chartWidth / (totalDays || 1);
  const seriesCount = chartSeries.length;
  const barWidth = Math.max(4, Math.min(20, (slotWidth * 0.8) / (seriesCount || 1)));

  const xTickCount = Math.min(totalDays, 5);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) => {
    const idx = xTickCount <= 1 ? 0 : Math.round((i / (xTickCount - 1)) * (totalDays - 1));
    return idx;
  });

  const handleLegendClick = (id: string) => {
    setHighlightedId((prev) => (prev === id ? null : id));
  };

  const handleChartClick = () => {
    setHighlightedId(null);
  };

  const totalPointsAcross = chartSeries.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalMatches = allDateKeys.length;

  return (
    <div className={`points-chart ${className}`}>
      <Typography variant="h4">{translations.title}</Typography>
      <div className="points-chart__container" onClick={handleChartClick}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="points-chart__svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label={translations.chartAriaLabel}
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

          {xTickIndices.map((idx) => {
            const dateKey = allDateKeys[idx];
            if (!dateKey) return null;
            const slotCenterX = padding.left + idx * slotWidth + slotWidth / 2;
            return (
              <text
                key={dateKey}
                x={slotCenterX}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="var(--font-body)"
              >
                {(() => {
                  const [y, m, d] = dateKey.split('-').map(Number);
                  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
                })()}
              </text>
            );
          })}

          {chartSeries.map((s, i) => {
            const isDimmed = highlightedId !== null && highlightedId !== s.id;
            const groupWidth = barWidth * seriesCount + 2 * (seriesCount - 1);
            return (
              <g
                key={s.id}
                className={`points-chart__bar-group ${isDimmed ? 'points-chart__bar-group--dimmed' : ''}`}
              >
                {allDateKeys.map((dateKey, d) => {
                  const points = s.bucket.get(dateKey) ?? 0;
                  if (points === 0) return null;
                  const slotCenterX = padding.left + d * slotWidth + slotWidth / 2;
                  const groupStartX = slotCenterX - groupWidth / 2;
                  const barX = groupStartX + i * (barWidth + 2);
                  const barHeight = (points / (maxDelta || 1)) * chartHeight;
                  const barY = padding.top + chartHeight - barHeight;
                  return (
                    <rect
                      key={dateKey}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={s.color}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLegendClick(s.id);
                      }}
                    />
                  );
                })}
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
              aria-label={translations.legendToggleAria.replace('{name}', s.name)}
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
