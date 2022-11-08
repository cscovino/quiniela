import { Box, Flex, Grid } from '@chakra-ui/react';

import { useState } from 'react';
import PlayoffTeamInput from '@/components/PlayoffTeamInput';

import { PlayoffsMatchProps } from './types';
import { Countries } from '@/types';

function PlayoffInput(props: PlayoffsMatchProps) {
  const { teams, match, date, setPlayoffsTeam, setFinalPosition } = props;
  const [team1, team2] = teams;

  const [teamSelected, setTeamSelected] = useState<Countries | undefined>();

  const onClick = (team: Countries) => {
    setTeamSelected(team);
    if (['61', '62'].includes(match)) {
      setPlayoffsTeam(`P${match}`, team === team1 ? team2 : team1);
      setPlayoffsTeam(match, team);
    } else if (match === 'FINAL') {
      setFinalPosition('first', team);
      setFinalPosition('second', team === team1 ? team2 : team1);
    } else if (match === 'BRONZE') {
      setFinalPosition('third', team);
      setFinalPosition('fourth', team === team1 ? team2 : team1);
    } else {
      setPlayoffsTeam(match, team);
    }
  };

  return (
    <Flex width="100%" direction="column" justify="center">
      <Box textAlign="center" fontFamily="qatar" fontSize="12px">
        {date.toDate().toLocaleString('es-ES', {
          weekday: 'short',
          year: '2-digit',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })}
      </Box>
      <Grid width="100%" templateColumns="repeat(2, 1fr)" gap="5px" paddingY="5px">
        {teams.map((team, index) => (
          <PlayoffTeamInput
            key={`${match}.${team1}-${team2}.${team}`}
            team={team}
            reverse={index > 0}
            teamSelected={teamSelected}
            onClick={() => onClick(team)}
          />
        ))}
      </Grid>
    </Flex>
  );
}

export default PlayoffInput;
