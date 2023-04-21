import { createSlice } from '@reduxjs/toolkit'

import { sideWindowPaths } from '../../domain/entities/sideWindow'

import type { PayloadAction } from '@reduxjs/toolkit'

export enum SideWindowStatus {
  CLOSED = 'closed',
  HIDDEN = 'hidden',
  VISIBLE = 'visible'
}
export interface SideWindowState {
  // TODO Replace with an enum once `sideWindowPaths` is converted to an enum.
  currentPath: string
  hasBeenRenderedOnce: boolean
  nextPath?: string | null
  showConfirmCancelModal: boolean
  status: string
}
const INITIAL_STATE: SideWindowState = {
  currentPath: sideWindowPaths.MISSIONS,
  hasBeenRenderedOnce: false,
  nextPath: null,
  showConfirmCancelModal: false,
  status: SideWindowStatus.CLOSED
}

const sideWindowReducerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'sideWindowReducer',
  reducers: {
    close(state) {
      state.status = SideWindowStatus.CLOSED
    },
    /**
     * Open the side window and set its route path
     */
    // TODO Replace with an enum once `sideWindowPaths` is converted to an enum.
    focusAndGoTo(state, action: PayloadAction<string>) {
      state.currentPath = action.payload
      state.nextPath = null
      state.status = SideWindowStatus.VISIBLE
      state.showConfirmCancelModal = false
    },

    onChangeStatus(state, action: PayloadAction<SideWindowStatus>) {
      state.status = action.payload
    },

    onConfirmCancelModal(state) {
      state.nextPath = null
      state.status = SideWindowStatus.VISIBLE
      state.showConfirmCancelModal = false
    },

    onFocusAndDisplayCancelModal(state, action: PayloadAction<string>) {
      state.nextPath = action.payload
      state.status = SideWindowStatus.VISIBLE
      state.showConfirmCancelModal = true
    },

    setNextPath(state, action: PayloadAction<string | null>) {
      state.nextPath = action.payload
    },
    setShowConfirmCancelModal(state, action: PayloadAction<boolean>) {
      state.showConfirmCancelModal = action.payload
    }
  }
})

export const sideWindowActions = sideWindowReducerSlice.actions
export const sideWindowReducer = sideWindowReducerSlice.reducer
