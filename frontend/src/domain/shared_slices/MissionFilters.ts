import { customDayjs as dayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { dateRangeLabels } from '../entities/missions'

export const SEVEN_DAYS_AGO = dayjs().subtract(7, 'days').toISOString()

export enum MissionFiltersEnum {
  ADMINISTRATION_FILTER = 'administrationFilter',
  PERIOD_FILTER = 'periodFilter',
  SEA_FRONT_FILTER = 'seaFrontFilter',
  SOURCE_FILTER = 'sourceFilter',
  STARTED_AFTER_FILTER = 'startedAfter',
  STARTED_BEFORE_FILTER = 'startedBefore',
  STATUS_FILTER = 'statusFilter',
  THEME_FILTER = 'themeFilter',
  TYPE_FILTER = 'typeFilter',
  UNIT_FILTER = 'unitFilter'
}

type MissionFiltersSliceType = {
  administrationFilter: string[]
  hasFilters: boolean
  periodFilter: string
  seaFrontFilter: string[]
  sourceFilter: string | undefined
  startedAfter?: string
  startedBefore?: string
  statusFilter: string[]
  themeFilter: string[]
  typeFilter: string[]
  unitFilter: string[]
}

const initialState: MissionFiltersSliceType = {
  administrationFilter: [],
  hasFilters: false,
  periodFilter: dateRangeLabels.WEEK.value,
  seaFrontFilter: [],
  sourceFilter: undefined,
  startedAfter: SEVEN_DAYS_AGO,
  startedBefore: undefined,
  statusFilter: [],
  themeFilter: [],
  typeFilter: [],
  unitFilter: []
}

const persistConfig = {
  key: 'missionFilters',
  storage
}

const missionFiltersSlice = createSlice({
  initialState,
  name: 'missionFilters',
  reducers: {
    resetMissionFilters() {
      return { ...initialState }
    },
    updateFilters(state, action) {
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        hasFilters:
          (action.payload.value && action.payload.value.length > 0) ||
          state.periodFilter !== dateRangeLabels.WEEK.value ||
          state.administrationFilter.length > 0 ||
          state.unitFilter.length > 0 ||
          state.typeFilter.length > 0 ||
          state.seaFrontFilter.length > 0 ||
          state.statusFilter.length > 0 ||
          state.themeFilter.length > 0
      }
    }
  }
})

export const { resetMissionFilters, updateFilters } = missionFiltersSlice.actions

export const missionFiltersPersistedReducer = persistReducer(persistConfig, missionFiltersSlice.reducer)
