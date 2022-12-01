import { format, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { actionTargetTypeEnum } from '../../../../domain/entities/missions'
import { ControlInfractionsTags } from '../../../../ui/ControlInfractionsTags'

export function ActionCard({ feature }) {
  const {
    // actionType,
    actionNumberOfControls,
    actionStartDateTimeUtc,
    // actionTheme,
    actionTargetType,
    infractions
  } = feature.getProperties()
  const parsedactionStartDateTimeUtc = new Date(actionStartDateTimeUtc)

  return (
    <ActionCardHeader selected>
      <Col1>
        <ActionDate>
          {isValid(parsedactionStartDateTimeUtc) && format(parsedactionStartDateTimeUtc, 'dd MMM yyyy', { locale: fr })}
        </ActionDate>
      </Col1>
      <Col2>
        <ControlSummary>
          <Accented>{actionNumberOfControls || 0}</Accented>
          {` contrôle${actionNumberOfControls > 1 ? 's' : ''} réalisé${
            actionNumberOfControls > 1 ? 's' : ''
          } sur des cibles de type `}
          <Accented>{actionTargetTypeEnum[actionTargetType]?.libelle || 'non spécifié'}</Accented>
        </ControlSummary>
        <ControlInfractionsTags actionNumberOfControls={actionNumberOfControls} infractions={infractions} />
        <Accented>{infractions || 0}</Accented>infraction(s)
      </Col2>
    </ActionCardHeader>
  )
}

const ActionCardHeader = styled.div<{ selected: boolean }>`
  background: ${COLORS.white};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  display: flex;
  width: 265px;
  z-index: ${p => (p.selected ? 4900 : 5000)};
`

const ActionDate = styled.div`
  width: 80px;
  font-size: 12px;
  margin-right: 16px;
`

const Accented = styled.span`
  font-weight: bold;
`

const ControlSummary = styled.div`
  font: normal normal normal 13px/18px Marianne;
  color: ${COLORS.slateGray};
  margin-bottom: 16px;
`

const Col1 = styled.div`
  padding: 8px 0px 5px 10px;
`
const Col2 = styled.div`
  padding: 8px 8px 4px 8px;
`