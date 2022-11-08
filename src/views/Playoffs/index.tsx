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

function Playoffs() {
  const navigate = useNavigate();
  const { data, isLoading } = useFirestoreQuery(['playoffs'], queryPlayoffs);
  const participantsCollection = collection(firestore, 'participants');
  const mutation = useFirestoreCollectionMutation(participantsCollection);
  const groupsClasifications = useGroupsClasificationsStore((state) => state.groupsClasifications);
  const finalPositions = useFinalPositionsStore((state) => state.finalPositions);
  const groupsResults = useGroupsResultsStore((state) => state.groupsResults);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      navigate('/');
    }
  }, [mutation.isLoading, mutation.isSuccess, navigate]);

  const onPressNext = () => setIsModalOpen(true);

  const onClose = () => setIsModalOpen(false);
  const onSubmit: SubmitHandler<{ participant: string }> = (formData, event) => {
    event?.preventDefault();
    mutation.mutate({
      participant: formData.participant,
      results: groupsResults,
      finalPositions,
      groupsClasifications,
    });
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
            fontSize="30px"
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
