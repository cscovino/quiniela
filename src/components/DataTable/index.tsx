import { useState } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Icon } from '@chakra-ui/react';
import { TbTriangle, TbTriangleInverted } from 'react-icons/tb';
import Filter, { fuzzyFilter } from './Filter';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export function DataTable<Data extends object>({ data, columns }: DataTableProps<Data>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <table className="participants-table">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div
                    className={
                      header.column.columnDef.enableSorting && header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : 'cursor-none'
                    }
                    role="button"
                    tabIndex={0}
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyPress={() => {}}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <Icon as={TbTriangle} marginLeft="5px" alignSelf="center" />,
                      desc: <Icon as={TbTriangleInverted} marginLeft="5px" alignSelf="center" />,
                    }[header.column.getIsSorted() as string] ?? null}
                    {header.column.columnDef.enableColumnFilter ? (
                      <div>
                        <Filter column={header.column} table={table} />
                      </div>
                    ) : null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
