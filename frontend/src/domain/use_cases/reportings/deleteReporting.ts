import { reportingsAPI } from '../../../api/reportingsAPI'
import { setReportingFormVisibility, setToast } from '../../shared_slices/Global'
import { ReportingFormVisibility, reportingStateActions } from '../../shared_slices/ReportingState'

export const deleteReporting = id => async dispatch => {
  try {
    const response = await dispatch(reportingsAPI.endpoints.deleteReporting.initiate({ id }))
    if ('error' in response) {
      throw Error('Erreur à la suppression du signalement')
    } else {
      dispatch(reportingStateActions.setSelectedReportingId(undefined))
      dispatch(setReportingFormVisibility(ReportingFormVisibility.NONE))
    }
  } catch (error) {
    dispatch(setToast({ message: error }))
  }
}