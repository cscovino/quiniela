import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

import { Icon } from '@atoms/Icon';
import { PixelArt } from '@atoms/PixelArt';
import { Typography } from '@atoms/Typography';
import { TeamFlag } from '@molecules/TeamFlag';
import type { TodayMatchBet } from './RankingsTable';

// ─── Mock match predictions by day (finished days last) ─────────────

interface DayGroup {
  label: string;
  date: string;
  finished: boolean;
  bets: TodayMatchBet[];
}

const MOCK_DAYS: DayGroup[] = [
  // Upcoming / in-progress days first
  {
    label: 'Jornada 4',
    date: '23 Jun 2026',
    finished: false,
    bets: [
      { matchId: 'c1', homeTeam: 'ESP', awayTeam: 'POR', homeScore: 2, awayScore: 2, status: 'scheduled' },
      { matchId: 'c2', homeTeam: 'FRA', awayTeam: 'GER', homeScore: 1, awayScore: 0, status: 'scheduled' },
      { matchId: 'd1', homeTeam: 'ENG', awayTeam: 'ITA', homeScore: 1, awayScore: 1, status: 'scheduled' },
      { matchId: 'd2', homeTeam: 'NED', awayTeam: 'BEL', homeScore: 2, awayScore: 1, status: 'scheduled' },
    ],
  },
  {
    label: 'Jornada 3',
    date: '19 Jun 2026',
    finished: false,
    bets: [
      { matchId: 'a5', homeTeam: 'MEX', awayTeam: 'CRC', homeScore: 3, awayScore: 0, status: 'scheduled' },
      { matchId: 'a6', homeTeam: 'CAN', awayTeam: 'USA', homeScore: 0, awayScore: 1, status: 'scheduled' },
      { matchId: 'b5', homeTeam: 'ARG', awayTeam: 'PAR', homeScore: 2, awayScore: 0, status: 'scheduled' },
      { matchId: 'b6', homeTeam: 'CHI', awayTeam: 'URU', homeScore: 0, awayScore: 1, status: 'scheduled' },
    ],
  },
  // Finished days after
  {
    label: 'Jornada 2',
    date: '15 Jun 2026',
    finished: true,
    bets: [
      { matchId: 'a3', homeTeam: 'MEX', awayTeam: 'USA', homeScore: 1, awayScore: 1, status: 'finished', actualHome: 1, actualAway: 1, isExact: true, isWinner: true },
      { matchId: 'a4', homeTeam: 'CRC', awayTeam: 'CAN', homeScore: 0, awayScore: 2, status: 'finished', actualHome: 0, actualAway: 2, isExact: true, isWinner: true },
      { matchId: 'b3', homeTeam: 'ARG', awayTeam: 'URU', homeScore: 2, awayScore: 1, status: 'finished', actualHome: 2, actualAway: 1, isExact: true, isWinner: true },
      { matchId: 'b4', homeTeam: 'PAR', awayTeam: 'CHI', homeScore: 1, awayScore: 0, status: 'finished', actualHome: 2, actualAway: 2, isExact: false, isWinner: false },
    ],
  },
  {
    label: 'Jornada 1',
    date: '11 Jun 2026',
    finished: true,
    bets: [
      { matchId: 'a1', homeTeam: 'MEX', awayTeam: 'CAN', homeScore: 2, awayScore: 0, status: 'finished', actualHome: 2, actualAway: 0, isExact: true, isWinner: true },
      { matchId: 'a2', homeTeam: 'USA', awayTeam: 'CRC', homeScore: 3, awayScore: 1, status: 'finished', actualHome: 3, actualAway: 0, isExact: false, isWinner: true },
      { matchId: 'b1', homeTeam: 'ARG', awayTeam: 'CHI', homeScore: 1, awayScore: 1, status: 'finished', actualHome: 2, actualAway: 0, isExact: false, isWinner: false },
      { matchId: 'b2', homeTeam: 'URU', awayTeam: 'PAR', homeScore: 2, awayScore: 0, status: 'finished', actualHome: 2, actualAway: 0, isExact: true, isWinner: true },
    ],
  },
];

// ─── Mock group standings predictions ───────────────────────────────

interface GroupStandingPrediction {
  groupName: string;
  positions: { fifaCode: string; name: string; predictedPos: number }[];
}

const MOCK_GROUP_STANDINGS: GroupStandingPrediction[] = [
  {
    groupName: 'Grupo A',
    positions: [
      { fifaCode: 'MEX', name: 'México', predictedPos: 1 },
      { fifaCode: 'USA', name: 'Estados Unidos', predictedPos: 2 },
      { fifaCode: 'CAN', name: 'Canadá', predictedPos: 3 },
      { fifaCode: 'CRC', name: 'Costa Rica', predictedPos: 4 },
    ],
  },
  {
    groupName: 'Grupo B',
    positions: [
      { fifaCode: 'ARG', name: 'Argentina', predictedPos: 1 },
      { fifaCode: 'URU', name: 'Uruguay', predictedPos: 2 },
      { fifaCode: 'CHI', name: 'Chile', predictedPos: 3 },
      { fifaCode: 'PAR', name: 'Paraguay', predictedPos: 4 },
    ],
  },
  {
    groupName: 'Grupo C',
    positions: [
      { fifaCode: 'ESP', name: 'España', predictedPos: 1 },
      { fifaCode: 'POR', name: 'Portugal', predictedPos: 2 },
      { fifaCode: 'FRA', name: 'Francia', predictedPos: 3 },
      { fifaCode: 'GER', name: 'Alemania', predictedPos: 4 },
    ],
  },
  {
    groupName: 'Grupo D',
    positions: [
      { fifaCode: 'ENG', name: 'Inglaterra', predictedPos: 1 },
      { fifaCode: 'NED', name: 'Países Bajos', predictedPos: 2 },
      { fifaCode: 'ITA', name: 'Italia', predictedPos: 3 },
      { fifaCode: 'BEL', name: 'Bélgica', predictedPos: 4 },
    ],
  },
];

// ─── Mock final phase predictions ───────────────────────────────────

interface KnockoutMatchPrediction {
  label: string;
  home: string;
  away: string;
  winner: string;
  result?: string;
}

const MOCK_KNOCKOUT: KnockoutMatchPrediction[] = [
  { label: '32avos', home: 'MEX', away: 'PAR', winner: 'MEX', result: '2-0' },
  { label: '32avos', home: 'URU', away: 'CRC', winner: 'URU', result: '1-0' },
  { label: '32avos', home: 'ESP', away: 'CHI', winner: 'ESP', result: '3-1' },
  { label: '32avos', home: 'ENG', away: 'CAN', winner: 'ENG', result: '2-0' },
  { label: '16avos', home: 'MEX', away: 'URU', winner: 'MEX', result: '1-1 (4-2 p)' },
  { label: '16avos', home: 'ESP', away: 'ENG', winner: 'ESP', result: '2-1' },
  { label: 'Cuartos', home: 'MEX', away: 'ESP', winner: 'ESP', result: '0-1' },
  { label: 'Semis', home: 'ESP', away: 'ARG', winner: 'ESP' },
  { label: 'Final', home: 'ESP', away: 'BRA', winner: 'ESP' },
];

// ─── Mock best players predictions ──────────────────────────────────

const MOCK_BEST_PLAYERS = {
  bestScorer: 'Kylian Mbappé',
  bestGoalkeeper: 'Emiliano Martínez',
  bestPlayer: 'Lamine Yamal',
  youngPlayer: 'Lamine Yamal',
};

// ─── Result helper ──────────────────────────────────────────────────

function getResultClass(bet: TodayMatchBet): string {
  if (bet.status !== 'finished') return '';
  if (bet.isExact) return 'correct';
  if (bet.isWinner) return 'partial';
  return 'wrong';
}

const BetTag: FC<{ bet: TodayMatchBet }> = ({ bet }) => {
  const cls = getResultClass(bet);
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '1px 8px', fontSize: 11,
        border: '2px solid var(--border-color)',
        background: 'var(--bg-card)',
        ...(cls === 'correct' ? { borderColor: 'var(--color-success)', color: 'var(--color-success)' } : {}),
        ...(cls === 'partial' ? { borderColor: 'var(--color-warning)', color: 'var(--color-warning)' } : {}),
        ...(cls === 'wrong' ? { borderColor: 'var(--color-error)', color: 'var(--color-error)', opacity: 0.7 } : {}),
      }}
      title={cls === 'correct' ? 'Exact!' : cls === 'partial' ? 'Winner correct' : cls === 'wrong' ? 'Wrong' : 'Scheduled'}
    >
      <TeamFlag fifaCode={bet.homeTeam} size="sm" />
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{bet.homeScore}-{bet.awayScore}</span>
      <TeamFlag fifaCode={bet.awayTeam} size="sm" />
    </span>
  );
};

// ─── Section card wrapper ───────────────────────────────────────────

const Section: FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div style={{
    padding: '12px 16px', background: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Icon name={icon as any} size={16} />
      <Typography variant="h4">{title}</Typography>
    </div>
    {children}
  </div>
);

// ─── Main story component ───────────────────────────────────────────

const SummaryCard: FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 860, fontFamily: 'var(--font-body)' }}>

    {/* 1. Predictor header */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: 'var(--bg-card)',
      border: '2px solid var(--border-color)',
    }}>
      <PixelArt name="medal-gold" size={28} animated />
      <div style={{ fontWeight: 'bold', fontSize: 14 }}>María García</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span><Icon name="star" size={14} /> 120 pts</span>
        <span><Icon name="target" size={14} /> 85%</span>
        <span><Icon name="fire" size={14} /> 7</span>
      </div>
    </div>

    {/* 2. Match predictions — grouped by day, finished days at the end */}
    <Section title="Predicciones de Partidos" icon="calendar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_DAYS.map((day) => (
          <div key={day.date}>
            {/* Day label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              fontFamily: 'var(--font-pixel)', fontSize: 10, textTransform: 'uppercase',
              color: day.finished ? 'var(--text-tertiary)' : 'var(--color-accent)',
            }}>
              {day.finished
                ? <span style={{ color: 'var(--color-success)' }}><Icon name="check" size={12} /></span>
                : <Icon name="clock" size={12} />
              }
              <span>{day.label} — {day.date}</span>
              {day.finished && <span style={{ color: 'var(--color-success)', fontSize: 9 }}>✓ Finalizado</span>}
            </div>
            {/* Bets row — horizontally scrollable */}
            <div style={{ display: 'flex', gap: 6, paddingLeft: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {day.bets.map((bet) => (
                <BetTag key={bet.matchId} bet={bet} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>

    {/* 3. Group standings predictions */}
    <Section title="Clasificación de Grupos" icon="chart">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {MOCK_GROUP_STANDINGS.map((group) => (
          <div key={group.groupName}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', marginBottom: 6, color: 'var(--text-tertiary)' }}>
              {group.groupName}
            </div>
            {group.positions.map((t) => (
              <div key={t.fifaCode} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', fontSize: 12 }}>
                <span style={{ width: 16, textAlign: 'right', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>{t.predictedPos}º</span>
                <TeamFlag fifaCode={t.fifaCode} size="sm" />
                <span>{t.name}</span>
                {t.predictedPos <= 2 && <Icon name="chevron-up" size={10} style={{ color: 'var(--color-success)' }} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>

    {/* 4. Final phase predictions */}
    <Section title="Fase Final" icon="trophy">
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
        {MOCK_KNOCKOUT.map((m, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 12px', fontSize: 11,
            border: '2px solid var(--border-color)', background: 'var(--bg-surface)',
            minWidth: 90, flexShrink: 0,
          }}>
            <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-pixel)' }}>{m.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <TeamFlag fifaCode={m.home} size="sm" />
              <span style={{ fontWeight: m.winner === m.home ? 'bold' : 'normal' }}>
                {m.result ?? 'vs'}
              </span>
              <TeamFlag fifaCode={m.away} size="sm" />
            </div>
            {!m.result && m.winner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, color: 'var(--color-accent)' }}>
                <Icon name="chevron-right" size={10} />
                <TeamFlag fifaCode={m.winner} size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: 8,
        background: 'var(--color-accent-100, #fff3bf)',
        border: '2px solid var(--color-accent)',
      }}>
        <Icon name="star" size={16} />
        <span style={{ fontSize: 12, fontWeight: 'bold' }}>Campeón:</span>
        <TeamFlag fifaCode="ESP" size="sm" />
        <span style={{ fontSize: 12 }}>España</span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Sub: BRA · 3º: ARG</span>
      </div>
    </Section>

    {/* 5. Best players predictions */}
    <Section title="Mejores Jugadores" icon="award">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, fontSize: 12 }}>
        {[
          { label: 'Goleador', value: MOCK_BEST_PLAYERS.bestScorer },
          { label: 'Mejor Jugador', value: MOCK_BEST_PLAYERS.bestPlayer },
          { label: 'Mejor Arquero', value: MOCK_BEST_PLAYERS.bestGoalkeeper },
          { label: 'Jugador Joven', value: MOCK_BEST_PLAYERS.youngPlayer },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>{item.label}:</span>
            <span style={{ fontWeight: 'bold' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </Section>
  </div>
);

// ─── Stories ────────────────────────────────────────────────────────

const meta = {
  title: 'Conceptos/PredictorSummary',
  component: SummaryCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
