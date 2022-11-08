import { QuerySnapshot } from 'firebase/firestore';
import i18next from 'i18next';

import { Box, Button, Flex, GridItem, SimpleGrid } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import PositionInput from '@/components/PositionInput';
import GroupTable from '@/components/GroupTable';
import { GroupInfo, Countries, GroupsNames, GroupsStats, GroupsClasifications } from '@/types';

import { GroupStatsProps } from './types';
import { calculateOrderGroup } from '@/helpers/calculations';

const renderGroups = (groups: QuerySnapshot<GroupInfo>, stats: GroupsStats) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  groups.docs.map((group) => {
    const { teams } = group.data();
    const groupOrdered = calculateOrderGroup(stats[group.id as GroupsNames]);
    return (
      <GridItem
        bg="white"
        colSpan={1}
        paddingY="10px"
        paddingX="18px"
        display="grid"
        justifyContent="space-around"
        width="350px"
        borderRadius="10px"
        key={`group-key-${group.id}`}
      >
        <Box color="#961e34" fontFamily="qatar" textAlign="center" paddingBottom="5px">
          {`${i18next.t<string>('GROUPS:GROUP')} ${group.id}`}
        </Box>
        <PositionInput
          group={group.id as GroupsNames}
          teams={teams}
          first={Object.keys(groupOrdered[0])[0] as Countries}
          second={Object.keys(groupOrdered[1])[0] as Countries}
        />
        <GroupTable teams={groupOrdered} />
      </GridItem>
    );
  });

function GroupStats(props: GroupStatsProps) {
  const { onSubmit, data, stats } = props;
  const methods = useForm<GroupsClasifications>();

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SimpleGrid minChildWidth="350px" gap="40px" justifyItems="center">
          {renderGroups(data, stats)}
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

export default GroupStats;
