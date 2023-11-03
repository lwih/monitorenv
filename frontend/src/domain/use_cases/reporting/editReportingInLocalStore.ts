import { reportingsAPI } from '../../../api/reportingsAPI'
import { attachMissionToReportingSliceActions } from '../../../features/Reportings/ReportingForm/AttachMission/slice'
import { setReportingFormVisibility, setToast, ReportingContext, VisibilityState } from '../../shared_slices/Global'
import { reportingActions } from '../../shared_slices/reporting'

export const editReportingInLocalStore =
  (reportingId: number, reportingContext: ReportingContext) => async (dispatch, getState) => {
    dispatch(attachMissionToReportingSliceActions.resetAttachMissionState())
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
      const response = dispatch(reportingToEdit.initiate(reportingId))
      response
        .then(result => {
          if (result.data) {
            const reportingToSave = result.data

            const newReporting = {
              context: reportingContext,
              isFormDirty: false,
              reporting: reportingToSave
            }
            response.unsubscribe()

            setReporting(dispatch, reportingId, reportingContext, newReporting)
          } else {
            throw Error('Erreur à la récupération du signalement')
          }
        })
        .catch(error => {
          dispatch(setToast({ message: error }))
        })
    }
  }

async function setReporting(dispatch, reportingId, reportingContext, newReporting) {
  await dispatch(
    setReportingFormVisibility({
      context: reportingContext,
      visibility: VisibilityState.VISIBLE
    })
  )

  await dispatch(reportingActions.setReporting(newReporting))
  await dispatch(reportingActions.setActiveReportingId(reportingId))
  if (newReporting.reporting.attachedMission) {
    dispatch(attachMissionToReportingSliceActions.setAttachedMission(newReporting.reporting.attachedMission))
    dispatch(attachMissionToReportingSliceActions.setMissionId(newReporting.reporting.missionId))
  }
}
