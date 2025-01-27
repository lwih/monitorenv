import type { GeoJSON } from '../types/GeoJSON'

export type AMPFromAPI = {
  designation: string
  geom: GeoJSON.MultiPolygon
  id: number
  name: string
  type: string
}
export type AMP = AMPFromAPI & { bbox: number[] }
