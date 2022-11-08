import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useFirestoreQuery } from '@react-query-firebase/firestore';
import { QuerySnapshot } from 'firebase/firestore';
import { SubmitHandler } from 'react-hook-form';
import i18next from 'i18next';

import { useGroupsStatsStore } from '@/store/groupsStats';
import { useGroupsResultsStore } from '@/store/groupsResults';
import { queryGroups } from '@/services/queries';
import { calculateGroup } from '@/helpers/calculations';
import { GroupStageValues, GroupInfo, GroupsNames, Matches } from '@/types';

import Form from './Form';
import './i18n';

function GroupStage() {
  const navigate = useNavigate();
  const { data, isLoading } = useFirestoreQuery(['groups'], queryGroups);
  const setGroupStats = useGroupsStatsStore((state) => state.setGroupStats);
  const setGroupResults = useGroupsResultsStore((state) => state.setGroupResults);

  const onSubmit: SubmitHandler<GroupStageValues> = (formData, event) => {
    event?.preventDefault();
    Object.keys(formData).forEach((groupName) => {
      const matches = data?.docs.find((doc) => doc.id === groupName)?.data().matches as Matches;
      const groupResults = calculateGroup(groupName as GroupsNames, matches, formData);
      setGroupStats(groupName as GroupsNames, groupResults);
      setGroupResults(formData[groupName as GroupsNames]);
    });
    navigate('/group-stage/preview');
  };

  return (
    <Flex direction="column" alignItems="center" justify="center" width="100%">
      <Box textAlign="center" fontFamily="qatar" fontSize="40px" margin="40px" color="#fee1d2">
        {i18next.t<string>('GROUPS:TITLE')}
      </Box>
      {isLoading || !data ? (
        <Spinner thickness="5px" speed="0.8s" emptyColor="#fa5d84" color="#fee1d2" size="xl" />
      ) : (
        <Form onSubmit={onSubmit} data={data as QuerySnapshot<GroupInfo>} />
      )}
    </Flex>
  );
}

export default GroupStage;
