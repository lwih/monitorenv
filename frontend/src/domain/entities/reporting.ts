/* eslint-disable typescript-sort-keys/string-enum */
import { customDayjs as dayjs } from '@mtes-mct/monitor-ui'

import type { ActionTypeEnum, Mission } from './missions'
import type { ReportingTargetTypeEnum } from './targetType'

export type Reporting = {
  actionTaken?: string
  attachedEnvActionId?: string
  attachedMission?: Mission
  attachedToMissionAtUtc?: string
  controlStatus: ControlStatusEnum
  controlUnitId?: number
  createdAt: string
  description?: string
  detachedFromMissionAtUtc?: string
  geom: Record<string, any>[]
  hasNoUnitAvailable?: boolean | undefined
  id: number | string
  isArchived?: boolean
  isControlRequired?: boolean | undefined
  missionId?: number
  openBy: string
  reportType: ReportingTypeEnum
  reportingId?: number
  semaphoreId?: number
  sourceName?: string
  sourceType: ReportingSourceEnum
  subThemes?: string[]
  targetDetails?: TargetDetails[]
  targetType?: ReportingTargetTypeEnum
  theme?: string
  validityTime?: number
  vehicleType?: string
}

export type ReportingDetailed = Reporting & {
  displayedSource: string
}

export type DetachedReporting = {
  attachedToMissionAtUtc?: string
  detachedFromMissionAtUtc?: string
  missionId?: number
  reportingId?: number
}

export enum ControlStatusEnum {
  CONTROL_TO_BE_DONE = 'CONTROL_TO_BE_DONE',
  CONTROL_DONE = 'CONTROL_DONE',
  SURVEILLANCE_DONE = 'SURVEILLANCE_DONE'
}

export enum ControlStatusLabels {
  CONTROL_TO_BE_DONE = 'Contrôle à faire',
  CONTROL_DONE = 'Contrôle fait',
  SURVEILLANCE_DONE = 'Surveillance faite'
}

type TargetDetails = {
  externalReferenceNumber?: string
  imo?: string
  mmsi?: string
  operatorName?: string
  size?: number
  vesselName?: string
}

export type ReportingForTimeline = Partial<ReportingDetailed> & {
  actionType: ActionTypeEnum.REPORTING
  timelineDate: string
}

export type DetachedReportingForTimeline = DetachedReporting & {
  action: string
  actionType: ActionTypeEnum.DETACHED_REPORTING
  timelineDate: string
}

export enum ReportingSourceEnum {
  CONTROL_UNIT = 'CONTROL_UNIT',
  OTHER = 'OTHER',
  SEMAPHORE = 'SEMAPHORE'
}
export enum ReportingSourceLabels {
  SEMAPHORE = 'Sémaphore',
  CONTROL_UNIT = 'Unité',
  OTHER = 'Autre'
}

export enum ReportingTypeEnum {
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  OBSERVATION = 'OBSERVATION'
}

export enum ReportingTypeLabels {
  INFRACTION_SUSPICION = 'Infraction (suspicion)',
  OBSERVATION = 'Observation'
}

export enum ReportingStatusEnum {
  ARCHIVED = 'ARCHIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  // eslint-disable-next-line typescript-sort-keys/string-enum
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  OBSERVATION = 'OBSERVATION',
  // eslint-disable-next-line typescript-sort-keys/string-enum
  ATTACHED_TO_MISSION = 'ATTACHED_TO_MISSION'
}

export enum StatusFilterEnum {
  ARCHIVED = 'ARCHIVED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum StatusFilterLabels {
  IN_PROGRESS = 'En cours',
  ARCHIVED = 'Archivés'
}

export const getReportingStatus = ({
  createdAt,
  isArchived,
  reportType,
  validityTime
}: {
  createdAt?: string | undefined
  isArchived?: boolean
  reportType?: ReportingTypeEnum
  validityTime?: number | undefined
}) => {
  const endOfValidity = dayjs(createdAt)
    .add(validityTime || 0, 'hour')
    .toISOString()
  const timeLeft = dayjs(endOfValidity).diff(dayjs(), 'hour', true)

  if (timeLeft < 0 || isArchived) {
    return ReportingStatusEnum.ARCHIVED
  }

  if (reportType === ReportingTypeEnum.OBSERVATION) {
    return ReportingStatusEnum.OBSERVATION
  }
  if (reportType === ReportingTypeEnum.INFRACTION_SUSPICION) {
    // TODO handle attached to mission
    return ReportingStatusEnum.INFRACTION_SUSPICION
  }

  return ReportingStatusEnum.IN_PROGRESS
}
