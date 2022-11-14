import { Badge, Flex, Image } from '@chakra-ui/react';
import i18next from 'i18next';

import { FLAGS } from '@/helpers/flags';

import { PlayoffsMatchPreviewProps } from './types';

function PlayoffsMatchPreview(props: PlayoffsMatchPreviewProps) {
  const { fontSize = 16, flagSize = 15, reverse = false, team, position } = props;

  return (
    <Flex
      gap="5px"
      direction={reverse ? 'row-reverse' : 'row'}
      align="center"
      justify="space-around"
      padding="5px"
      borderRadius="5px"
      fontFamily="qatar"
      fontSize={fontSize}
      bg="#edeade"
    >
      <Badge alignSelf="center" fontFamily="qatar">
        {position}
      </Badge>
      {FLAGS[team] ? <Image src={FLAGS[team]} alt={team} height={`${flagSize}px`} /> : null}
      {i18next.t<string>(`FLAGS:${team}`)}
    </Flex>
  );
}

export default PlayoffsMatchPreview;
