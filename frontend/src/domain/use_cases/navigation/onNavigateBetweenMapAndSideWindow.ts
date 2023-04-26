import { SideWindowStatus, sideWindowActions } from '../../../features/SideWindow/slice'

export const onNavigateBetweenMapAndSideWindow = (path: string) => (dispatch, getState) => {
  const {
    draw: { listener },
    missionState: { isFormDirty, missionState },
    sideWindow
  } = getState()

  if (sideWindow.status === SideWindowStatus.HIDDEN && missionState && !listener && isFormDirty) {
    return dispatch(sideWindowActions.onFocusAndDisplayCancelModal(path))
  }

  return dispatch(sideWindowActions.focusAndGoTo(path))
}