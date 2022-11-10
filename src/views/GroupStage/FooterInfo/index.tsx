import { useEffect, useState } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import i18next from 'i18next';

import { useGroupsStatsStore } from '@/store/groupsStats';
import { useGroupsClasificationsStore } from '@/store/groupsClasifications';
import { calculateOrderGroup } from '@/helpers/calculations';
import { Countries, GroupsNames, GroupsOrdered } from '@/types';

import PlayoffsPreview from '../PlayoffsPreview';
import GroupsTables from '../GroupsTables';

import { FooterInfoProps } from './types';

function FooterInfo(props: FooterInfoProps) {
  const { showTable, onClick } = props;
  const groupsStats = useGroupsStatsStore((state) => state.groupsStats);
  const setGroupClasification = useGroupsClasificationsStore(
    (state) => state.setGroupClasification,
  );
  const [groupsOrdered, setGroupsOrdered] = useState<GroupsOrdered>({
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    G: [],
    H: [],
  });

  useEffect(() => {
    Object.keys(groupsStats).forEach((group) => {
      const groupOrdered = calculateOrderGroup(groupsStats[group as GroupsNames]);
      setGroupClasification(group as GroupsNames, {
        first: Object.keys(groupOrdered[0])[0] as Countries,
        second: Object.keys(groupOrdered[1])[0] as Countries,
      });
      setGroupsOrdered((prev) => ({ ...prev, [group]: groupOrdered }));
    });
  }, [groupsStats, setGroupsOrdered, setGroupClasification]);

  return (
    <Flex
      bg="#fee1d2"
      direction="column"
      position="fixed"
      bottom={0}
      width="inherit"
      overflowX="auto"
      padding="5px"
    >
      <Button
        position="fixed"
        alignSelf="center"
        width="fit-content"
        onClick={onClick}
        fontFamily="qatar"
        bg="#720626"
        color="#fee1d2"
        _hover={{ bg: '#fa5d84' }}
        _active={{ bg: '#fa5d84' }}
      >
        {i18next.t<string>(`GROUPS:BUTTON_${showTable ? 'TABLES' : 'PLAYOFFS'}`)}
      </Button>
      <Flex direction="row" overflow="auto" marginTop="40px">
        {showTable ? <GroupsTables groupsOrdered={groupsOrdered} /> : <PlayoffsPreview />}
      </Flex>
    </Flex>
  );
}

export default FooterInfo;
