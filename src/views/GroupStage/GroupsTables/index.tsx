import { Box } from '@chakra-ui/react';

import GroupTable from '@/components/GroupTable';
import { useGroupsStatsStore } from '@/store/groupsStats';
import { calculateOrderGroup } from '@/helpers/calculations';
import { Countries, GroupsNames } from '@/types';
import { useGroupsClasificationsStore } from '@/store/groupsClasifications';

function GroupsTables() {
  const groupsStats = useGroupsStatsStore((state) => state.groupsStats);
  const setGroupClasification = useGroupsClasificationsStore(
    (state) => state.setGroupClasification,
  );

  return (
    <>
      {Object.keys(groupsStats).map((group) => {
        const groupOrdered = calculateOrderGroup(groupsStats[group as GroupsNames]);
        setGroupClasification(group as GroupsNames, {
          first: Object.keys(groupOrdered[0])[0] as Countries,
          second: Object.keys(groupOrdered[1])[0] as Countries,
        });
        return (
          <Box
            key={`group-${group}`}
            bg="white"
            display="inline-block"
            borderRadius="10px"
            margin="5px"
          >
            <GroupTable teams={groupOrdered} />
          </Box>
        );
      })}
    </>
  );
}

export default GroupsTables;
