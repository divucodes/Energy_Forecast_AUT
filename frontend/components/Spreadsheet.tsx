"use client";
import React, { useMemo } from 'react';
import { useTable, Column } from 'react-table';
import dayjs from 'dayjs';

interface CsvData {
  date: string;
  time: string;
  priceFcst: number;
  actualPrice: number;
}

interface Props {
  data: { [key: string]: CsvData[] };
  selectedFiles: string[];
}

const Spreadsheet: React.FC<Props> = ({ data, selectedFiles }) => {
  const formatDate = (date: string) => dayjs(date, 'YYYYMMDD').format('DD-MM-YY');
  const formatTime = (time: string) => time.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2');

  const transformedData = useMemo(() => {
    const dataMap: { [key: string]: { date: string, time: string, actualPrice: number, [key: string]: number | string } } = {};

    Object.entries(data).forEach(([source, entries]) => {
      entries.forEach(entry => {
        const key = `${entry.date}-${entry.time}`;
        if (!dataMap[key]) {
          dataMap[key] = { 
            date: entry.date, 
            time: entry.time, 
            actualPrice: entry.actualPrice 
          };
        }
        dataMap[key][source] = entry.priceFcst;
      });
    });

    return Object.values(dataMap);
  }, [data]);

  const dynamicColumns = useMemo(() => {
    const baseColumns: Column<any>[] = [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }: { value: string }) => formatDate(value),
      },
      {
        Header: 'Time',
        accessor: 'time',
        Cell: ({ value }: { value: string }) => formatTime(value),
      },
      {
        Header: 'Actual Price',
        accessor: 'actualPrice',
        Cell: ({ value }: { value: number }) => `$${value.toFixed(2)}`,
      }
    ];

    const sourceColumns: Column<any>[] = selectedFiles.map(source => ({
      Header: `Price Forecast (${source})`,
      accessor: source,
      Cell: ({ value }: { value: number }) => value ? `$${value.toFixed(2)}` : '-',
    }));

    return [...baseColumns, ...sourceColumns];
  }, [selectedFiles]);

  const tableInstance = useTable({ columns: dynamicColumns, data: transformedData });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  if (selectedFiles.length === 0) {
    return <div>Please select at least one Model to display data.</div>;
  }

  return (
    <div className="overflow-auto h-full">
      <table {...getTableProps()} className="min-w-full bg-white border border-gray-300 table-fixed">
        <thead className="sticky top-0 bg-gray-200">
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`header-${i}`}>
              {headerGroup.headers.map((column, j) => (
                <th 
                  {...column.getHeaderProps()} 
                  key={`header-${i}-${j}`} 
                  className="py-2 px-4 border-b text-left"
                  style={{ 
                    width: column.Header === 'Date' || column.Header === 'Time' ? '100px' : 'auto',
                    minWidth: '120px'
                  }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`row-${i}`} className="hover:bg-gray-100">
                {row.cells.map((cell, j) => (
                  <td 
                    {...cell.getCellProps()} 
                    key={`cell-${i}-${j}`} 
                    className="py-2 px-4 border-b text-left"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;