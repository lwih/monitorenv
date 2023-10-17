import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditInterestPoint } from './EditInterestPoint'
import { MapToolType } from '../../../../domain/entities/map/constants'
import { globalActions, ReportingContext, VisibilityState } from '../../../../domain/shared_slices/Global'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../../../domain/shared_slices/InterestPoint'
import { reduceReportingFormOnMap } from '../../../../domain/use_cases/reporting/reduceReportingFormOnMap'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useEscapeFromKeyboardAndExecute } from '../../../../hooks/useEscapeFromKeyboardAndExecute'
import { MapToolButton } from '../MapToolButton'

export function InterestPointMapButton() {
  const dispatch = useAppDispatch()
  const { displayInterestPoint, healthcheckTextWarning, isMapToolVisible, reportingFormVisibility } = useAppSelector(
    state => state.global
  )
  const isOpen = useMemo(() => isMapToolVisible === MapToolType.INTEREST_POINT, [isMapToolVisible])
  const wrapperRef = useRef(null)

  const close = useCallback(() => {
    dispatch(globalActions.setIsMapToolVisible(undefined))
  }, [dispatch])

  useEscapeFromKeyboardAndExecute(close)

  useEffect(() => {
    if (!isOpen) {
      dispatch(endInterestPointDraw())
      dispatch(deleteInterestPointBeingDrawed())
    }
  }, [dispatch, isOpen])

  const openOrCloseInterestPoint = useCallback(() => {
    if (!isOpen) {
      dispatch(drawInterestPoint())
      dispatch(globalActions.setIsMapToolVisible(MapToolType.INTEREST_POINT))
    } else {
      close()
    }
    dispatch(reduceReportingFormOnMap())
  }, [close, dispatch, isOpen])

  return (
    <Wrapper
      ref={wrapperRef}
      reportingFormVisibility={
        reportingFormVisibility.context === ReportingContext.MAP
          ? reportingFormVisibility.visibility
          : VisibilityState.NONE
      }
    >
      <MapToolButton
        dataCy="interest-point"
        icon={Icon.Landmark}
        isHidden={!displayInterestPoint}
        isOpen={isOpen}
        onClick={openOrCloseInterestPoint}
        style={{ top: 301 }}
        title={"Créer un point d'intérêt"}
      />

      <EditInterestPoint close={close} healthcheckTextWarning={healthcheckTextWarning} isOpen={isOpen} />
    </Wrapper>
  )
}

const Wrapper = styled.div<{ reportingFormVisibility: VisibilityState }>`
  position: absolute;
  top: 346px;
  transition: right 0.3s ease-out;
  right: ${p => (p.reportingFormVisibility === VisibilityState.VISIBLE ? '0' : '10')}px;
`