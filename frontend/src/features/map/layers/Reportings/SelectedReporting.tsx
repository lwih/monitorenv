import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { type MutableRefObject, useEffect, useRef, useMemo } from 'react'

import { getReportingZoneFeature } from './reportingsGeometryHelpers'
import { selectedReportingStyleFn } from './style'
import { useGetReportingsQuery } from '../../../../api/reportingsAPI'
import { Layers } from '../../../../domain/entities/layers/constants'
import { useAppSelector } from '../../../../hooks/useAppSelector'

import type { VectorLayerWithName } from '../../../../domain/types/layer'
import type { BaseMapChildrenProps } from '../../BaseMap'

export function SelectedReportingLayer({ map }: BaseMapChildrenProps) {
  const { activeReportingId, selectedReportingIdOnMap } = useAppSelector(state => state.reporting)
  const { displayReportingSelectedLayer } = useAppSelector(state => state.global)
  const overlayCoordinates = useAppSelector(state => state.global.overlayCoordinates)
  const { selectedReporting } = useGetReportingsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      selectedReporting: selectedReportingIdOnMap && data?.entities[selectedReportingIdOnMap]
    })
  })

  const hasNoReportingConflict = useMemo(() => {
    if (!activeReportingId && !!selectedReportingIdOnMap) {
      return true
    }

    return !!activeReportingId && activeReportingId !== selectedReportingIdOnMap
  }, [activeReportingId, selectedReportingIdOnMap])

  const displaySelectedReporting = displayReportingSelectedLayer && hasNoReportingConflict

  const selectedReportingVectorSourceRef = useRef(new VectorSource()) as MutableRefObject<VectorSource>

  const selectedReportingVectorLayerRef = useRef(
    new VectorLayer({
      renderBuffer: 7,
      source: selectedReportingVectorSourceRef.current,
      style: selectedReportingStyleFn,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: Layers.REPORTING_SELECTED.zIndex
    })
  ) as MutableRefObject<VectorLayerWithName>
  ;(selectedReportingVectorLayerRef.current as VectorLayerWithName).name = Layers.REPORTING_SELECTED.code

  useEffect(() => {
    const feature = selectedReportingVectorSourceRef.current.getFeatureById(
      `${Layers.REPORTING_SELECTED.code}:${selectedReportingIdOnMap}`
    )

    feature?.setProperties({
      overlayCoordinates: overlayCoordinates.reportings
    })
  }, [overlayCoordinates, selectedReportingIdOnMap])

  useEffect(() => {
    map.getLayers().push(selectedReportingVectorLayerRef.current)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      map.removeLayer(selectedReportingVectorLayerRef.current)
    }
  }, [map])

  useEffect(() => {
    selectedReportingVectorLayerRef.current?.setVisible(displaySelectedReporting)
  }, [displaySelectedReporting])

  useEffect(() => {
    selectedReportingVectorSourceRef.current?.clear(true)
    if (selectedReporting) {
      selectedReportingVectorSourceRef.current?.addFeature(
        getReportingZoneFeature(selectedReporting, Layers.REPORTING_SELECTED.code)
      )
    }
  }, [selectedReporting])

  return null
}
