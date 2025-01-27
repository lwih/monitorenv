export enum LayerType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  BASE_LAYER = 'BASE_LAYER',
  FREE_DRAW = 'FREE_DRAW',
  MEASUREMENT = 'MEASUREMENT',
  REGULATORY = 'REGULATORY'
}

// TODO Generate `zIndex` from order of declaration rather than manually setting it.
export const Layers = {
  ACTIONS: {
    code: 'actions',
    zIndex: 1110
  },
  AEM: {
    code: 'aem_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: 'Zones AEM (MED)',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'name',
    type: LayerType.ADMINISTRATIVE
  },
  AMP: {
    code: 'AMP',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: 'environment_amp_areas',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.REGULATORY,
    zIndex: 925
  },
  BASE_LAYER: {
    code: 'baselayer',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.BASE_LAYER
  },
  DRAW: {
    code: 'draw_layer',
    zIndex: 1500
  },
  EEZ: {
    code: 'eez_areas',
    containsMultipleZones: true,
    group: null,
    isIntersectable: true,
    name: 'Zones ZEE',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'union',
    type: LayerType.ADMINISTRATIVE
  },
  FAO: {
    code: 'fao_areas',
    containsMultipleZones: true,
    getZoneName: feature => {
      if (feature.get(Layers.FAO.subSubZoneFieldKey)) {
        return feature.get(Layers.FAO.subSubZoneFieldKey)
      }
      if (feature.get(Layers.FAO.subZoneFieldKey)) {
        return feature.get(Layers.FAO.subZoneFieldKey)
      }
      if (feature.get(Layers.FAO.zoneFieldKey)) {
        return feature.get(Layers.FAO.zoneFieldKey)
      }

      return ''
    },
    group: null,
    isIntersectable: true,
    name: 'Zones FAO / CIEM',
    showMultipleZonesInAdministrativeZones: false,
    subSubZoneFieldKey: 'f_subdivis',
    subZoneFieldKey: 'f_division',
    type: LayerType.ADMINISTRATIVE,
    zoneFieldKey: 'f_subarea'
  },
  INTEREST_POINT: {
    zIndex: 1220
  },
  MEASUREMENT: {
    code: 'measurement',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.MEASUREMENT,
    zIndex: 1210
  },
  MISSION_SELECTED: {
    code: 'mission_selected',
    zIndex: 1050
  },
  MISSION_TO_ATTACH_ON_REPORTING: {
    code: 'mission_to_attach_on_reporting',
    zIndex: 1050
  },
  MISSIONS: {
    code: 'missions',
    zIndex: 1050
  },
  REGULATORY_ENV: {
    code: 'REGULATORY_ENV',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: 'environment_regulatory_areas',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.REGULATORY,
    zIndex: 900
  },
  REGULATORY_ENV_PREVIEW: {
    code: 'REGULATORY_ENV_PREVIEW',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: null,
    zIndex: 950
  },
  REPORTING_SELECTED: {
    code: 'reporting_selected',
    zIndex: 1025
  },
  REPORTING_TO_ATTACH_ON_MISSION: {
    code: 'reporting_to_attach_on_mission',
    zIndex: 1025
  },
  REPORTINGS: {
    code: 'reportings',
    zIndex: 1050
  },
  SELECTED_MISSION_TO_ATTACH_ON_REPORTING: {
    code: 'SELECTED_MISSION_TO_ATTACH_ON_REPORTING',
    zIndex: 1000
  },
  SELECTED_REPORTING_TO_ATTACH_ON_MISSION: {
    code: 'SELECTED_REPORTING_TO_ATTACH_ON_MISSION',
    zIndex: 1000
  },
  SEMAPHORES: {
    code: 'semaphores',
    zIndex: 1300
  },
  SIX_MILES: {
    code: '6_miles_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '6 Milles',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.ADMINISTRATIVE
  },
  STATIONS: {
    code: 'stations',
    // Station layer should always appear above all other layers
    zIndex: 2000
  },
  THREE_MILES: {
    code: '3_miles_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '3 Milles',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.ADMINISTRATIVE
  },
  TWELVE_MILES: {
    code: '12_miles_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '12 Milles',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: LayerType.ADMINISTRATIVE
  }
}

export const BaseLayers = {
  DARK: {
    code: 'DARK',
    text: 'Fond de carte sombre'
  },
  LIGHT: {
    code: 'LIGHT',
    text: 'Fond de carte clair'
  },
  OSM: {
    code: 'OSM',
    text: 'Open Street Map'
  },
  SATELLITE: {
    code: 'SATELLITE',
    text: 'Satellite'
  },
  SHOM: {
    code: 'SHOM',
    text: 'Carte marine (SHOM)'
  }
}

export const SelectableLayers = [
  Layers.MISSIONS.code,
  Layers.REGULATORY_ENV_PREVIEW.code,
  Layers.REGULATORY_ENV.code,
  Layers.AMP.code,
  Layers.STATIONS.code,
  Layers.SEMAPHORES.code,
  Layers.REPORTINGS.code,
  Layers.MISSION_TO_ATTACH_ON_REPORTING.code,
  Layers.REPORTING_TO_ATTACH_ON_MISSION.code
]
export const HoverableLayers = [
  Layers.MISSIONS.code,
  Layers.ACTIONS.code,
  Layers.STATIONS.code,
  Layers.SEMAPHORES.code,
  Layers.REPORTINGS.code,
  Layers.MISSION_TO_ATTACH_ON_REPORTING.code,
  Layers.REPORTING_TO_ATTACH_ON_MISSION.code
]
