import { Accent, Button, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { sideWindowPaths } from '../../../domain/entities/sideWindow'
import { setDisplayedItems, ReportingContext } from '../../../domain/shared_slices/Global'
import { saveMissionInLocalStore } from '../../../domain/use_cases/missions/saveMissionInLocalStore'
import { addReporting } from '../../../domain/use_cases/reporting/addReporting'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { sideWindowActions } from '../../SideWindow/slice'
import { ReportingFilterContext, ReportingsFilters } from '../Filters'

export function SearchReportings() {
  const dispatch = useAppDispatch()
  const displayReportingsLayer = useAppSelector(state => state.global.displayReportingsLayer)

  const closeSearchReportings = () => {
    dispatch(setDisplayedItems({ isSearchReportingsVisible: false }))
  }

  const setReportingsVisibilityOnMap = () => {
    dispatch(setDisplayedItems({ displayReportingsLayer: !displayReportingsLayer }))
  }

  const createReporting = () => {
    dispatch(setDisplayedItems({ isSearchReportingsVisible: false }))
    dispatch(addReporting(ReportingContext.MAP))
  }

  const toggleReportingsWindow = async () => {
    await dispatch(saveMissionInLocalStore())
    dispatch(sideWindowActions.focusAndGoTo(sideWindowPaths.REPORTINGS))
  }

  return (
    <StyledContainer>
      <MapMenuDialog.Container>
        <MapMenuDialog.Header>
          <MapMenuDialog.CloseButton Icon={Icon.Close} onClick={closeSearchReportings} />
          <MapMenuDialog.Title>Signalements</MapMenuDialog.Title>
          <MapMenuDialog.VisibilityButton
            accent={Accent.SECONDARY}
            Icon={displayReportingsLayer ? Icon.Display : Icon.Hide}
            onClick={setReportingsVisibilityOnMap}
          />
        </MapMenuDialog.Header>
        <MapMenuDialog.Body>
          <ReportingsFilters context={ReportingFilterContext.MAP} />
        </MapMenuDialog.Body>
        <MapMenuDialog.Footer>
          <Button Icon={Icon.Plus} isFullWidth onClick={createReporting}>
            Ajouter un signalement
          </Button>
          <Button accent={Accent.SECONDARY} Icon={Icon.Expand} isFullWidth onClick={toggleReportingsWindow}>
            Voir la vue détaillée des signalements
          </Button>
        </MapMenuDialog.Footer>
      </MapMenuDialog.Container>
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  display: flex;
`
