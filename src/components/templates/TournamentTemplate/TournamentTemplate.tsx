import React, { useEffect, useState } from 'react';
import { GroupStandings, type GroupStandingsProps } from '@organisms/GroupStandings/GroupStandings';
import { MatchList, type MatchListProps } from '@organisms/MatchList/MatchList';
import { Typography } from '@atoms/Typography/Typography';
import { Spinner } from '@atoms/Spinner/Spinner';
import { tournamentService } from '@services/tournament-service';
import type { Match, GroupStandings as FirestoreGroupStandings } from '@types/firestore';
import './TournamentTemplate.css';

type Tab = 'standings' | 'matches';

const PHASE_ORDER = [
  'group',
  'round-of-32',
  'round-of-16',
  'quarterfinals',
  'semifinals',
  'third-place',
  'final',
] as const;

const PHASE_LABELS: Record<string, { en: string; es: string }> = {
  group: { en: 'Group Stage', es: 'Fase de Grupos' },
  'round-of-32': { en: 'Round of 32', es: 'Treintaidosavos' },
  'round-of-16': { en: 'Round of 16', es: 'Octavos de Final' },
  quarterfinals: { en: 'Quarterfinals', es: 'Cuartos de Final' },
  semifinals: { en: 'Semifinals', es: 'Semifinales' },
  'third-place': { en: 'Third Place', es: 'Tercer Lugar' },
  final: { en: 'Final', es: 'Final' },
};

export interface TournamentTemplateProps {
  translations: {
    title: string;
    standingsTab: string;
    matchesTab: string;
    groupStageTitle: string;
    allMatchesTitle: string;
    noStandings: string;
    noMatches: string;
    matchList: MatchListProps['translations'];
  };
  locale?: 'en' | 'es';
  className?: string;
}

interface PhaseGroup {
  phase: string;
  label: string;
  matches: MatchListProps['matches'];
}

interface TournamentData {
  groups: GroupStandingsProps['groups'];
  phases: PhaseGroup[];
  loading: boolean;
  error: string | null;
}

const mapFirestoreStanding = (
  standing: FirestoreGroupStandings['standings'][0],
  teams: Record<string, { fifaCode: string; name: string }>,
): GroupStandingsProps['groups'][0]['standings'][0] => {
  const team = teams[standing.teamId] || {
    fifaCode: standing.teamId.toUpperCase(),
    name: standing.teamId,
  };
  return {
    teamId: standing.teamId,
    teamName: team.name,
    fifaCode: team.fifaCode,
    position: standing.position,
    played: standing.played,
    won: standing.won,
    drawn: standing.drawn,
    lost: standing.lost,
    goalsFor: standing.goalsFor,
    goalsAgainst: standing.goalsAgainst,
    points: standing.points,
  };
};

const mapMatchToCard = (
  match: Match & { id: string },
  teams: Record<string, { fifaCode: string; name: string }>,
): MatchListProps['matches'][0] => {
  const homeTeam = match.homeTeamId
    ? teams[match.homeTeamId] || {
        fifaCode: match.homeTeamId.toUpperCase(),
        name: match.homeTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };
  const awayTeam = match.awayTeamId
    ? teams[match.awayTeamId] || {
        fifaCode: match.awayTeamId.toUpperCase(),
        name: match.awayTeamId.toUpperCase(),
      }
    : { fifaCode: 'TBD', name: 'TBD' };

  return {
    homeTeam,
    awayTeam,
    date: match.date.toDate(),
    status: match.status,
    stadium: match.stadium,
    result:
      match.result.home !== null
        ? { home: match.result.home, away: match.result.away! }
        : undefined,
  };
};

export const TournamentTemplate: React.FC<TournamentTemplateProps> = ({
  translations,
  locale = 'en',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('standings');
  const [activePhase, setActivePhase] = useState<string>('group');
  const [data, setData] = useState<TournamentData>({
    groups: [],
    phases: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [standingsResult, matchesResult, teamsResult, groupsResult] =
          await Promise.allSettled([
            tournamentService.getGroupStandings(),
            tournamentService.getMatches(),
            tournamentService.getTeams(),
            tournamentService.getGroups(),
          ]);

        if (cancelled) return;

        const teamsMap: Record<string, { fifaCode: string; name: string }> = {};
        if (teamsResult.status === 'fulfilled') {
          teamsResult.value.forEach((t) => {
            teamsMap[t.fifaCode.toLowerCase()] = { fifaCode: t.fifaCode, name: t.name };
            teamsMap[t.fifaCode] = { fifaCode: t.fifaCode, name: t.name };
          });
        }

        const groupNames: Record<string, string> = {};
        const groupOrder: Record<string, number> = {};
        if (groupsResult.status === 'fulfilled') {
          const sortedGroups = [...groupsResult.value].sort((a, b) => a.order - b.order);
          for (const group of sortedGroups) {
            groupNames[group.slug] = group.name;
            groupOrder[group.slug] = group.order;
          }
        }

        const standingsMap: Record<string, FirestoreGroupStandings['standings']> = {};
        if (standingsResult.status === 'fulfilled') {
          for (const standing of standingsResult.value) {
            standingsMap[standing.groupId] = standing.standings;
          }
        }

        const groups: GroupStandingsProps['groups'] = [];
        if (teamsResult.status === 'fulfilled' && groupsResult.status === 'fulfilled') {
          const sortedGroups = [...groupsResult.value].sort((a, b) => a.order - b.order);

          for (const group of sortedGroups) {
            const groupName = group.name;
            const groupTeams = teamsResult.value
              .filter((t) => t.groupId === group.slug)
              .sort((a, b) => a.fifaCode.localeCompare(b.fifaCode));

            const existingStandings = standingsMap[group.slug];

            const standings: GroupStandingsProps['groups'][0]['standings'] = groupTeams.map(
              (team, index) => {
                if (existingStandings) {
                  const found = existingStandings.find(
                    (s) => s.teamId === team.fifaCode.toLowerCase(),
                  );
                  if (found) {
                    return mapFirestoreStanding(found, teamsMap);
                  }
                }
                return {
                  teamId: team.fifaCode.toLowerCase(),
                  teamName: team.name,
                  fifaCode: team.fifaCode,
                  position: index + 1,
                  played: 0,
                  won: 0,
                  drawn: 0,
                  lost: 0,
                  goalsFor: 0,
                  goalsAgainst: 0,
                  points: 0,
                };
              },
            );

            groups.push({ name: groupName, standings });
          }
        }

        const sortedMatches =
          matchesResult.status === 'fulfilled'
            ? matchesResult.value
                .map((m) => ({ ...m, id: m.slug }))
                .sort((a, b) => a.date.toMillis() - b.date.toMillis())
            : [];

        const phasesMap = new Map<string, Match[]>();
        for (const match of sortedMatches) {
          const phase = match.phase;
          if (!phasesMap.has(phase)) phasesMap.set(phase, []);
          phasesMap.get(phase)!.push(match);
        }

        const phases: PhaseGroup[] = [];
        for (const phase of PHASE_ORDER) {
          const phaseMatches = phasesMap.get(phase);
          if (phaseMatches && phaseMatches.length > 0) {
            phases.push({
              phase,
              label: PHASE_LABELS[phase]?.[locale === 'en' ? 'en' : 'es'] || phase,
              matches: phaseMatches.map((m) => mapMatchToCard(m, teamsMap)),
            });
          }
        }

        setData({
          groups,
          phases,
          loading: false,
          error:
            standingsResult.status === 'rejected' && matchesResult.status === 'rejected'
              ? 'Failed to load tournament data'
              : null,
        });
      } catch {
        if (!cancelled) {
          setData({ groups: [], phases: [], loading: false, error: 'Failed to load data' });
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <div className={`tournament-template ${className}`}>
      <main className="tournament-template__content">
        <header className="tournament-template__header">
          <Typography variant="h1">{translations.title}</Typography>
        </header>

        <div className="tournament-template__tabs">
          <button
            className={`tournament-template__tab ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            {translations.standingsTab}
          </button>
          <button
            className={`tournament-template__tab ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            {translations.matchesTab}
          </button>
        </div>

        {data.loading ? (
          <div className="tournament-template__loading">
            <Spinner size="lg" />
            <Typography variant="body">
              {locale === 'en' ? 'Loading tournament data...' : 'Cargando datos del torneo...'}
            </Typography>
          </div>
        ) : data.error ? (
          <div className="tournament-template__error">
            <Typography variant="body">{data.error}</Typography>
          </div>
        ) : activeTab === 'standings' ? (
          <section className="tournament-template__standings">
            <Typography variant="h2">{translations.groupStageTitle}</Typography>
            <GroupStandings
              groups={data.groups}
              translations={{
                noGroups: translations.noStandings,
                team: locale === 'en' ? 'Team' : 'Equipo',
                pts: 'Pts',
                qualified: locale === 'en' ? 'Qualified:' : 'Clasificados:',
              }}
            />
          </section>
        ) : (
          <section className="tournament-template__matches">
            {data.phases.length === 0 ? (
              <Typography variant="body">{translations.noMatches}</Typography>
            ) : (
              <>
                <div className="tournament-template__phase-tabs">
                  {data.phases.map((phase) => (
                    <button
                      key={phase.phase}
                      className={`tournament-template__phase-tab ${activePhase === phase.phase ? 'active' : ''}`}
                      onClick={() => setActivePhase(phase.phase)}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>
                {(() => {
                  const selected = data.phases.find((p) => p.phase === activePhase);
                  return selected ? (
                    <div className="tournament-template__phase">
                      <Typography variant="h3">{selected.label}</Typography>
                      <MatchList
                        matches={selected.matches}
                        translations={translations.matchList}
                        locale={locale}
                        emptyMessage={translations.noMatches}
                      />
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
