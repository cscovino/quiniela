import { useMemo } from 'react';
import { Column, FilterFn, Table } from '@tanstack/react-table';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';

import i18next from 'i18next';
import DebouncedInput from '../DebounceInput';

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

function Filter({ column, table }: { column: Column<any, unknown>; table: Table<any> }) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    // eslint-disable-next-line no-confusing-arrow
    () =>
      // eslint-disable-next-line implicit-arrow-linebreak
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.getFacetedUniqueValues()],
  );

  return (
    <>
      <datalist id={`${column.id}list`}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option label={value} value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`${i18next.t<string>('TABLE:SEARCH')} (${
          column.getFacetedUniqueValues().size
        })`}
        list={`${column.id}list`}
      />
    </>
  );
}
export default Filter;
