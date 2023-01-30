import { Layers } from '../../../../domain/entities/layers/constants'
import { ActionTypeEnum } from '../../../../domain/entities/missions'
import { OverlayPositionOnCentroid } from '../OverlayPositionOnCentroid'
import { ControlCard } from './ControlCard'
import { SurveillanceCard } from './SurveillanceCard'

import type { MapChildrenProps } from '../../Map'

export function ActionOverlay({ currentFeatureOver, map }: MapChildrenProps) {
  const currentfeatureId = currentFeatureOver?.getId()
  const displayHoveredFeature =
    typeof currentfeatureId === 'string' && currentfeatureId.startsWith(`${Layers.ACTIONS.code}`)
  const displayControlCard =
    typeof currentfeatureId === 'string' &&
    currentfeatureId.startsWith(`${Layers.ACTIONS.code}:${ActionTypeEnum.CONTROL}`)
  const displaySurveillanceCard =
    typeof currentfeatureId === 'string' &&
    currentfeatureId.startsWith(`${Layers.ACTIONS.code}:${ActionTypeEnum.SURVEILLANCE}`)

  return (
    <OverlayPositionOnCentroid
      appClassName="overlay-action-hover"
      feature={displayHoveredFeature && currentFeatureOver}
      map={map}
    >
      {displayControlCard && <ControlCard feature={currentFeatureOver} />}
      {displaySurveillanceCard && <SurveillanceCard feature={currentFeatureOver} />}
    </OverlayPositionOnCentroid>
  )
}
