import { useEffect, useRef, useState } from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'
import { setCoordinatesFormat } from '../../../domain/shared_slices/Map'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'
import { getCoordinates } from '../../../utils/coordinates'

import type { BaseMapChildrenProps } from '../BaseMap'
import type { Coordinate } from 'ol/coordinate'

let lastEventForPointerMove
let timeoutForPointerMove

export function MapCoordinatesBox({ map }: BaseMapChildrenProps) {
  const [coordinates, setCursorCoordinates] = useState<Coordinate>()

  useEffect(() => {
    function throttleAndHandlePointerMove(event) {
      if (event.dragging || timeoutForPointerMove) {
        if (timeoutForPointerMove) {
          lastEventForPointerMove = event
        }

        return
      }

      timeoutForPointerMove = window.setTimeout(() => {
        timeoutForPointerMove = null

        saveCoordinates(lastEventForPointerMove)
      }, 50)
    }
    function saveCoordinates(event) {
      if (event) {
        const clickedCoordinates = map?.getCoordinateFromPixel(event.pixel)
        if (clickedCoordinates) {
          setCursorCoordinates(clickedCoordinates)
        }
      }
    }
    if (map) {
      map.on('pointermove', event => throttleAndHandlePointerMove(event))
    }
  })

  const wrapperRef = useRef(null)

  const dispatch = useAppDispatch()
  const { coordinatesFormat } = useAppSelector(state => state.map)
  const [coordinatesSelectionIsOpen, setCoordinatesSelectionIsOpen] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, coordinatesSelectionIsOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setCoordinatesSelectionIsOpen(false)
    }
  }, [clickedOutsideComponent])

  return (
    <StyledCoordinatesContainer ref={wrapperRef}>
      <CoordinatesTypeSelection isOpen={coordinatesSelectionIsOpen}>
        <Header data-cy="coordinates-selection" onClick={() => setCoordinatesSelectionIsOpen(false)}>
          Unités des coordonnées
        </Header>
        <RadioWrapper
          inline
          name="coordinatesRadio"
          onChange={value => dispatch(setCoordinatesFormat(value))}
          value={coordinatesFormat}
        >
          <Radio inline title="Degrés Minutes Secondes" value={CoordinatesFormat.DEGREES_MINUTES_SECONDS}>
            DMS
          </Radio>
          <Radio
            data-cy="coordinates-selection-dmd"
            inline
            title="Degrés Minutes Décimales"
            value={CoordinatesFormat.DEGREES_MINUTES_DECIMALS}
          >
            DMD
          </Radio>
          <Radio
            data-cy="coordinates-selection-dd"
            inline
            title="Degrés Décimales"
            value={CoordinatesFormat.DECIMAL_DEGREES}
          >
            DD
          </Radio>
        </RadioWrapper>
      </CoordinatesTypeSelection>
      <Coordinates onClick={() => setCoordinatesSelectionIsOpen(!coordinatesSelectionIsOpen)}>
        {getShowedCoordinates(coordinates, coordinatesFormat)} ({coordinatesFormat})
      </Coordinates>
    </StyledCoordinatesContainer>
  )
}

const getShowedCoordinates = (coordinates, coordinatesFormat) => {
  const transformedCoordinates = getCoordinates(coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)

  if (Array.isArray(transformedCoordinates) && transformedCoordinates.length === 2) {
    return `${transformedCoordinates[0]} ${transformedCoordinates[1]}`
  }

  return ''
}

const StyledCoordinatesContainer = styled.div`
  z-index: 2;
`
const RadioWrapper = styled(RadioGroup)`
  padding: 6px 12px 12px 12px !important;
`

const Header = styled.span`
  background-color: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 5px 0;
  width: 100%;
  display: inline-block;
  cursor: pointer;
  border: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const CoordinatesTypeSelection = styled.span<{ isOpen: boolean }>`
  position: absolute;
  bottom: 40px;
  left: 40px;
  display: inline-block;
  margin: 1px;
  color: ${p => p.theme.color.slateGray};
  text-align: center;
  background-color: ${p => p.theme.color.white};
  width: 237px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  height: ${props => (props.isOpen ? 69 : 0)}px;
  transition: all 0.5s;
  overflow: hidden;
`

const Coordinates = styled.span`
  box-sizing: content-box;
  position: absolute;
  bottom: 11px;
  left: 40px;
  display: inline-block;
  padding: 2px 0 6px 2px;
  color: ${p => p.theme.color.gainsboro};
  text-align: center;
  height: 17px;
  background-color: ${p => p.theme.color.charcoal};
  width: 235px;
  cursor: pointer;
`
