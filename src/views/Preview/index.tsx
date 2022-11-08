import { useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useFirestoreQuery } from '@react-query-firebase/firestore';
import { QuerySnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import i18next from 'i18next';

import { queryGroups } from '@/services/queries';
import { useGroupsStatsStore } from '@/store/groupsStats';
import { useGroupsClasificationsStore } from '@/store/groupsClasifications';
import { isGroupStatsOk } from '@/helpers/calculations';
import { GroupInfo, GroupsClasifications } from '@/types';

import GroupStats from './GroupStats';

import './i18n';

function Preview() {
  const navigate = useNavigate();
  const { data, isLoading } = useFirestoreQuery(['groups'], queryGroups);
  const groupsStats = useGroupsStatsStore((state) => state.groupsStats);
  const isStatsOk = isGroupStatsOk(groupsStats);

  useEffect(() => {
    if (!isStatsOk) {
      navigate('/');
    }
  }, [isStatsOk, navigate]);

  const setGroupsClasifications = useGroupsClasificationsStore(
    (state) => state.setGroupsClasification,
  );

  const onSubmit: SubmitHandler<GroupsClasifications> = (formData, event) => {
    event?.preventDefault();
    setGroupsClasifications(formData);
    navigate('/playoffs');
  };

  return (
    <Flex direction="column" alignItems="center" justify="center" width="100%">
      <Box
        fontFamily="qatar"
        fontSize="40px"
        textAlign="center"
        margin="40px"
        marginBottom="10px"
        color="#fee1d2"
      >
        {i18next.t<string>('PREVIEW:TITLE')}
      </Box>
      {isLoading || !data ? (
        <img
          src="https://media3.giphy.com/media/BmmfETghGOPrW/giphy.gif?cid=ecf05e47sdrhl7h9ruin2ymnq3799g51xzqmvl7g1iw9c3yx&amp;rid=giphy.gif&amp;ct=g"
          alt="Calculate Zach Galifianakis GIF"
        />
      ) : (
        <>
          <Box textAlign="center" fontFamily="qatar" fontSize="20px" margin="10px" color="#fee1d2">
            {i18next.t<string>('PREVIEW:SUBTITLE')}
          </Box>
          <GroupStats
            onSubmit={onSubmit}
            data={data as QuerySnapshot<GroupInfo>}
            stats={groupsStats}
          />
        </>
      )}
    </Flex>
  );
}

export default Preview;
