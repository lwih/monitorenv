import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { ReportingFormWithContext } from './ReportingForm'
import { StyledChevronIcon, StyledHeader, StyledHeaderButtons, StyledTitle } from './style'
import { getReportingTitle } from './utils'
import { hideSideButtons, ReportingContext, VisibilityState } from '../../domain/shared_slices/Global'
import { closeReporting } from '../../domain/use_cases/reportings/closeReporting'
import { reduceOrExpandReportingForm } from '../../domain/use_cases/reportings/reduceOrExpandReportingForm'
import { switchReporting } from '../../domain/use_cases/reportings/switchReporting'
import { useAppSelector } from '../../hooks/useAppSelector'

import type { ReportingType } from '../../domain/shared_slices/reporting'

export function Reportings({ context }: { context: ReportingContext }) {
  const reportingFormVisibility = useAppSelector(state => state.global.reportingFormVisibility)
  const activeReportingId = useAppSelector(state => state.reporting.activeReportingId)
  const reportings = useAppSelector(state => state.reporting.reportings)

  const dispatch = useDispatch()
  const reportingsTabs = useMemo(
    () =>
      (reportings &&
        Object.values(reportings).filter(
          (reporting: ReportingType) => reporting.context === context && activeReportingId !== reporting?.reporting?.id
        )) ||
      [],
    [reportings, activeReportingId, context]
  )

  const reduceOrExpandReporting = async reporting => {
    const { id } = reporting.reporting

    if (activeReportingId === id && reportingFormVisibility.context === context) {
      return dispatch(reduceOrExpandReportingForm(context))
    }

    if (reporting.context === ReportingContext.MAP) {
      dispatch(hideSideButtons())
    }

    return dispatch(switchReporting(id, context))
  }

  return (
    <>
      {reportingFormVisibility.context === context && (
        <ReportingFormWithContext key={context} context={context} totalReportings={reportingsTabs.length} />
      )}

      {reportingsTabs.map((reporting, index) => {
        const reducedReporting = reporting.reporting
        const isSeparatorVisible = !!(
          (index < reportingsTabs.length && activeReportingId && reportingFormVisibility.context === context) ||
          !(index + 1 === reportingsTabs.length && (!activeReportingId || reportingFormVisibility.context !== context))
        )

        return (
          <StyledContainer
            key={`${reducedReporting?.id}-${context}`}
            $position={index}
            $reportingContext={reporting.context}
            $reportingFormVisibility={reportingFormVisibility.visibility}
          >
            <Separator $visible={isSeparatorVisible} />
            <StyledHeader>
              <StyledTitle>
                <Icon.Report />
                {getReportingTitle(reducedReporting)}
              </StyledTitle>

              <StyledHeaderButtons>
                <StyledChevronIcon
                  $isOpen
                  accent={Accent.TERTIARY}
                  Icon={Icon.Chevron}
                  onClick={() => reduceOrExpandReporting(reporting)}
                />
                <IconButton
                  accent={Accent.TERTIARY}
                  Icon={Icon.Close}
                  onClick={() => dispatch(closeReporting(reducedReporting?.id, context))}
                />
              </StyledHeaderButtons>
            </StyledHeader>
          </StyledContainer>
        )
      })}
    </>
  )
}

const Separator = styled.div<{ $visible: boolean }>`
  height: 2px;
  width: 100%;
  background-color: white;
  position: absolute;
  display: ${p => (p.$visible ? 'block' : 'none')};
`

const StyledContainer = styled.div<{
  $position: number
  $reportingContext: ReportingContext
  $reportingFormVisibility: VisibilityState
}>`
  background-color: transparent;
  position: absolute;
  bottom: ${p => p.$position * 52}px;
  width: 500px;
  height: 52px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: top 0.5s ease-out;
  z-index: 100;

  ${p => {
    if (p.$reportingContext === ReportingContext.MAP) {
      switch (p.$reportingFormVisibility) {
        case VisibilityState.VISIBLE:
          return 'right: 8px;'
        case VisibilityState.VISIBLE_LEFT:
          return 'right: 56px;'
        case VisibilityState.REDUCED:
          return `right: 12px;`
        case VisibilityState.NONE:
        default:
          return 'right: -500px;'
      }
    }

    return 'right: 0px;'
  }}
`
