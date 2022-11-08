import { Badge, Flex, Select } from '@chakra-ui/react';
import i18next from 'i18next';
import { useFormContext } from 'react-hook-form';

import { PositionProps } from './types';

function PositionInput(props: PositionProps) {
  const { first, second, teams, group } = props;

  const { register } = useFormContext();

  return (
    <Flex
      gap="5px"
      direction="column"
      align="center"
      justify="space-around"
      paddingY="5px"
      paddingX="10px"
      borderRadius="5px"
      bg="#edeade"
    >
      <Flex direction="row" justify="space-around" width="100%">
        <Badge width="7%" alignSelf="center" fontFamily="qatar">{`1${group}`}</Badge>
        <Select
          width="90%"
          fontFamily="qatar"
          defaultValue={teams.find((team) => team === first)}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register(`${group}.first`)}
        >
          {teams.map((team) => (
            <option key={`first-${team}`} value={team}>
              {i18next.t<string>(`FLAGS:${team}`)}
            </option>
          ))}
        </Select>
      </Flex>
      <Flex direction="row" justify="space-around" width="100%">
        <Badge width="7%" alignSelf="center" fontFamily="qatar">{`2${group}`}</Badge>
        <Select
          width="90%"
          fontFamily="qatar"
          defaultValue={teams.find((team) => team === second)}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register(`${group}.second`)}
        >
          {teams.map((team) => (
            <option key={`second-${team}`} value={team}>
              {i18next.t<string>(`FLAGS:${team}`)}
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
}

export default PositionInput;
