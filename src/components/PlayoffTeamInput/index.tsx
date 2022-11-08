import { Button, Flex, Image } from '@chakra-ui/react';
import i18next from 'i18next';

import { FLAGS } from '@/helpers/flags';

import { PlayoffTeamInputProps } from './types';

function PlayoffTeamInput(props: PlayoffTeamInputProps) {
  const { fontSize = 16, flagSize = 20, reverse = false, team, teamSelected, onClick } = props;

  return (
    <Flex
      gap="5px"
      direction={reverse ? 'row-reverse' : 'row'}
      align="center"
      justify="space-around"
      padding="5px"
      borderRadius="5px"
      bg={teamSelected === team ? '#fa5d84' : '#edeade'}
    >
      <Button
        type="button"
        textAlign="center"
        fontSize={`${fontSize}px`}
        fontFamily="qatar"
        width="180px"
        gap="10px"
        bg="#edeade"
        onClick={onClick}
      >
        {FLAGS[team] ? <Image src={FLAGS[team]} alt={team} height={`${flagSize}px`} /> : null}
        {i18next.t<string>(`FLAGS:${team}`)}
      </Button>
    </Flex>
  );
}

export default PlayoffTeamInput;
