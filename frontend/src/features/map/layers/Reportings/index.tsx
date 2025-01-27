import { reduce } from 'lodash'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { useEffect, useMemo, useRef } from 'react'

import { getReportingZoneFeature } from './reportingsGeometryHelpers'
import { reportingPinStyleFn } from './style'
import { Layers } from '../../../../domain/entities/layers/constants'
import { removeOverlayCoordinatesByName } from '../../../../domain/shared_slices/Global'
import { reportingActions } from '../../../../domain/shared_slices/reporting'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useGetFilteredReportingsQuery } from '../../../Reportings/hooks/useGetFilteredReportingsQuery'

import type { VectorLayerWithName } from '../../../../domain/types/layer'
import type { BaseMapChildrenProps } from '../../BaseMap'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export function ReportingsLayer({ map, mapClickEvent }: BaseMapChildrenProps) {
  const dispatch = useAppDispatch()
  const { displayReportingsLayer } = useAppSelector(state => state.global)

  const activeReportingId = useAppSelector(state => state.reporting.activeReportingId)
  const editingReporting = useAppSelector(state =>
    activeReportingId ? state.reporting.reportings[activeReportingId]?.reporting : undefined
  )

  // we don't want to display reportings on the map if the user so decides (displayReportingsLayer variable)
  // or if user have interaction on map (attach mission or reporting)
  const isMissionAttachmentInProgress = useAppSelector(
    state => state.attachMissionToReporting.isMissionAttachmentInProgress
  )
  const isReportingAttachmentInProgress = useAppSelector(
    state => state.attachReportingToMission.isReportingAttachmentInProgress
  )
  const hasMapListener = isMissionAttachmentInProgress || isReportingAttachmentInProgress
  const isLayerVisible = useMemo(
    () => displayReportingsLayer && !hasMapListener,
    [displayReportingsLayer, hasMapListener]
  )

  const missionListener = useAppSelector(state => state.draw.listener)
  // Attached reportings to active mission
  const attachedReportingsToActiveMission = useAppSelector(state => state.missionState.missionState?.attachedReportings)
  const attachedReportingsToActiveMissionFeature = useMemo(() => {
    if (!attachedReportingsToActiveMission || attachedReportingsToActiveMission?.length === 0) {
      return []
    }

    return reduce(
      attachedReportingsToActiveMission,
      (features, reporting) => {
        if (reporting && reporting.geom) {
          features.push(getReportingZoneFeature(reporting, Layers.REPORTINGS.code))
        }

        return features
      },
      [] as Feature[]
    )
  }, [attachedReportingsToActiveMission])

  const { reportings } = useGetFilteredReportingsQuery()
  const reportingsFromApiFeatures = useMemo(
    () =>
      reduce(
        reportings,
        (features, reporting) => {
          if (reporting && reporting.geom) {
            if (reporting.id === activeReportingId && editingReporting) {
              features.push(getReportingZoneFeature(editingReporting, Layers.REPORTINGS.code))
            } else {
              features.push(getReportingZoneFeature(reporting, Layers.REPORTINGS.code))
            }
          }

          return features
        },
        [] as Feature[]
      ) || [],
    [reportings, activeReportingId, editingReporting]
  )

  const reportingsPointOrZone = useMemo(() => {
    // if user edits a mission with attached reportings and draw a zone or a point on map
    // we want to display only the attached reportings
    if (missionListener) {
      return [...attachedReportingsToActiveMissionFeature]
    }

    // we want to display reportings from API (with active filters), active reporting
    // and reportings attached to active mission
    return [...reportingsFromApiFeatures, ...attachedReportingsToActiveMissionFeature]
  }, [attachedReportingsToActiveMissionFeature, reportingsFromApiFeatures, missionListener])

  const vectorSourceRef = useRef(new VectorSource()) as React.MutableRefObject<VectorSource<Geometry>>

  const vectorLayerRef = useRef(
    new VectorLayer({
      renderBuffer: 7,
      source: vectorSourceRef.current,
      style: reportingPinStyleFn,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: Layers.REPORTINGS.zIndex
    })
  ) as React.MutableRefObject<VectorLayerWithName>

  ;(vectorLayerRef.current as VectorLayerWithName).name = Layers.REPORTINGS.code

  useEffect(() => {
    map.getLayers().push(vectorLayerRef.current)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      map.removeLayer(vectorLayerRef.current)
    }
  }, [map])

  useEffect(() => {
    vectorSourceRef.current?.clear(true)
    if (reportingsPointOrZone) {
      vectorSourceRef.current?.addFeatures(reportingsPointOrZone)
    }
  }, [reportingsPointOrZone])

  useEffect(() => {
    vectorLayerRef.current?.setVisible(isLayerVisible)
  }, [isLayerVisible])

  useEffect(() => {
    const feature = mapClickEvent?.feature
    if (feature && feature.getId()?.toString()?.includes(Layers.REPORTINGS.code)) {
      const { id } = feature.getProperties()
      dispatch(reportingActions.setSelectedReportingIdOnMap(id))
      dispatch(removeOverlayCoordinatesByName(Layers.REPORTINGS.code))
    }
  }, [dispatch, mapClickEvent])

  return null
}
