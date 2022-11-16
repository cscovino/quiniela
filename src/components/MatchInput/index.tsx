import { Box, Flex, Grid } from '@chakra-ui/react';

import TeamInput from '@/components/TeamInput';

import { MatchProps } from './types';

function MatchInput(props: MatchProps) {
  const { teams, group, date } = props;
  const [team1, team2] = teams;

  return (
    <Flex width="100%" direction="column" justify="center">
      <Box textAlign="center" fontFamily="qatar" fontSize="12px">
        {date.toDate().toLocaleString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })}
      </Box>
      <Grid width="100%" templateColumns="repeat(2, 1fr)" gap="5px" paddingY="5px">
        {teams.map((team, index) => (
          <TeamInput
            key={`${group}.${team1}-${team2}.${team}`}
            team={team}
            reverse={index > 0}
            inputLabel={`${group}.${team1}-${team2}.${team}`}
          />
        ))}
      </Grid>
    </Flex>
  );
}

export default MatchInput;
