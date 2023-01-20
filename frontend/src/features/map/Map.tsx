import { BaseMap } from './BaseMap'
import { MapAttributionsBox } from './controls/MapAttributionsBox'
import { MapCoordinatesBox } from './controls/MapCoordinatesBox'
import { AdministrativeLayers } from './layers/AdministrativeLayers'
import { BaseLayer } from './layers/BaseLayer'
import { DrawLayer } from './layers/DrawLayer'
import { EditingMissionLayer } from './layers/EditingMissionLayer'
import { HoveredMissionLayer } from './layers/HoveredMissionLayer'
import { InterestPointLayer } from './layers/InterestPointLayer'
import { MeasurementLayer } from './layers/MeasurementLayer'
import { MissionsLayer } from './layers/MissionsLayer'
import { RegulatoryLayers } from './layers/RegulatoryLayers'
import { RegulatoryPreviewLayer } from './layers/RegulatoryPreviewLayer'
import { SelectedMissionLayer } from './layers/SelectedMissionLayer'
import { MapExtentController } from './MapExtentController'
import { MapHistory } from './MapHistory'
import { ActionOverlay } from './overlays/actions/ActionOverlay'
import { MissionOverlays } from './overlays/missions/MissionOverlays'
import { ShowRegulatoryMetadata } from './ShowRegulatoryMetadata'

import type { MapClickEvent } from '../../types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type OpenLayerMap from 'ol/Map'

export type MapChildrenProps = Partial<{
  currentFeatureOver: Feature<Geometry>
  map: OpenLayerMap
  mapClickEvent: MapClickEvent
}>

export function Map() {
  // const [shouldUpdateView, setShouldUpdateView] = useState(true)
  // const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  // const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState(null)
  // const [handlePointerMoveEventPixel, setHandlePointerMoveEventPixel] = useState(null)

  // const handleMovingAndZoom = () => {
  //   if (!shouldUpdateView) {
  //     setShouldUpdateView(true)
  //   }
  //   setHistoryMoveTrigger({ dummyUpdate: true })
  //   setMapMovingAndZoomEvent({ dummyUpdate: true })
  // }

  // const handlePointerMove = (event) => {
  //   if (event) {
  //     setHandlePointerMoveEventPixel(event.pixel)
  //   }
  // }

  return (
    <BaseMap
    // BaseMap forwards map & mapClickEvent as props to children
    // handleMovingAndZoom={handleMovingAndZoom}
    // handlePointerMove={handlePointerMove}
    >
      <MapAttributionsBox />
      <MapCoordinatesBox />
      <BaseLayer />
      <RegulatoryLayers />
      <RegulatoryPreviewLayer />
      <ShowRegulatoryMetadata />
      <AdministrativeLayers />
      <MeasurementLayer />
      <InterestPointLayer />
      <MapExtentController />
      <MapHistory />
      <DrawLayer />
      <MissionsLayer />
      <SelectedMissionLayer />
      <EditingMissionLayer />
      <HoveredMissionLayer />
      <MissionOverlays />
      <ActionOverlay />
    </BaseMap>
  )
}