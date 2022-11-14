import { useEffect, useState } from 'react';
import { Box, Grid } from '@chakra-ui/react';
import { useFirestoreQuery } from '@react-query-firebase/firestore';
import { QueryDocumentSnapshot } from 'firebase/firestore';

import PlayoffsMatchPreview from '@/components/PlayoffPreview';
import { useGroupsClasificationsStore } from '@/store/groupsClasifications';
import { queryPlayoffs } from '@/services/queries';
import { Countries, GroupsNames, PlayoffsInfo } from '@/types';

function PlayoffsPreview() {
  const { data } = useFirestoreQuery(['playoffs'], queryPlayoffs);
  const groupsClasifications = useGroupsClasificationsStore((state) => state.groupsClasifications);
  const [matches, setMatches] = useState<Array<QueryDocumentSnapshot<PlayoffsInfo>>>([]);

  useEffect(() => {
    if (data) {
      setMatches(
        data.docs.filter(
          (match) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            ['49', '50', '51', '52', '53', '54', '55', '56'].includes(match.id),
          // eslint-disable-next-line function-paren-newline
        ),
      );
    }
  }, [data]);

  return (
    <>
      {matches.map((match) => {
        const matchData = match.data();
        const team1 =
          groupsClasifications[matchData.T1.group as GroupsNames][matchData.T1.position];
        const team2 =
          groupsClasifications[matchData.T2.group as GroupsNames][matchData.T2.position];
        return (
          <Box
            key={`playoffs-${match.id}`}
            bg="white"
            display="inline-block"
            borderRadius="10px"
            margin="5px"
          >
            <Grid width="400px" templateColumns="repeat(2, 1fr)" gap="5px" padding="5px">
              <PlayoffsMatchPreview
                key={`preview-${team1}`}
                position={`1${matchData.T1.group}`}
                team={team1 as Countries}
              />
              <PlayoffsMatchPreview
                key={`preview-${team2}`}
                position={`2${matchData.T2.group}`}
                team={team2 as Countries}
                reverse
              />
            </Grid>
          </Box>
        );
      })}
    </>
  );
}

export default PlayoffsPreview;
