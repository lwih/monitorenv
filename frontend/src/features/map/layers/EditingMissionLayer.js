import {  useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'


import Layers from '../../../domain/entities/layers'
import { selectedMissionStyle, selectedMissionActionsStyle } from './styles/missions.style'
import { getMissionZoneFeature, getActionsFeatures } from './missionGeometryHelpers'


export const EditingMissionLayer = ({ map }) => {
  const { missionState } = useSelector(state => state.missionState)
  const { displayEditingMissionLayer } = useSelector(state => state.global)
  
  const editingMissionVectorSourceRef = useRef(null)
  const GetEditingMissionVectorSource = () => {
    if (editingMissionVectorSourceRef.current === null) {
      editingMissionVectorSourceRef.current = new VectorSource()
       
    }
    return editingMissionVectorSourceRef.current
  }

  const editingMissionActionsVectorSourceRef = useRef(null)
  const GetEditingMissionActionsVectorSource = () => {
    if (editingMissionActionsVectorSourceRef.current === null) {
      editingMissionActionsVectorSourceRef.current = new VectorSource()
       
    }
    return editingMissionActionsVectorSourceRef.current
  }

  const editingMissionVectorLayerRef = useRef(null)
  const editingMissionActionsVectorLayerRef = useRef(null)
  

  const GetSelectedMissionVectorLayer = () => {
    if (editingMissionVectorLayerRef.current === null) {
      editingMissionVectorLayerRef.current = new VectorLayer({
        source: GetEditingMissionVectorSource(),
        style: selectedMissionStyle,
        renderBuffer: 7,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.MISSION_SELECTED.zIndex,
      })
      editingMissionVectorLayerRef.current.name = Layers.MISSION_SELECTED.code
    }
    return editingMissionVectorLayerRef.current
  }
  const GetSelectedMissionActionsVectorLayer = () => {
    if (editingMissionActionsVectorLayerRef.current === null) {
      editingMissionActionsVectorLayerRef.current = new VectorLayer({
        source: GetEditingMissionActionsVectorSource(),
        style: selectedMissionActionsStyle,
        renderBuffer: 7,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.ACTIONS.zIndex,
      })
      editingMissionActionsVectorLayerRef.current.name = Layers.ACTIONS.code
    }
    return editingMissionActionsVectorLayerRef.current
  }
  
  useEffect(() => {
    if (map) {
      const layersCollection = map.getLayers()
      layersCollection.push(GetSelectedMissionVectorLayer())
      layersCollection.push(GetSelectedMissionActionsVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(GetSelectedMissionVectorLayer())}
        map.removeLayer(GetSelectedMissionActionsVectorLayer())
      }
  }, [map])

  useEffect(() => {
    GetSelectedMissionVectorLayer()?.setVisible(displayEditingMissionLayer)
    GetSelectedMissionActionsVectorLayer()?.setVisible(displayEditingMissionLayer)
  }, [displayEditingMissionLayer])

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