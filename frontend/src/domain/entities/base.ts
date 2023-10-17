import type { ControlUnit } from './controlUnit'

export namespace Base {
  export interface Base {
    controlUnitResourceIds: number[]
    controlUnitResources: ControlUnit.ControlUnitResourceData[]
    id: number
    latitude: number
    longitude: number
    name: string
  }

  // ---------------------------------------------------------------------------
  // Types

  export type BaseData = Omit<Base, 'controlUnitResourceIds' | 'controlUnitResources'>
  export type NewBaseData = Omit<BaseData, 'id'>
}