import { useEffect, useState } from 'react';
import { Box, Button, Flex, Spinner } from '@chakra-ui/react';
import { collection } from 'firebase/firestore';
import { useFirestoreCollectionMutation, useFirestoreQuery } from '@react-query-firebase/firestore';
import { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import i18next from 'i18next';

import { useGroupsClasificationsStore } from '@/store/groupsClasifications';
import { useFinalPositionsStore } from '@/store/finalPositions';
import { useGroupsResultsStore } from '@/store/groupsResults';
import { queryPlayoffs } from '@/services/queries';
import { firestore } from '@/configs/firebase';

import PlayoffsFixtures from './PlayoffsFixtures';
import './i18n';
import ModalForm from './ModalForm';
import ModalSuccess from './ModalSuccess';
import { useGroupsStatsStore } from '@/store/groupsStats';
import { usePlayoffsMatchesStore } from '@/store/playoffsMatches';

function Playoffs() {
  const navigate = useNavigate();
  const { data, isLoading } = useFirestoreQuery(['playoffs'], queryPlayoffs);
  const participantsCollection = collection(firestore, 'participants');
  const mutation = useFirestoreCollectionMutation(participantsCollection);
  const { groupsClasifications, clearGroupsClasifications } = useGroupsClasificationsStore(
    (state) => state,
  );
  const { finalPositions, clearFinalPositions } = useFinalPositionsStore((state) => state);
  const { groupsResults, clearGroupsResults } = useGroupsResultsStore((state) => state);
  const clearGroupsStats = useGroupsStatsStore((state) => state.clearGroupsStats);
  const clearPlayoffsMatches = usePlayoffsMatchesStore((state) => state.clearPlayoffsMatches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);

  useEffect(() => {
    if (
      !Object.keys(groupsClasifications.A).length ||
      !Object.keys(groupsClasifications.B).length ||
      !Object.keys(groupsClasifications.C).length ||
      !Object.keys(groupsClasifications.D).length ||
      !Object.keys(groupsClasifications.E).length ||
      !Object.keys(groupsClasifications.F).length ||
      !Object.keys(groupsClasifications.H).length
    ) {
      navigate('/');
    }
  }, [groupsClasifications, navigate]);

  useEffect(() => {
    if (!mutation.isLoading && mutation.isSuccess) {
      setIsModalOpen(false);
      setIsModalSuccessOpen(true);
    }
  }, [mutation.isLoading, mutation.isSuccess]);

  const onPressNext = () => setIsModalOpen(true);

  const onClose = () => setIsModalOpen(false);
  const onSubmit: SubmitHandler<{ participant: string; scorer: string }> = (formData, event) => {
    event?.preventDefault();
    mutation.mutate({
      participant: formData.participant,
      results: groupsResults,
      finalPositions,
      groupsClasifications,
      scorer: formData.scorer,
    });
  };

  const onCloseSuccess = () => {
    setIsModalSuccessOpen(false);
    clearGroupsClasifications();
    clearFinalPositions();
    clearGroupsResults();
    clearGroupsStats();
    clearPlayoffsMatches();
    navigate(0);
  };

  return (
    <Flex direction="column" alignItems="center" justify="center" width="100%">
      <ModalForm
        isOpen={isModalOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        finalPositions={finalPositions}
        buttonIsDisabled={mutation.isLoading}
      />
      <ModalSuccess isOpen={isModalSuccessOpen} onClose={onCloseSuccess} />
      <Box
        textAlign="center"
        fontFamily="qatar"
        fontSize="40px"
        margin="40px"
        marginBottom="10px"
        color="#fee1d2"
      >
        {i18next.t<string>('PLAYOFFS:TITLE')}
      </Box>
      {isLoading || !data ? (
        <Spinner thickness="5px" speed="0.8s" emptyColor="#fa5d84" color="#fee1d2" size="xl" />
      ) : (
        <>
          <Box textAlign="center" fontFamily="qatar" fontSize="20px" margin="10px" color="#fee1d2">
            {i18next.t<string>('PLAYOFFS:SUBTITLE')}
          </Box>
          <PlayoffsFixtures data={data} groupsClasifications={groupsClasifications} />
          <Button
            alignSelf="center"
            margin="40px"
            height="50px"
            fontSize="25px"
            color="#6f0625"
            bg="#fee1d2"
            _hover={{ bg: '#fa5d84' }}
            fontFamily="qatar"
            onClick={onPressNext}
          >
            {i18next.t<string>('PLAYOFFS:NEXT')}
          </Button>
        </>
      )}
    </Flex>
  );
}

export default Playoffs;
