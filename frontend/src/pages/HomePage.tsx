import { useCallback, useMemo } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { APIWorker } from '../api/APIWorker'
import { ReportingContext } from '../domain/shared_slices/Global'
import { ControlUnitDialog } from '../features/ControlUnit/components/ControlUnitDialog'
import Healthcheck from '../features/healthcheck/Healthcheck'
import { LayersSidebar } from '../features/layersSelector'
import { LocateOnMap } from '../features/LocateOnMap'
import { ControlUnitListButton } from '../features/MainWindow/components/RightMenu/ControlUnitListButton'
import { Map } from '../features/map'
import { DrawModal } from '../features/map/draw/DrawModal'
import { RightMenuOnHoverArea } from '../features/map/shared/RightMenuOnHoverArea'
import { InterestPointMapButton } from '../features/map/tools/interestPoint/InterestPointMapButton'
import { MeasurementMapButton } from '../features/map/tools/measurements/MeasurementMapButton'
import { AttachReportingToMissionModal } from '../features/missions/MissionForm/AttachReporting/AttachReportingToMissionModal'
import { MissionsMenu } from '../features/missions/MissionsButton'
import { Reportings } from '../features/Reportings'
import { AttachMissionToReportingModal } from '../features/Reportings/ReportingForm/AttachMission/AttachMissionToReportingModal'
import { ReportingsButton } from '../features/Reportings/ReportingsButton'
import { SearchSemaphoreButton } from '../features/Semaphores/SearchSemaphoreButton'
import { SideWindowLauncher } from '../features/SideWindow/SideWindowLauncher'
import { useAppSelector } from '../hooks/useAppSelector'

export function HomePage() {
  const {
    displayDrawModal,
    displayInterestPoint,
    displayLocateOnMap,
    displayMeasurement,
    displayMissionMenuButton,
    displayReportingsButton,
    displayRightMenuControlUnitListButton: isRightMenuControlUnitListButtonVisible,
    displaySearchSemaphoreButton,
    isControlUnitDialogVisible
  } = useAppSelector(state => state.global)
  const { isFormDirty, missionState } = useAppSelector(state => state.missionState)
  const selectedMissions = useAppSelector(state => state.multiMissions.selectedMissions)

  const hasAtLeastOneMissionFormDirty = useMemo(
    () => selectedMissions.find(mission => mission.isFormDirty),
    [selectedMissions]
  )
  const beforeUnload = useCallback(
    event => {
      if ((isFormDirty && missionState) || hasAtLeastOneMissionFormDirty) {
        event.preventDefault()

        // eslint-disable-next-line no-return-assign, no-param-reassign
        return (event.returnValue = 'blocked')
      }

      return undefined
    },
    [hasAtLeastOneMissionFormDirty, isFormDirty, missionState]
  )

  useBeforeUnload(beforeUnload)

  return (
    <>
      <Healthcheck />
      <Wrapper>
        <APIWorker />
        <Map />
        <LayersSidebar />
        <RightMenuOnHoverArea />
        {displayDrawModal && <DrawModal />}
        <AttachMissionToReportingModal />
        <AttachReportingToMissionModal />
        {displayLocateOnMap && <LocateOnMap />}
        {isControlUnitDialogVisible && <ControlUnitDialog />}

        {displayMissionMenuButton && <MissionsMenu />}
        {displayReportingsButton && <ReportingsButton />}
        {displaySearchSemaphoreButton && <SearchSemaphoreButton />}
        {isRightMenuControlUnitListButtonVisible && <ControlUnitListButton />}

        {displayMeasurement && <MeasurementMapButton />}
        {displayInterestPoint && <InterestPointMapButton />}

        <Reportings key="reportings-on-map" context={ReportingContext.MAP} />

        <SideWindowLauncher />

        <ToastContainer containerId="map" enableMultiContainer />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  height: 100% - 50px;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`
