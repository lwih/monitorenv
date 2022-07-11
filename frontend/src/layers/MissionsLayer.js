import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'


import { useGetMissionsQuery } from '../api/missionsAPI'

import { selectMissionOnMap } from '../domain/use_cases/selectMissionOnMap'
import Layers from '../domain/entities/layers'
import { getMissionCentroid } from './missionGeometryHelpers'
import { missionCentroidStyle } from './styles/missions.style'


export const MissionsLayer = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()
  const { data } = useGetMissionsQuery()
  const getMissionsCentroids = useCallback(()=>{
    return data?.filter(f=>!!f.geom).map(d => getMissionCentroid(d))
  }, [data])
  
  const vectorSourceRef = useRef(null)
  const GetVectorSource = () => {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource()
       
    }
    return vectorSourceRef.current
  }

  const vectorLayerRef = useRef(null)
  

  useEffect(() => {
    const GetVectorLayer = () => {
      if (vectorLayerRef.current === null) {
        vectorLayerRef.current = new VectorLayer({
          source: GetVectorSource(),
          style: missionCentroidStyle,
          renderBuffer: 7,
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: Layers.MISSIONS.zIndex,
        })
        vectorLayerRef.current.name = Layers.MISSIONS.code
      }
      return vectorLayerRef.current
    }

    map && map.getLayers().push(GetVectorLayer())

    return () => map && map.removeLayer(GetVectorLayer())
  }, [map])

  useEffect(() => {
    GetVectorSource()?.clear(true)
    if (getMissionsCentroids()) {
      GetVectorSource()?.addFeatures(getMissionsCentroids())
    }
  }, [getMissionsCentroids])

  useEffect(()=>{
    if (mapClickEvent?.feature) {
      const feature = mapClickEvent?.feature
      if(feature.getId()?.toString()?.includes('mission')) {
        const missionId = feature.getProperties().missionId
        dispatch(selectMissionOnMap(missionId))
      }
    }
  }, [mapClickEvent])

  return null
}
