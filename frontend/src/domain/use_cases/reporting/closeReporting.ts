import { attachMissionToReportingSliceActions } from '../../../features/Reportings/slice'
import { setReportingFormVisibility, ReportingContext, VisibilityState } from '../../shared_slices/Global'
import { reportingActions } from '../../shared_slices/reporting'
import { MapInteractionListenerEnum, updateMapInteractionListeners } from '../map/updateMapInteractionListeners'

export const closeReporting =
  (reportingIdToClose: number | string, reportingContextToClose: ReportingContext) => async (dispatch, getState) => {
    const { activeReportingId, reportings } = getState().reporting
    if (!reportingIdToClose) {
      return
    }

    if (reportings[reportingIdToClose].isFormDirty) {
      const reportingToClose = reportings[reportingIdToClose]
      await dispatch(reportingActions.setReporting(reportingToClose))
      await dispatch(reportingActions.setActiveReportingId(reportingIdToClose))

      const hasAttachedMission =
        !!reportingToClose.reporting.attachedMission && !reportingToClose.reporting.detachedFromMissionAtUtc
      await dispatch(
        attachMissionToReportingSliceActions.setAttachedMission(
          hasAttachedMission ? reportings[reportingIdToClose].reporting.attachedMission : undefined
        )
      )

      await dispatch(reportingActions.setIsConfirmCancelDialogVisible(true))
      await dispatch(
        setReportingFormVisibility({
          context: reportingContextToClose,
          visibility: VisibilityState.VISIBLE
        })
      )

      return
    }

    if (activeReportingId === reportingIdToClose) {
      await dispatch(attachMissionToReportingSliceActions.resetAttachMissionState())
    }
    await dispatch(reportingActions.deleteSelectedReporting(reportingIdToClose))
    dispatch(updateMapInteractionListeners(MapInteractionListenerEnum.NONE))
    await dispatch(
      setReportingFormVisibility({
        context: reportingContextToClose,
        visibility: VisibilityState.NONE
      })
    )
  }
