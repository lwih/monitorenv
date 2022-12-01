import Overlay from 'ol/Overlay'
import { MutableRefObject, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { ReactComponent as CloseIconSVG } from '../../../uiMonitor/icons/Close.svg'

type MeasurementOverlayProps = {
  coordinates: any[]
  deleteFeature?: Function
  id?: String
  map: any
  measurement: any
}

export function MeasurementOverlay({ coordinates, deleteFeature, id, map, measurement }: MeasurementOverlayProps) {
  const overlayRef = useRef()
  const olOverlayObjectRef = useRef() as MutableRefObject<Overlay>
  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (ref) {
        olOverlayObjectRef.current = new Overlay({
          className: `ol-overlay-container ol-selectable`,
          element: ref,
          offset: [0, -7],
          position: coordinates,
          positioning: 'bottom-center'
        })
      }
    },
    [overlayRef, olOverlayObjectRef, coordinates]
  )

  useEffect(() => {
    if (map) {
      map.addOverlay(olOverlayObjectRef.current)

      return () => {
        map.removeOverlay(olOverlayObjectRef.current)
      }
    }

    return () => {}
  }, [map, olOverlayObjectRef])

  return (
    <div>
      <MeasurementOverlayElement ref={overlayCallback}>
        <ZoneSelected>
          <ZoneText data-cy="measurement-value">{measurement}</ZoneText>
          <CloseIcon data-cy="close-measurement" onClick={() => deleteFeature && deleteFeature(id)} />
        </ZoneSelected>
        <TrianglePointer>
          <TriangleShadow />
        </TrianglePointer>
      </MeasurementOverlayElement>
    </div>
  )
}

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.gainsboro} transparent;
  text-align: center;
  margin: auto;
  margin-top: -3px;
`

const MeasurementOverlayElement = styled.div``

const ZoneText = styled.span`
  margin-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const ZoneSelected = styled.div`
  background: ${COLORS.gainsboro};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  margin-left: 0;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
`