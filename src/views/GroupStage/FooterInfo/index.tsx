import { Button, Flex } from '@chakra-ui/react';
import i18next from 'i18next';

import PlayoffsPreview from '../PlayoffsPreview';
import GroupsTables from '../GroupsTables';

import { FooterInfoProps } from './types';

function FooterInfo(props: FooterInfoProps) {
  const { showTable, onClick } = props;

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
        {showTable ? <GroupsTables /> : <PlayoffsPreview />}
      </Flex>
    </Flex>
  );
}

export default FooterInfo;
