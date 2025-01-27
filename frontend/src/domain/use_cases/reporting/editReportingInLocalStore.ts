import { reportingsAPI } from '../../../api/reportingsAPI'
import { attachMissionToReportingSliceActions } from '../../../features/Reportings/slice'
import { setReportingFormVisibility, setToast, ReportingContext, VisibilityState } from '../../shared_slices/Global'
import { reportingActions } from '../../shared_slices/reporting'

export const editReportingInLocalStore =
  (reportingId: number, reportingContext: ReportingContext) => async (dispatch, getState) => {
    const reportingToEdit = reportingsAPI.endpoints.getReporting

    const { reportings } = getState().reporting

    if (reportings[reportingId]) {
      const newReporting = {
        ...reportings[reportingId],
        context: reportingContext
      }

      setReporting(dispatch, reportingId, reportingContext, newReporting)
    } else {
      // if the reporting not already in reporting state
      try {
        const reportingRequest = dispatch(reportingToEdit.initiate(reportingId))
        const reportingResponse = await reportingRequest.unwrap()
        if (!reportingResponse) {
          throw Error()
        }

        const reportingToSave = reportingResponse

        const newReporting = {
          context: reportingContext,
          isFormDirty: false,
          reporting: reportingToSave
        }

        setReporting(dispatch, reportingId, reportingContext, newReporting)
        await reportingRequest.unsubscribe()
      } catch (error) {
        dispatch(setToast({ message: 'Erreur à la récupération du signalement' }))
      }
    }
  }

async function setReporting(dispatch, reportingId, reportingContext, newReporting) {
  await dispatch(reportingActions.setReporting(newReporting))
  await dispatch(reportingActions.setActiveReportingId(reportingId))
  const hasAttachedMission =
    !!newReporting.reporting.attachedMission && !newReporting.reporting.detachedFromMissionAtUtc
  await dispatch(
    attachMissionToReportingSliceActions.setAttachedMission(
      hasAttachedMission ? newReporting.reporting.attachedMission : undefined
    )
  )

  await dispatch(
    setReportingFormVisibility({
      context: reportingContext,
      visibility: VisibilityState.VISIBLE
    })
  )
}
