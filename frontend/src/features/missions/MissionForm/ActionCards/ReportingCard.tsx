import { Accent, Button, Icon, THEME } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { Accented, ReportingDate, SummaryContent } from './style'
import { ActionTypeEnum, type Mission, type NewMission } from '../../../../domain/entities/missions'
import { ControlStatusEnum, type ReportingForTimeline } from '../../../../domain/entities/reporting'
import { getDateAsLocalizedStringCompact } from '../../../../utils/getDateAsLocalizedString'
import { StatusActionTag } from '../../../Reportings/components/StatusActionTag'
import { getFormattedReportingId } from '../../../Reportings/utils'
import { actionFactory } from '../../Missions.helpers'

export function ReportingCard({
  action,
  setCurrentActionIndex
}: {
  action: ReportingForTimeline
  setCurrentActionIndex: (string) => void
}) {
  const { setFieldValue, values } = useFormikContext<Partial<Mission | NewMission>>()

  const addAttachedControl = e => {
    e.stopPropagation()
    const newControl = actionFactory({
      actionTargetType: action.targetType,
      actionType: ActionTypeEnum.CONTROL,
      reportingIds: [Number(action.id)],
      vehicleType: action.vehicleType,
      ...(action.theme && {
        themes: [
          {
            subThemes: action.subThemes || [],
            theme: action.theme
          }
        ]
      })
    })

    setFieldValue('envActions', [newControl, ...(values?.envActions || [])])
    setCurrentActionIndex(newControl.id)
  }

  const getControlStatus = () => {
    const attachedAction = values?.envActions?.find(a => a.id === action.attachedEnvActionId)

    if (action.attachedEnvActionId && attachedAction?.actionType === ActionTypeEnum.CONTROL) {
      return ControlStatusEnum.CONTROL_DONE
    }

    return ControlStatusEnum.SURVEILLANCE_DONE
  }

  return (
    <>
      <Icon.Report color={THEME.color.charcoal} size={20} />
      <SummaryContent>
        <Accented>{`Signalement ${getFormattedReportingId(action.reportingId)} ${action.displayedSource}`}</Accented>
        <ReportingDate>{getDateAsLocalizedStringCompact(action.createdAt)}</ReportingDate>
        <Accented>{action.theme}</Accented> {action.theme && '-'} {action.description || 'Aucune description'}
        <ControlContainer $isEndAlign={!action.attachedEnvActionId}>
          {action.attachedEnvActionId && (
            <StatusActionTag backgroundColor={THEME.color.white} controlStatus={getControlStatus()} />
          )}

          {!action.attachedEnvActionId && (
            <Button accent={Accent.SECONDARY} Icon={Icon.ControlUnit} onClick={addAttachedControl}>
              Ajouter un contrôle
            </Button>
          )}
        </ControlContainer>
      </SummaryContent>
    </>
  )
}

const ControlContainer = styled.div<{ $isEndAlign: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${p => (p.$isEndAlign ? 'end' : 'start')};
  padding-top: 16px;
`
