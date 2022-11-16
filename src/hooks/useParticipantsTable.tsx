import { QuerySnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import i18next from 'i18next';
import { Image, VStack, Text } from '@chakra-ui/react';
import { ActualResults, Countries, GroupsNames, ParticipantResult } from '@/types';
import { FLAGS } from '@/helpers/flags';

const columnsHelper = createColumnHelper<ParticipantResult>();

const createTableColumns = (rawResultsData: QuerySnapshot<ActualResults>) => {
  const participantColumns = [
    columnsHelper.accessor('participant', {
      header: i18next.t<string>('TABLE:PARTICIPANT'),
      enableSorting: true,
    }),
    columnsHelper.accessor('points', {
      header: i18next.t<string>('TABLE:POINTS'),
      enableSorting: true,
    }),
  ];
  const resultsDocument = rawResultsData.docs[0].data();
  const groupStageMatches = resultsDocument.results.filter((match) => !match.match.playoff);
  const groupStageColumns = groupStageMatches.map((match) => {
    const matchDate = match.date.toDate();
    const teams = match.match.match.split('-');
    return columnsHelper.group({
      id: match.match.match,
      header: matchDate.toLocaleString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      columns: [
        columnsHelper.accessor(`results.${match.match.match}.${teams[0]}`, {
          header: () => (
            <VStack>
              <Image src={FLAGS[teams[0] as Countries]} alt={teams[0]} height="20px" />
              <Text>
                {match.match[teams[0] as Countries] ? match.match[teams[0] as Countries] : '0'}
              </Text>
            </VStack>
          ),
          enableSorting: false,
        }),
        columnsHelper.accessor(`results.${match.match.match}.${teams[1]}`, {
          header: () => (
            <VStack>
              <Image src={FLAGS[teams[1] as Countries]} alt={teams[1]} height="20px" />
              <Text>
                {match.match[teams[1] as Countries] ? match.match[teams[1] as Countries] : '0'}
              </Text>
            </VStack>
          ),
          enableSorting: false,
        }),
      ],
    });
  });
  const groupsClasificationsColumns = Object.keys(resultsDocument.groupsClasifications)
    .sort()
    .map(
      (group) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        columnsHelper.group({
          id: group,
          header: `${i18next.t<string>('TABLE:GROUP')} ${group}`,
          columns: [
            columnsHelper.accessor(`groupsClasifications.${group as GroupsNames}.first`, {
              header: () => (
                <VStack>
                  {resultsDocument.groupsClasifications[group as GroupsNames].first ? (
                    <Image
                      src={
                        FLAGS[
                          resultsDocument.groupsClasifications[group as GroupsNames]
                            .first as Countries
                        ]
                      }
                      alt={resultsDocument.groupsClasifications[group as GroupsNames].first}
                      height="20px"
                    />
                  ) : null}
                  <Text>{i18next.t<string>('TABLE:GROUP_FIRST')}</Text>
                </VStack>
              ),
              cell: (info) => (
                <VStack>
                  <Image
                    src={FLAGS[info.getValue() as Countries]}
                    alt={info.getValue()}
                    height="20px"
                  />
                </VStack>
              ),
              enableSorting: false,
            }),
            columnsHelper.accessor(`groupsClasifications.${group as GroupsNames}.second`, {
              header: () => (
                <VStack>
                  {resultsDocument.groupsClasifications[group as GroupsNames].second ? (
                    <Image
                      src={
                        FLAGS[
                          resultsDocument.groupsClasifications[group as GroupsNames]
                            .second as Countries
                        ]
                      }
                      alt={resultsDocument.groupsClasifications[group as GroupsNames].second}
                      height="20px"
                    />
                  ) : null}
                  <Text>{i18next.t<string>('TABLE:GROUP_SECOND')}</Text>
                </VStack>
              ),
              cell: (info) => (
                <VStack>
                  <Image
                    src={FLAGS[info.getValue() as Countries]}
                    alt={info.getValue()}
                    height="20px"
                  />
                </VStack>
              ),
              enableSorting: false,
            }),
          ],
        }),
      // eslint-disable-next-line function-paren-newline
    );
  const finalPositionsColumns = columnsHelper.group({
    id: 'finalPositionsColumns',
    header: `${i18next.t<string>('TABLE:FINAL_POSITION')}`,
    columns: [
      columnsHelper.accessor('finalPositions.first', {
        header: () => (
          <VStack>
            {resultsDocument.finalPositions.first ? (
              <Image
                src={FLAGS[resultsDocument.finalPositions.first as Countries]}
                alt={resultsDocument.finalPositions.first}
                height="20px"
              />
            ) : null}
            <Text>{i18next.t<string>('TABLE:FINAL_FIRST')}</Text>
          </VStack>
        ),
        cell: (info) => (
          <VStack>
            <Image src={FLAGS[info.getValue() as Countries]} alt={info.getValue()} height="20px" />
          </VStack>
        ),
        enableSorting: false,
      }),
      columnsHelper.accessor('finalPositions.second', {
        header: () => (
          <VStack>
            {resultsDocument.finalPositions.second ? (
              <Image
                src={FLAGS[resultsDocument.finalPositions.second as Countries]}
                alt={resultsDocument.finalPositions.second}
                height="20px"
              />
            ) : null}
            <Text>{i18next.t<string>('TABLE:FINAL_SECOND')}</Text>
          </VStack>
        ),
        cell: (info) => (
          <VStack>
            <Image src={FLAGS[info.getValue() as Countries]} alt={info.getValue()} height="20px" />
          </VStack>
        ),
        enableSorting: false,
      }),
      columnsHelper.accessor('finalPositions.third', {
        header: () => (
          <VStack>
            {resultsDocument.finalPositions.third ? (
              <Image
                src={FLAGS[resultsDocument.finalPositions.third as Countries]}
                alt={resultsDocument.finalPositions.third}
                height="20px"
              />
            ) : null}
            <Text>{i18next.t<string>('TABLE:FINAL_THIRD')}</Text>
          </VStack>
        ),
        cell: (info) => (
          <VStack>
            <Image src={FLAGS[info.getValue() as Countries]} alt={info.getValue()} height="20px" />
          </VStack>
        ),
        enableSorting: false,
      }),
      columnsHelper.accessor('finalPositions.fourth', {
        header: () => (
          <VStack>
            {resultsDocument.finalPositions.fourth ? (
              <Image
                src={FLAGS[resultsDocument.finalPositions.fourth as Countries]}
                alt={resultsDocument.finalPositions.fourth}
                height="20px"
              />
            ) : null}
            <Text>{i18next.t<string>('TABLE:FINAL_FOURTH')}</Text>
          </VStack>
        ),
        cell: (info) => (
          <VStack>
            <Image src={FLAGS[info.getValue() as Countries]} alt={info.getValue()} height="20px" />
          </VStack>
        ),
        enableSorting: false,
      }),
    ],
  });
  const scorerColumn = columnsHelper.group({
    id: 'scorer',
    header: i18next.t<string>('TABLE:SCORER'),
    columns: [
      columnsHelper.accessor('scorer', {
        header: resultsDocument.scorer,
        enableSorting: false,
      }),
    ],
  });

  return [
    ...participantColumns,
    ...groupStageColumns,
    ...groupsClasificationsColumns,
    finalPositionsColumns,
    scorerColumn,
  ];
};

const formatDataTable = (rawParticipantsData: QuerySnapshot<ParticipantResult>) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  rawParticipantsData.docs.map((participant) => participant.data());

function useParticipantsTable(
  rawResultsData: QuerySnapshot<ActualResults> | undefined,
  rawParticipantsData: QuerySnapshot<ParticipantResult> | undefined,
) {
  const [data, setData] = useState<Array<ParticipantResult>>([]);
  const [columns, setColumns] = useState<Array<ColumnDef<ParticipantResult, any>>>([]);

  useEffect(() => {
    if (rawResultsData && rawParticipantsData) {
      const columnsData = createTableColumns(rawResultsData);
      setColumns(columnsData);
      const rowsData = formatDataTable(rawParticipantsData);
      setData(rowsData);
    }
  }, [rawResultsData, rawParticipantsData]);

  return { data, columns };
}

export default useParticipantsTable;
