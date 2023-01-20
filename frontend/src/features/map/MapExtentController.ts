import { useEffect } from 'react'

import { useAppSelector } from '../../hooks/useAppSelector'

import type { MapChildrenProps } from './Map'

const DEFAULT_MAP_ANIMATION_DURATION = 1000
const MAX_ZOOM_LEVEL = 14

export function MapExtentController({ map }: MapChildrenProps) {
  const { fitToExtent, zoomToCenter } = useAppSelector(state => state.map)

  useEffect(() => {
    if (fitToExtent) {
      const options = {
        duration: DEFAULT_MAP_ANIMATION_DURATION,
        maxZoom: MAX_ZOOM_LEVEL,
        padding: [30, 30, 30, 30]
      }
      map?.getView().fit(fitToExtent, options)
    }
  }, [map, fitToExtent])

  useEffect(() => {
    if (zoomToCenter) {
      map?.getView().animate({ center: zoomToCenter })
    }
  }, [map, zoomToCenter])

  return null
}