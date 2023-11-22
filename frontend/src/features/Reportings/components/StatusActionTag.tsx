import { THEME, Tag } from '@mtes-mct/monitor-ui'

import { ControlStatusLabels, ControlStatusEnum } from '../../../domain/entities/reporting'

export function StatusActionTag({
  backgroundColor = THEME.color.gainsboro,
  controlStatus = ControlStatusEnum.CONTROL_TO_BE_DONE
}: {
  backgroundColor?: string
  controlStatus: ControlStatusEnum
}) {
  return (
    <Tag
      backgroundColor={backgroundColor}
      iconColor={
        controlStatus === ControlStatusEnum.CONTROL_TO_BE_DONE ? THEME.color.goldenPoppy : THEME.color.mediumSeaGreen
      }
      withBullet
    >
      {ControlStatusLabels[controlStatus]}
    </Tag>
  )
}
