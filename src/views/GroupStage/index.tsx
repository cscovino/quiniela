import { useState } from 'react';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useFirestoreQuery } from '@react-query-firebase/firestore';
import { QuerySnapshot } from 'firebase/firestore';
import { SubmitHandler } from 'react-hook-form';
import i18next from 'i18next';

import { useGroupsResultsStore } from '@/store/groupsResults';
import { queryGroups } from '@/services/queries';
import { GroupStageValues, GroupInfo, GroupsNames } from '@/types';

import Form from './Form';
import FooterInfo from './FooterInfo';
import './i18n';

function GroupStage() {
  const navigate = useNavigate();
  const { data, isLoading } = useFirestoreQuery(['groups'], queryGroups);
  const setGroupResults = useGroupsResultsStore((state) => state.setGroupResults);
  const [showTable, setShowTable] = useState(true);

  const onClick = () => setShowTable((prev) => !prev);

  const onSubmit: SubmitHandler<GroupStageValues> = (formData, event) => {
    event?.preventDefault();
    Object.keys(formData).forEach((groupName) => {
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
        <>
          <Box marginBottom={showTable ? '325px' : '104px'}>
            <Form onSubmit={onSubmit} data={data as QuerySnapshot<GroupInfo>} />
          </Box>
          <FooterInfo showTable={showTable} onClick={onClick} />
        </>
      )}
    </Flex>
  );
}

export default GroupStage;
