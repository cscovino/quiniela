import { Button, Flex, Image, Link, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import i18next from 'i18next';

import './i18n';

const rules = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Home() {
  const navigate = useNavigate();
  const onClick = () => {
    navigate('/group-stage');
  };
  const onClickParticipants = () => {
    navigate('/participants');
  };

  return (
    <Flex direction="column" alignItems="center" justify="start" width="100%" paddingTop="50px">
      <Image src="/qatar-2022.svg" height="220px" alt="FIFA-World-Cup-Qatar-2022" />
      <Text textAlign="center" fontSize="5xl" fontFamily="qatar" color="white">
        {i18next.t<string>('HOME:TITLE')}
      </Text>
      <Text textAlign="center" fontSize="xl" fontFamily="qatar" color="white" marginTop="20px">
        {i18next.t<string>('HOME:SUBTITLE')}
      </Text>
      <UnorderedList fontFamily="qatar" color="white" marginY="10px" width="80%">
        {rules.map((item) => (
          <ListItem key={`RULE-${item}`}>{i18next.t<string>(`HOME:RULES.${item}`)}</ListItem>
        ))}
      </UnorderedList>
      <Text textAlign="center" fontSize="lg" fontFamily="qatar" color="white">
        {i18next.t<string>('HOME:BYE')}
      </Text>
      <Text textAlign="center" fontSize="md" fontFamily="qatar" color="white" marginTop="20px">
        <Link
          href="https://firebasestorage.googleapis.com/v0/b/quiniela-mundial-d4a88.appspot.com/o/Quiniela%20Qatar%202022.xlsx?alt=media&token=361676b8-c508-427a-95c3-6ef6aa644911"
          target="_blank"
          color="#fa5d84"
        >
          {i18next.t<string>('HOME:LINK')}
        </Link>
        {i18next.t<string>('HOME:HELP')}
      </Text>
      <Flex direction="row" justify="center" gap={0}>
        <Button
          alignSelf="center"
          marginY="20px"
          marginX="10px"
          height="50px"
          fontSize="25px"
          color="#6f0625"
          bg="#fee1d2"
          _hover={{ bg: '#fa5d84' }}
          fontFamily="qatar"
          onClick={onClick}
        >
          {i18next.t<string>('HOME:NEXT')}
        </Button>
        <Button
          alignSelf="center"
          marginY="20px"
          marginX="10px"
          height="50px"
          fontSize="25px"
          color="#6f0625"
          bg="#fee1d2"
          _hover={{ bg: '#fa5d84' }}
          fontFamily="qatar"
          onClick={onClickParticipants}
        >
          {i18next.t<string>('HOME:PARTICIPANTS')}
        </Button>
      </Flex>
    </Flex>
  );
}

export default Home;
