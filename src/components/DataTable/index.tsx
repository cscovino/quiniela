import { useState } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Icon } from '@chakra-ui/react';
import { TbTriangle, TbTriangleInverted } from 'react-icons/tb';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export function DataTable<Data extends object>({ data, columns }: DataTableProps<Data>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
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
