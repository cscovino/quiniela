import { Box } from '@chakra-ui/react';

import GroupTable from '@/components/GroupTable';
import { GroupsNames, GroupsOrdered } from '@/types';

function GroupsTables(props: { groupsOrdered: GroupsOrdered }) {
  const { groupsOrdered } = props;

  return (
    <>
      {Object.keys(groupsOrdered).map((group) => (
        <Box
          key={`group-${group}`}
          bg="white"
          display="inline-block"
          borderRadius="10px"
          margin="5px"
        >
          <GroupTable teams={groupsOrdered[group as GroupsNames]} />
        </Box>
      ))}
    </>
  );
}

export default GroupsTables;
