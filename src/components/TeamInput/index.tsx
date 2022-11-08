import {
  Box,
  Flex,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';
import i18next from 'i18next';
import { useFormContext } from 'react-hook-form';

import { FLAGS } from '@/helpers/flags';

import { TeamInputProps } from './types';
import './i18n';

function TeamInput(props: TeamInputProps) {
  const { fontSize = 16, flagSize = 20, reverse = false, team, inputLabel } = props;
  const arrowSize = fontSize / 2 - 2;

  const { register } = useFormContext();

  return (
    <Flex
      gap="5px"
      direction={reverse ? 'row-reverse' : 'row'}
      align="center"
      justify="space-around"
      paddingY="5px"
      paddingX="8px"
      borderRadius="5px"
      bg="#edeade"
    >
      <Image src={FLAGS[team]} alt={team} height={`${flagSize}px`} />
      <Box textAlign="center" fontSize={`${fontSize}px`} fontFamily="qatar" width="100px">
        {i18next.t<string>(`FLAGS:${team}`)}
      </Box>
      <NumberInput borderRadius="5px" bg="white" min={0} width="55px" padding="0px !important">
        <NumberInputField
          fontFamily="qatar"
          paddingTop="3px"
          paddingInline="4px"
          textAlign={reverse ? 'right' : 'left'}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register(inputLabel, { required: true, valueAsNumber: true })}
        />
        <NumberInputStepper left={reverse ? '0' : 'auto'} right={reverse ? 'auto' : '0'}>
          <NumberIncrementStepper
            borderRadius="0px !important"
            borderInlineEndColor="inherit !important"
            borderInlineEnd={reverse ? '1px solid' : '0'}
            borderInlineStart={reverse ? '0' : '1px solid'}
            fontSize={`${arrowSize}px`}
          />
          <NumberDecrementStepper
            borderRadius="0px !important"
            borderInlineEndColor="inherit !important"
            borderInlineEnd={reverse ? '1px solid' : '0'}
            borderInlineStart={reverse ? '0' : '1px solid'}
            fontSize={`${arrowSize}px`}
          />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  );
}

export default TeamInput;
