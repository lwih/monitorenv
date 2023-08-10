import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ButtonsGroupRow } from './ButtonsRowGroup'
import { getFormattedReportingId } from '../../../../domain/entities/reporting'
import { CellActionThemes } from '../CellActionThemes'
import { CellLocalizeReporting } from '../CellLocalizeReporting'
import { CellStatus } from '../CellStatus'
import { CellValidityTime } from '../CellValidityTime'
import { getDateCell } from '../getDateCell'
import { getReportType } from '../getReportType'

import type { Row } from '@tanstack/react-table'

export const Columns = [
  {
    accessorFn: row => row.reportingId,
    cell: ({ row }) => (
      <div className="px-1">
        <TableWithSelectableRows.RowCheckbox
          {...{
            disabled: !row.getCanSelect(),
            isChecked: row.getIsSelected(),
            onChange: row.getToggleSelectedHandler(row)
          }}
        />
      </div>
    ),
    enableSorting: false,
    header: ({ table }) => (
      <TableWithSelectableRows.RowCheckbox
        {...{
          isChecked: table.getIsAllRowsSelected(),
          isIndeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler()
        }}
      />
    ),

    id: 'select',
    size: 50
  },
  {
    accessorFn: row => row.reportingId,
    cell: info => <Cell id={info.getValue()}>{getFormattedReportingId(info.getValue())}</Cell>,
    enableSorting: false,
    header: () => '',
    id: 'reportingId',
    size: 90
  },
  {
    accessorFn: row => row.createdAt,
    cell: info => getDateCell(info.getValue()),
    enableSorting: true,
    header: () => 'Ouverture',
    id: 'createdAt',
    size: 160
  },
  {
    accessorFn: row => row.validityTime,
    cell: ({ row }) => <CellValidityTime row={row} />,
    enableSorting: false, // TODO see how we can sort on timeLeft and not validityTime
    header: () => 'Fin dans',
    id: 'validityTime',
    size: 70
  },
  {
    accessorFn: row => row.displayedSource,
    cell: info => <Cell id={info.getValue()}>{info.getValue()}</Cell>,
    enableSorting: true,
    header: () => 'Source',
    id: 'displayedSource',
    maxSize: 280,
    minSize: 230
  },
  {
    accessorFn: row => row.reportType,
    cell: info => getReportType(info.getValue()),
    enableSorting: true,
    header: () => 'Type',
    id: 'reportType',
    size: 170
  },
  {
    accessorFn: row => row.theme,
    cell: ({ row }) => <CellActionThemes subThemes={row.original.subThemes} theme={row.original.theme} />,
    enableSorting: true,
    header: () => 'Thématique',
    id: 'theme',
    maxSize: 280,
    minSize: 230
  },
  {
    accessorFn: row => row.seaFront,
    cell: info => <Cell id={info.getValue()}>{info.getValue()}</Cell>,
    enableSorting: true,
    header: () => 'Façade',
    id: 'seaFront',
    size: 100
  },
  {
    accessorFn: row => row.status,
    cell: ({ row }) => <CellStatus row={row} />,
    enableSorting: true,
    header: () => 'Statut',
    id: 'isArchived',
    size: 100,
    sortingFn: (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
      if (rowA.original[columnId] > rowB.original[columnId]) {
        return -1
      }
      if (rowB.original[columnId] > rowA.original[columnId]) {
        return 1
      }

      return 1
    }
  },
  {
    accessorFn: row => row.geom,
    cell: info => <CellLocalizeReporting geom={info.getValue()} />,
    enableSorting: false,
    header: () => '',
    id: 'geom',
    maxSize: 55,
    minSize: 55,
    size: 55
  },
  {
    accessorFn: row => row.id,
    cell: info => <ButtonsGroupRow id={info.getValue()} />,
    enableSorting: false,
    header: () => '',
    id: 'id',
    maxSize: 100,
    minSize: 100,
    size: 100
  }
]

const Cell = styled.div``
