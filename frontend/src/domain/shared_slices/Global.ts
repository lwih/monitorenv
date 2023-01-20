/* eslint-disable typescript-sort-keys/interface */
/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { MapToolType } from '../entities/map/constants'

type GlobalStateType = {
  rightMenuIsOpen: boolean
  // state entry for every component /menu displayed on map whose visibility should be controlled
  displayMissionMenuButton: boolean
  displayDrawModal: boolean
  displayLayersSidebar: boolean
  displayLocateOnMap: boolean
  displayMeasurement: boolean
  displayInterestPoint: boolean

  displayMissionsOverlay: boolean
  // state entry for every layer whose visibility should be controlled
  displayEditingMissionLayer: boolean
  displayMissionsLayer: boolean
  displaySelectedMissionLayer: boolean

  // state entry for other children components whom visibility is already handled by parent components
  missionsMenuIsOpen: boolean
  layersSidebarIsOpen: boolean

  mapToolOpened: MapToolType | undefined

  error: any

  healthcheckTextWarning?: string
}
const initialState: GlobalStateType = {
  rightMenuIsOpen: true,
  // state entry for every component /menu displayed on map whose visibility should be controlled
  displayMissionMenuButton: true,
  displayDrawModal: false,
  displayLayersSidebar: true,
  displayLocateOnMap: true,
  displayMeasurement: true,
  displayInterestPoint: true,

  displayMissionsOverlay: true,
  // state entry for every layer whose visibility should be controlled
  displayEditingMissionLayer: true,
  displayMissionsLayer: true,
  displaySelectedMissionLayer: true,

  // state entry for other children components whom visibility is already handled by parent components
  missionsMenuIsOpen: false,
  layersSidebarIsOpen: false,

  mapToolOpened: undefined,

  error: null,

  healthcheckTextWarning: undefined
}

const globalSlice = createSlice({
  initialState,
  name: 'global',
  reducers: {
    removeError(state) {
      state.error = null
    },

    setDisplayedItems(state, action) {
      return { ...state, ...action.payload }
    },

    /**
     * Set the map tool opened
     */
    setMapToolOpened(state, action: PayloadAction<MapToolType | undefined>) {
      state.mapToolOpened = action.payload
    },

    setError(state, action) {
      state.error = action.payload
    },

    /**
     * Set warning to show on application header
     * @param {Object} state
     * @param {{payload: string | null}} action - the warning(s) or null if no warning are found
     */
    setHealthcheckTextWarning(state, action) {
      state.healthcheckTextWarning = action.payload
    }
  }
})

export const { removeError, setDisplayedItems, setError, setHealthcheckTextWarning, setMapToolOpened } =
  globalSlice.actions

export const globalReducer = globalSlice.reducer