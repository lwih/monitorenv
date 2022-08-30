import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { format, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'
import { IconButton } from 'rsuite'

import { editMission } from '../../../../domain/use_cases/missions/editMission'
import { missionTypeEnum } from '../../../../domain/entities/missions'
import { clearSelectedMissionOnMap } from '../../../../domain/use_cases/missions/selectMissionOnMap'
import { MissionStatusLabel } from '../../../../ui/MissionStatusLabel'

import { ReactComponent as EditIconSVG } from '../../../../uiMonitor/icons/editer_12px.svg'
import { ReactComponent as CloseIconSVG } from '../../../../uiMonitor/icons/croix_10px.svg'
import { COLORS } from '../../../../constants/constants'

export const MissionCard = ({feature, selected}) => {
  const dispatch = useDispatch()
  const { 
    missionId,
    inputStartDatetimeUtc,
    missionType,
    numberOfActions,
    missionStatus,
    resourceUnits
  } = feature.getProperties()
  const parsedInputStartDatetimeUtc = new Date(inputStartDatetimeUtc)

  const handleEditMission = useCallback(() => {
    dispatch(editMission(missionId))
  }, [dispatch, missionId])

  const handleCloseOverlay = useCallback(() => {
    dispatch(clearSelectedMissionOnMap())
  }, [dispatch])

  return (
  <MissionCardHeader>
    <Col1>
      <MissionDate>
        {isValid(parsedInputStartDatetimeUtc) && format(parsedInputStartDatetimeUtc, "dd MMM yyyy", {locale: fr})}
      </MissionDate>
    </Col1>
    <Col2>
      <MissionType>Mission {missionTypeEnum[missionType]?.libelle}</MissionType>
      <MissionReources>{resourceUnits?.map(resource => {
        return `${resource.administration} (${resource.unit})`
      })}</MissionReources>
      <Actions>{numberOfActions} actions réalisées</Actions>
      <MissionStatusLabel missionStatus={missionStatus}/>
      {selected && <IconButton 
        size='sm'
        appearance='primary' 
        icon={<EditIconSVG className={"rs-icon"}/>} 
        onClick={handleEditMission}>
          Editer
        </IconButton>}
    </Col2>
    <Col3>
      {selected && <IconButton appearance='link' icon={<CloseIconSVG className={"rs-icon"}/>} size='sm' onClick={handleCloseOverlay} />}
    </Col3>
  </MissionCardHeader>
  )
}

const MissionCardHeader = styled.div`
  background: ${COLORS.white};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  display: flex;
  width: 380px;
  height: 124px;
  box-shadow: 0px 3px 6px rgba(0,0,0,.3);
`

const MissionDate = styled.div`
  width: 75px;
  font-size: 12px;
  margin-right: 16px;
`

const MissionType = styled.div`
  font-weight: bold;
`

const MissionReources = styled.div`
  font-size: 12px;
  color: ${COLORS.slateGray};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`
const Actions = styled.div`
`

const Col1 = styled.div`
  padding: 8px 0px 5px 10px;
`
const Col2 = styled.div`
  padding: 8px 8px 4px 8px;
`
const Col3 = styled.div`
  margin-left: auto;
  padding-right: 4px;
`
