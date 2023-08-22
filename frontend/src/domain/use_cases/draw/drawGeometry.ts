import { InteractionListener, InteractionType } from '../../entities/map/constants'
import { setGeometry, setInteractionTypeAndListener } from '../../shared_slices/Draw'
import { setDisplayedItems } from '../../shared_slices/Global'

import type { GeoJSON as GeoJSONNamespace } from '../../types/GeoJSON'

export const drawPolygon =
  (geometry: GeoJSONNamespace.Geometry | undefined, listener: InteractionListener) => dispatch => {
    if (geometry) {
      dispatch(setGeometry(geometry))
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener,
        type: InteractionType.POLYGON
      })
    )
  }

export const drawPoint =
  (geometry: GeoJSONNamespace.Geometry | undefined, listener?: InteractionListener) => dispatch => {
    if (geometry) {
      dispatch(setGeometry(geometry))
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener: listener || InteractionListener.CONTROL_POINT,
        type: InteractionType.POINT
      })
    )
  }

const openDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedItems({
      displayDrawModal: true,
      displayInterestPoint: false,
      displayLayersSidebar: false,
      displayLocateOnMap: true,
      displayMeasurement: false,
      displayMissionMenuButton: false,
      displayMissionSelectedLayer: false,
      displayMissionsLayer: false,
      displayMissionsOverlay: false,
      displayReportingsOverlay: false,
      displaySearchSemaphoreButton: false
    })
  )
}

export const closeDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedItems({
      displayDrawModal: false,
      displayInterestPoint: true,
      displayLayersSidebar: true,
      displayLocateOnMap: true,
      displayMeasurement: true,
      displayMissionMenuButton: true,
      displayMissionSelectedLayer: true,
      displayMissionsLayer: true,
      displayMissionsOverlay: true,
      displayReportingsOverlay: true,
      displaySearchSemaphoreButton: true
    })
  )
}