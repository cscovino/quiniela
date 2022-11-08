import { Flex, Image, Table, TableContainer, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import i18next from 'i18next';

import { FLAGS } from '@/helpers/flags';

import { GroupTableProps } from './types';
import { Countries } from '@/types';

function GroupTable(props: GroupTableProps) {
  const { teams } = props;

  return (
    <TableContainer fontFamily="qatar" fontSize="12px">
      <Table>
        <Thead>
          <Tr>
            <Td>{i18next.t<string>('TABLE:TEAM')}</Td>
            <Td>{i18next.t<string>('TABLE:PTS')}</Td>
            <Td>{i18next.t<string>('TABLE:GD')}</Td>
            <Td>{i18next.t<string>('TABLE:GF')}</Td>
            <Td>{i18next.t<string>('TABLE:GA')}</Td>
          </Tr>
        </Thead>
        <Tbody>
          {teams.map((teamStat) => {
            const teamsStat = Object.keys(teamStat);
            return teamsStat.map((team) => (
              <Tr key={`tr-${team}`}>
                <Td>
                  <Flex direction="row" gap="10px">
                    <Image src={FLAGS[team as Countries]} alt={team} height="12px" />
                    {i18next.t<string>(`FLAGS:${team}`)}
                  </Flex>
                </Td>
                <Td>{teamStat[team as Countries]?.pts}</Td>
                <Td>{teamStat[team as Countries]?.gd}</Td>
                <Td>{teamStat[team as Countries]?.gf}</Td>
                <Td>{teamStat[team as Countries]?.ga}</Td>
              </Tr>
            ));
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default GroupTable;
