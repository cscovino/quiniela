import { Box, GridItem, SimpleGrid } from '@chakra-ui/react';
import { QuerySnapshot } from 'firebase/firestore';
import shallow from 'zustand/shallow';
import i18next from 'i18next';

import PlayoffInput from '@/components/PlayoffInput';
import { usePlayoffsMatchesStore } from '@/store/playoffsMatches';
import { useFinalPositionsStore } from '@/store/finalPositions';
import {
  Countries,
  GroupsNames,
  PlayoffsInfo,
  GroupsClasifications,
  PlayoffsMatches,
  FinalPositions,
} from '@/types';

import { PlayoffsFixturesProps } from './types';

const renderFixtures = (
  matches: QuerySnapshot<PlayoffsInfo>,
  groupsClasifications: GroupsClasifications,
  playoffsMatches: PlayoffsMatches,
  setPlayoffsTeam: (match: string, team: Countries) => void,
  setFinalPosition: (position: keyof FinalPositions, team: Countries) => void,
) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  matches.docs.map((match) => {
    const matchData = match.data();
    const team1 = matchData.T1.group
      ? groupsClasifications[matchData.T1.group as GroupsNames][matchData.T1.position]
      : playoffsMatches[match.id].T1;
    const team2 = matchData.T2.group
      ? groupsClasifications[matchData.T2.group as GroupsNames][matchData.T2.position]
      : playoffsMatches[match.id].T2;
    return (
      <GridItem
        bg="white"
        colSpan={1}
        paddingY="10px"
        paddingX="15px"
        display="grid"
        justifyContent="space-around"
        width="fit-content"
        borderRadius="10px"
        key={`match-key-${match.id}`}
      >
        <Box color="#961e34" fontFamily="qatar" textAlign="center" paddingBottom="5px">
          {`${i18next.t<string>('PLAYOFFS:MATCH')} ${i18next.t<string>(`PLAYOFFS:${match.id}`)}`}
        </Box>
        <PlayoffInput
          key={match.id}
          teams={[team1, team2] as Array<Countries>}
          match={match.id}
          date={matchData.date}
          setPlayoffsTeam={setPlayoffsTeam}
          setFinalPosition={setFinalPosition}
        />
      </GridItem>
    );
  });

function PlayoffsFixtures({ data, groupsClasifications }: PlayoffsFixturesProps) {
  const playoffsMatches = usePlayoffsMatchesStore((state) => state.playoffsMatches, shallow);
  const setPlayoffsTeam = usePlayoffsMatchesStore((state) => state.setPlayoffsTeam);
  const setFinalPosition = useFinalPositionsStore((state) => state.setFinalPosition);

  return (
    <SimpleGrid columns={[1, 1, 2, 2, 3]} gap="40px" justifyItems="center">
      {renderFixtures(
        data,
        groupsClasifications,
        playoffsMatches,
        setPlayoffsTeam,
        setFinalPosition,
      )}
    </SimpleGrid>
  );
}

export default PlayoffsFixtures;
