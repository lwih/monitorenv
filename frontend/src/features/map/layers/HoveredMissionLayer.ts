import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { MutableRefObject, useEffect, useRef } from 'react'

import { Layers } from '../../../domain/entities/layers/constants'
import { missionZoneStyle } from './styles/missions.style'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { MapChildrenProps } from '../Map'

export function HoveredMissionLayer({ currentFeatureOver, map }: MapChildrenProps) {
  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const GetVectorSource = () => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource()
    }

    return vectorSourceRef.current
  }

  const vectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>

  useEffect(() => {
    const GetVectorLayer = () => {
      if (vectorLayerRef.current === undefined) {
        vectorLayerRef.current = new VectorLayer({
          renderBuffer: 7,
          source: GetVectorSource(),
          style: missionZoneStyle,
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: Layers.MISSIONS.zIndex
        }) as VectorLayerWithName
        vectorLayerRef.current.name = Layers.MISSION_SELECTED.code
      }

      return vectorLayerRef.current
    }

    if (map) {
      map.getLayers().push(GetVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(GetVectorLayer())
      }
    }
  }, [map])

  useEffect(() => {
    GetVectorSource()?.clear(true)
    if (currentFeatureOver) {
      GetVectorSource()?.addFeature(currentFeatureOver)
    }
  }, [currentFeatureOver])

  return null
}