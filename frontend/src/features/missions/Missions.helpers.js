import { v4 as uuidv4 } from 'uuid'

import { actionTypeEnum, formalNoticeEnum, infractionTypeEnum, missionStatusEnum, missionTypeEnum } from "../../domain/entities/missions"

export const infractionFactory = ({id, ...infraction} = {}) => {
  return {
    id: uuidv4(),
    natinf: [],
    observations: '',
    registrationNumber: '',
    companyName: '',
    vesselType: '',
    vesselSize: '',
    controlledPersonIdentity: '',
    infractionType: '',
    formalNotice: formalNoticeEnum.NO.code,
    relevantCourt: '',
    toProcess: '',
    ...infraction
  }
}

export const actionFactory = ({id, actionType, ...action} = {}) => {
  switch (actionType) {
    case actionTypeEnum.CONTROL.code:
      return {
        id: uuidv4(),
        actionType: actionTypeEnum.CONTROL.code,
        actionTheme: '',
        actionSubTheme: '',
        protectedSpecies: [],
        actionStartDatetimeUtc: new Date(),
        actionNumberOfControls: '',
        actionTargetType: '',
        vehicleType: '',
        geom: null,
        infractions: [],
        ...action
      }
      case actionTypeEnum.NOTE.code:
        return {
          id: uuidv4(),
          actionType: actionTypeEnum.NOTE.code,
          actionStartDatetimeUtc: new Date(),
          observations: '',
          ...action
        }
      case actionTypeEnum.SURVEILLANCE.code:
        return {
          id: uuidv4(),
          actionType: actionTypeEnum.SURVEILLANCE.code,
          actionTheme: '',
          actionSubTheme: '',
          protectedSpecies: [],
          actionStartDatetimeUtc: new Date(),
          geom: null,
          ...action
        }
    default:
      return {
        id: uuidv4(),
        actionType: '',
        ...action
      }
  }
  
}

export const resourceUnitFactory = ({...resourceUnit} = {}) => {
  return {
    administration: '',
    unit: '',
    resources : [],
    ...resourceUnit
  }
}
export const missionFactory = (mission) => {
  return {
    missionType: missionTypeEnum.SEA.code,
    missionNature: [],
    resourceUnits: [resourceUnitFactory()],
    missionStatus: missionStatusEnum.PENDING.code,
    open_by: '',
    closed_by: '',
    observations: '',
    geom: null,
    inputStartDatetimeUtc: new Date(),
    inputEndDatetimeUtc: '',
    envActions: [],
    ...mission
  }
}


export const getControlInfractionsTags = (actionNumberOfControls, infractions) => {
  const infra = infractions.length || 0
  const ras = (actionNumberOfControls || 0) - infra
  const infraSansPV = infractions?.filter(inf => inf.infractionType === infractionTypeEnum.WITHOUT_REPORT.code)?.length || 0
  const med = infractions?.filter(inf => inf.formalNotice === formalNoticeEnum.YES.code)?.length || 0
  return {ras, infra, infraSansPV, med}
}