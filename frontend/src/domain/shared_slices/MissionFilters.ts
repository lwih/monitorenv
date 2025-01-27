import { customDayjs as dayjs } from '@mtes-mct/monitor-ui'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isEqual, omit } from 'lodash'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { DATE_RANGE_LABEL } from '../entities/dateRange'

export const SEVEN_DAYS_AGO = dayjs().subtract(7, 'days').toISOString()

export enum MissionFiltersEnum {
  ADMINISTRATION_FILTER = 'selectedAdministrationNames',
  PERIOD_FILTER = 'selectedPeriod',
  SEA_FRONT_FILTER = 'selectedSeaFronts',
  SOURCE_FILTER = 'selectedMissionSource',
  STARTED_AFTER_FILTER = 'startedAfter',
  STARTED_BEFORE_FILTER = 'startedBefore',
  STATUS_FILTER = 'selectedStatuses',
  THEME_FILTER = 'selectedThemes',
  TYPE_FILTER = 'selectedMissionTypes',
  UNIT_FILTER = 'selectedControlUnitIds'
}

type MissionFilterValues = {
  hasFilters: boolean
  selectedAdministrationNames: string[] | undefined
  selectedControlUnitIds: number[] | undefined
  selectedMissionSource: string | undefined
  selectedMissionTypes: string[] | undefined
  selectedPeriod: string
  selectedSeaFronts: string[] | undefined
  selectedStatuses: string[] | undefined
  selectedThemes: string[] | undefined
  startedAfter?: string
  startedBefore?: string
}

export type MissionFiltersState = {
  [K in MissionFiltersEnum]: MissionFilterValues[K]
} & {
  hasFilters: boolean
}

const INITIAL_STATE: MissionFiltersState = {
  hasFilters: false,
  selectedAdministrationNames: undefined,
  selectedControlUnitIds: undefined,
  selectedMissionSource: undefined,
  selectedMissionTypes: undefined,
  selectedPeriod: DATE_RANGE_LABEL.WEEK.value,
  selectedSeaFronts: undefined,
  selectedStatuses: undefined,
  selectedThemes: undefined,
  startedAfter: SEVEN_DAYS_AGO,
  startedBefore: undefined
}

const persistConfig = {
  key: 'missionFilters',
  storage
}

const missionFiltersSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'missionFilters',
  reducers: {
    resetMissionFilters() {
      return { ...INITIAL_STATE }
    },

    updateFilters<K extends MissionFiltersEnum>(
      // TODO There is not `MissionFiltersState` type inference in `createSlice()`.
      // Investigate why (this should be automatic).
      state: MissionFiltersState,
      action: PayloadAction<{
        key: K
        value: MissionFiltersState[K]
      }>
    ) {
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        hasFilters: !isEqual(
          omit(INITIAL_STATE, ['hasFilters', 'startedAfter', 'startedBefore']),
          omit({ ...state, [action.payload.key]: action.payload.value }, [
            'hasFilters',
            'startedAfter',
            'startedBefore'
          ])
        )
      }
    }
  }
})

export const { resetMissionFilters, updateFilters } = missionFiltersSlice.actions

export const missionFiltersPersistedReducer = persistReducer(persistConfig, missionFiltersSlice.reducer)
