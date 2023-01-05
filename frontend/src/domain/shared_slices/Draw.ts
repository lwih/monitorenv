import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { InteractionListener, InteractionType } from '../entities/map/constants'
import type { GeoJSON } from '../types/GeoJSON'
import type { InteractionTypeAndListener } from '../types/map'

type DrawState = {
  geometry: GeoJSON.Geometry | undefined
  interactionType: InteractionType | undefined
  listener: InteractionListener | undefined
}
const INITIAL_STATE: DrawState = {
  geometry: undefined,
  interactionType: undefined,
  listener: undefined
}

const drawReducerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'draw',
  reducers: {
    resetGeometry(state) {
      state.geometry = undefined
    },

    /**
     * Reset the interaction with the OpenLayers map
     */
    resetInteraction(state) {
      state.interactionType = undefined
      state.listener = undefined
      state.geometry = undefined
    },

    setGeometry(state, action: PayloadAction<GeoJSON.Geometry>) {
      state.geometry = action.payload
    },

    /**
     * Changes the interaction type
     * @see InteractionType
     */
    setInteractionType(state, action: PayloadAction<InteractionType>) {
      state.interactionType = action.payload
    },

    /**
     * Start an interaction with the OpenLayers map, hence use the mouse to draw geometries
     */
    setInteractionTypeAndListener(state, action: PayloadAction<InteractionTypeAndListener>) {
      state.interactionType = action.payload.type
      state.listener = action.payload.listener
    }
  }
})

export const { resetGeometry, resetInteraction, setGeometry, setInteractionType, setInteractionTypeAndListener } =
  drawReducerSlice.actions

export const drawReducer = drawReducerSlice.reducer
