import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { Layers } from '../../../domain/entities/layers/constants'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { getMissionZoneFeature, getActionsFeatures } from './missionGeometryHelpers'
import { selectedMissionStyle, selectedMissionActionsStyle } from './styles/missions.style'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { MapChildrenProps } from '../Map'

export function EditingMissionLayer({ map }: MapChildrenProps) {
  const { missionState } = useAppSelector(state => state.missionState)
  const { displayEditingMissionLayer } = useAppSelector(state => state.global)

  const editingMissionVectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const GetEditingMissionVectorSource = () => {
    if (editingMissionVectorSourceRef.current === undefined) {
      editingMissionVectorSourceRef.current = new VectorSource()
    }

    return editingMissionVectorSourceRef.current
  }

  const editingMissionActionsVectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const GetEditingMissionActionsVectorSource = () => {
    if (editingMissionActionsVectorSourceRef.current === undefined) {
      editingMissionActionsVectorSourceRef.current = new VectorSource()
    }

    return editingMissionActionsVectorSourceRef.current
  }

  const editingMissionVectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>
  const editingMissionActionsVectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>

  const GetSelectedMissionVectorLayer = useCallback(() => {
    if (editingMissionVectorLayerRef.current === undefined) {
      editingMissionVectorLayerRef.current = new VectorLayer({
        renderBuffer: 7,
        source: GetEditingMissionVectorSource(),
        style: selectedMissionStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.MISSION_SELECTED.zIndex
      })
      editingMissionVectorLayerRef.current.name = Layers.MISSION_SELECTED.code
    }

    return editingMissionVectorLayerRef.current
  }, [])

  const GetSelectedMissionActionsVectorLayer = useCallback(() => {
    if (editingMissionActionsVectorLayerRef.current === undefined) {
      editingMissionActionsVectorLayerRef.current = new VectorLayer({
        renderBuffer: 7,
        source: GetEditingMissionActionsVectorSource(),
        style: selectedMissionActionsStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.ACTIONS.zIndex
      })
      editingMissionActionsVectorLayerRef.current.name = Layers.ACTIONS.code
    }

    return editingMissionActionsVectorLayerRef.current
  }, [])

  useEffect(() => {
    if (map) {
      const layersCollection = map.getLayers()
      layersCollection.push(GetSelectedMissionVectorLayer())
      layersCollection.push(GetSelectedMissionActionsVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(GetSelectedMissionVectorLayer())
        map.removeLayer(GetSelectedMissionActionsVectorLayer())
      }
    }
  }, [map, GetSelectedMissionVectorLayer, GetSelectedMissionActionsVectorLayer])

  useEffect(() => {
    GetSelectedMissionVectorLayer()?.setVisible(displayEditingMissionLayer)
    GetSelectedMissionActionsVectorLayer()?.setVisible(displayEditingMissionLayer)
  }, [displayEditingMissionLayer, GetSelectedMissionVectorLayer, GetSelectedMissionActionsVectorLayer])

  useEffect(() => {
    GetEditingMissionVectorSource()?.clear(true)
    GetEditingMissionActionsVectorSource()?.clear(true)
    if (missionState) {
      GetEditingMissionVectorSource()?.addFeature(getMissionZoneFeature(missionState, Layers.MISSION_SELECTED.code))
      GetEditingMissionActionsVectorSource()?.addFeatures(getActionsFeatures(missionState))
    }
  }, [missionState])

  return null
}