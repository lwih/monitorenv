import {
  Accent,
  Button,
  Icon,
  IconButton,
  Size,
  THEME,
  Tag,
  customDayjs,
  getLocalizedDayjs
} from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { ReportingTypeEnum, getFormattedReportingId, reportingTypeLabels } from '../../../../domain/entities/reporting'
import { reportingStateActions } from '../../../../domain/shared_slices/ReportingState'
import { openReporting } from '../../../../domain/use_cases/reportings/openReporting'
import { useAppSelector } from '../../../../hooks/useAppSelector'

export function ReportingCard({ feature, selected = false }: { feature: any; selected?: boolean }) {
  const dispatch = useDispatch()
  const {
    global: { displayReportingsLayer }
  } = useAppSelector(state => state)

  const {
    createdAt,
    description,
    displayedSource,
    id,
    isArchived,
    reportingId,
    reportType,
    subThemes,
    theme,
    validityTime
  } = feature.getProperties()

  const creationDate = getLocalizedDayjs(createdAt).format('DD MMM YYYY à HH:mm')
  const endOfValidity = getLocalizedDayjs(createdAt).add(validityTime || 0, 'hour')
  const timeLeft = customDayjs(endOfValidity).diff(getLocalizedDayjs(customDayjs().toISOString()), 'hour', true)

  const subThemesFormatted = subThemes?.map(subTheme => subTheme).join(', ')

  const timeLeftText = useMemo(() => {
    if (timeLeft < 0 || isArchived) {
      return 'Archivé'
    }

    if (timeLeft > 0 && timeLeft < 1) {
      return 'Fin dans < 1h'
    }

    return `Fin dans ${Math.round(timeLeft)} h`
  }, [timeLeft, isArchived])

  const editReporting = () => {
    dispatch(openReporting(id))
  }

  const closeReportingCard = useCallback(() => {
    dispatch(reportingStateActions.setSelectedReportingIdOnMap(undefined))
  }, [dispatch])

  if (!displayReportingsLayer) {
    return null
  }

  return (
    <Wrapper data-cy="reporting-overlay">
      <StyledHeader>
        <StyledHeaderFirstLine>
          <StyledBoldText>{`SIGNALEMENT ${getFormattedReportingId(reportingId)}`}</StyledBoldText>
          <StyledBoldText>{displayedSource}</StyledBoldText>
          <StyledGrayText>
            <StyledBullet
              color={
                reportType === ReportingTypeEnum.INFRACTION_SUSPICION
                  ? THEME.color.maximumRed
                  : THEME.color.blueGray[100]
              }
            />
            {reportingTypeLabels[reportType]?.label}
          </StyledGrayText>
          <StyledGrayText>{creationDate} (UTC)</StyledGrayText>
        </StyledHeaderFirstLine>

        <StyledHeaderSecondLine>
          {timeLeft > 0 && !isArchived && (
            <>
              <Icon.Clock />
              <span>{timeLeftText}</span>
            </>
          )}

          <CloseButton
            $isVisible={selected}
            accent={Accent.TERTIARY}
            data-cy="reporting-overlay-close"
            Icon={Icon.Close}
            iconSize={14}
            onClick={closeReportingCard}
          />
        </StyledHeaderSecondLine>
      </StyledHeader>

      <div>
        <StyledThemeContainer>
          {theme && <StyledBoldText>{theme}</StyledBoldText>}
          {subThemes?.length > 0 && <StyledMediumText>&nbsp;/&nbsp;{subThemesFormatted}</StyledMediumText>}
        </StyledThemeContainer>
        {description && <StyledDescription title={description}>{description}</StyledDescription>}
      </div>
      {(timeLeft < 0 || isArchived) && <StyledTag isLight>Archivé</StyledTag>}
      <StyledButton Icon={Icon.Edit} onClick={editReporting} size={Size.SMALL}>
        Editer le signalement
      </StyledButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 10px;
  box-shadow: 0px 3px 6px #70778540;
  border-radius: 1px;
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 0 0 345px;
`
const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: space-between;
`

const StyledHeaderFirstLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  > span {
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const StyledHeaderSecondLine = styled.div`
  display: flex;
  flex-direction: row;
  > span {
    margin-left: 4px;
    color: ${p => p.theme.color.charcoal};
  }
`
const CloseButton = styled(IconButton)<{ $isVisible: boolean }>`
  padding: 0px;
  margin-left: 8px;
  ${p => !p.$isVisible && 'visibility: hidden;'};
`

const StyledBoldText = styled.span`
  font-weight: 700;
  color: ${p => p.theme.color.gunMetal};
`
const StyledMediumText = styled.span`
  font-weight: 500;
  color: ${p => p.theme.color.gunMetal};
`
const StyledGrayText = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: flex;
  align-items: baseline;
`
const StyledBullet = styled.div<{ color: string }>`
  border-radius: 50%;
  background-color: ${p => p.color};
  width: 10px;
  height: 10px;
  margin-right: 6px;
`
const StyledDescription = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: ${p => p.theme.color.gunMetal};
  padding-right: 32px;
`

const StyledThemeContainer = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  padding-right: 32px;
`
const StyledTag = styled(Tag)`
  align-self: start;
  color: ${p => p.theme.color.slateGray};
  border: 1px solid ${p => p.theme.color.slateGray};
`

// TODO delete when Monitor-ui component have good padding
const StyledButton = styled(Button)`
  padding: 4px 12px;
  align-self: start;
  width: inherit;
`