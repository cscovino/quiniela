import { Button, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import i18next from 'i18next';

import { useFirestoreQuery } from '@react-query-firebase/firestore';
import { queryActualResults, queryParticipantsResults } from '@/services/queries';
import useParticipantsTable from '@/hooks/useParticipantsTable';
import { DataTable } from '@/components/DataTable';

import './i18n';

function ParticipantsTable() {
  const navigate = useNavigate();
  const { data: participantsData } = useFirestoreQuery(['participants'], queryParticipantsResults);
  const { data: resultsData } = useFirestoreQuery(['results'], queryActualResults);
  const { data, columns } = useParticipantsTable(resultsData, participantsData);
  const onClick = () => {
    navigate('/');
  };

  return (
    <VStack width="100%" height="100%" justify="space-around">
      <HStack padding="20px">
        <Image src="/qatar-2022.svg" height="120px" alt="FIFA-World-Cup-Qatar-2022" />
        <Text textAlign="center" fontSize="5xl" fontFamily="qatar" color="white">
          {i18next.t<string>('TABLE:TITLE')}
        </Text>
      </HStack>
      <Flex width="98%" maxHeight="700px" borderRadius="10px" overflowX="scroll">
        <DataTable data={data} columns={columns} />
      </Flex>
      <HStack>
        <Button
          alignSelf="center"
          margin="20px"
          height="50px"
          fontSize="30px"
          color="#6f0625"
          bg="#fee1d2"
          _hover={{ bg: '#fa5d84' }}
          fontFamily="qatar"
          onClick={onClick}
        >
          {i18next.t<string>('TABLE:HOME')}
        </Button>
      </HStack>
    </VStack>
  );
}

export default ParticipantsTable;
