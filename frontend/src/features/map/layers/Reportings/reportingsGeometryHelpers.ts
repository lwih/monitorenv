import { Feature } from 'ol'
import { GeoJSON } from 'ol/format'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map/constants'

import type { ReportingDetailed } from '../../../../domain/entities/reporting'
import type { AtLeast } from '../../../../types'

export const getReportingZoneFeature = (
  reporting: ReportingDetailed | AtLeast<ReportingDetailed, 'id'>,
  layername: string
) => {
  const geoJSON = new GeoJSON()
  const geometry = geoJSON.readGeometry(reporting.geom, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })

  const feature = new Feature({
    geometry
  })

  feature.setId(`${layername}:${reporting.id}`)
  feature.setProperties({
    actionTaken: reporting.actionTaken,
    attachedEnvActionId: reporting.attachedEnvActionId,
    attachedMission: reporting.attachedMission,
    attachedToMissionAtUtc: reporting.attachedToMissionAtUtc,
    controlStatus: reporting.controlStatus,
    controlUnitId: reporting.controlUnitId,
    createdAt: reporting.createdAt,
    description: reporting.description,
    detachedFromMissionAtUtc: reporting.detachedFromMissionAtUtc,
    displayedSource: reporting.displayedSource,
    geom: reporting.geom,
    id: reporting.id,
    isArchived: reporting.isArchived,
    missionId: reporting.missionId,
    reportingId: reporting.reportingId,
    reportType: reporting.reportType,
    semaphoreId: reporting.semaphoreId,
    sourceName: reporting.sourceName,
    subThemes: reporting.subThemes,
    theme: reporting.theme,
    validityTime: reporting.validityTime
  })

  return feature
}

export const getEditingReportingZoneFeature = (reporting: AtLeast<ReportingDetailed, 'id'>, layername: string) => {
  const geoJSON = new GeoJSON()
  const geometry = geoJSON.readGeometry(reporting.geom, {
    dataProjection: WSG84_PROJECTION,
    featureProjection: OPENLAYERS_PROJECTION
  })

  const feature = new Feature({
    geometry
  })
  feature.setId(`${layername}:${reporting.id}`)
  feature.setProperties({
    actionTaken: reporting.actionTaken,
    attachedEnvActionId: reporting.attachedEnvActionId,
    attachedMission: reporting.attachedMission,
    attachedToMissionAtUtc: reporting.attachedToMissionAtUtc,
    controlStatus: reporting.controlStatus,
    controlUnitId: reporting.controlUnitId,
    createdAt: reporting.createdAt,
    description: reporting.description,
    detachedFromMissionAtUtc: reporting.detachedFromMissionAtUtc,
    geom: reporting.geom,
    id: reporting.id,
    isArchived: reporting.isArchived,
    missionId: reporting.missionId,
    reportingId: reporting.reportingId,
    reportType: reporting.reportType,
    semaphoreId: reporting.semaphoreId,
    sourceName: reporting.sourceName,
    subThemes: reporting.subThemes,
    theme: reporting.theme,
    validityTime: reporting.validityTime
  })

  return feature
}
