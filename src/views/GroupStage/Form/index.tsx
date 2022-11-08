import { Box, Button, Flex, GridItem, SimpleGrid } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { QuerySnapshot } from 'firebase/firestore';
import i18next from 'i18next';

import MatchInput from '@/components/MatchInput';
import { GroupStageValues, GroupInfo, Countries, GroupsNames } from '@/types';

import { FormProps } from './types';

const renderFixtures = (groups: QuerySnapshot<GroupInfo>) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  groups.docs.map((group) => {
    const groupData = group.data();
    return (
      <GridItem
        bg="white"
        colSpan={1}
        paddingY="10px"
        paddingX="15px"
        display="grid"
        justifyContent="space-around"
        width="fit-content"
        borderRadius="10px"
        key={`group-key-${group.id}`}
      >
        <Box color="#961e34" fontFamily="qatar" textAlign="center" paddingBottom="5px">
          {`${i18next.t<string>('GROUPS:GROUP')} ${group.id}`}
        </Box>
        {groupData.matches.map((match) => (
          <MatchInput
            key={match.match}
            group={group.id as GroupsNames}
            teams={match.match.split('-') as Array<Countries>}
            date={match.date}
          />
        ))}
      </GridItem>
    );
  });

function Form(props: FormProps) {
  const { onSubmit, data } = props;
  const methods = useForm<GroupStageValues>();

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SimpleGrid columns={[1, 1, 2, 2, 3]} gap="40px" justifyItems="center">
          {renderFixtures(data)}
        </SimpleGrid>
        <Flex width="100%" justify="center">
          <Button
            alignSelf="center"
            margin="40px"
            height="50px"
            fontSize="30px"
            color="#6f0625"
            bg="#fee1d2"
            _hover={{ bg: '#fa5d84' }}
            fontFamily="qatar"
            type="submit"
          >
            {i18next.t<string>('GROUPS:NEXT')}
          </Button>
        </Flex>
      </form>
    </FormProvider>
  );
}

export default Form;
