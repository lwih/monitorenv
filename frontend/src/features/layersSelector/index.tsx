import { useDispatch } from 'react-redux'
import { IconButton } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { setDisplayedItems } from '../../domain/shared_slices/Global'
import { closeRegulatoryZoneMetadata } from '../../domain/use_cases/regulatory/closeRegulatoryZoneMetadata'
import { useAppSelector } from '../../hooks/useAppSelector'
import { ReactComponent as LayersSVG } from '../../uiMonitor/icons/Couches_carto.svg'
import { AdministrativeLayers } from './administrative'
import { AmpLayers } from './amp'
import { BaseLayerList } from './base'
import { RegulatoryLayers } from './regulatory/menu'
import { RegulatoryLayerZoneMetadata } from './regulatory/metadata'
import { LayerSearch } from './search'

export function LayersSidebar() {
  const { regulatoryMetadataLayerId, regulatoryMetadataPanelIsOpen } = useAppSelector(state => state.regulatoryMetadata)
  const { displayLayersSidebar, layersSidebarIsOpen } = useAppSelector(state => state.global)
  const dispatch = useDispatch()

  const toggleLayerSidebar = () => {
    if (layersSidebarIsOpen) {
      dispatch(closeRegulatoryZoneMetadata())
    }
    dispatch(setDisplayedItems({ layersSidebarIsOpen: !layersSidebarIsOpen }))
  }

  return (
    <>
      <SidebarLayersIcon
        $isVisible={displayLayersSidebar}
        appearance="primary"
        data-cy="layers-sidebar"
        icon={<LayersSVG className="rs-icon" />}
        onClick={toggleLayerSidebar}
        size="lg"
        title="Arbre des couches"
      />
      <Sidebar
        isVisible={displayLayersSidebar && (layersSidebarIsOpen || regulatoryMetadataPanelIsOpen)}
        layersSidebarIsOpen={layersSidebarIsOpen}
      >
        <LayerSearch isVisible={displayLayersSidebar && layersSidebarIsOpen} />
        <Layers>
          <RegulatoryLayers />
          <AmpLayers />
          <AdministrativeLayers />
          <BaseLayerList />
        </Layers>
        <RegulatoryZoneMetadataShifter
          layersSidebarIsOpen={layersSidebarIsOpen}
          regulatoryMetadataPanelIsOpen={regulatoryMetadataPanelIsOpen}
        >
          {regulatoryMetadataLayerId && <RegulatoryLayerZoneMetadata />}
        </RegulatoryZoneMetadataShifter>
      </Sidebar>
    </>
  )
}

const RegulatoryZoneMetadataShifter = styled.div<{
  layersSidebarIsOpen: boolean
  regulatoryMetadataPanelIsOpen: boolean
}>`
  position: absolute;
  margin-left: ${p => {
    if (p.regulatoryMetadataPanelIsOpen) {
      if (p.layersSidebarIsOpen) {
        return '355'
      }

      return '410'
    }

    return '-455'
  }}px;
  margin-top: 45px;
  top: 0px;
  opacity: ${props => (props.regulatoryMetadataPanelIsOpen ? 1 : 0)};
  background: ${COLORS.gainsboro};
  z-index: -1;
  transition: 0.5s all;
`

const Sidebar = styled.div<{ isVisible: boolean; layersSidebarIsOpen: boolean }>`
  margin-left: ${props => (props.layersSidebarIsOpen ? 0 : '-455px')};
  opacity: ${props => (props.isVisible ? 1 : 0)};
  top: 10px;
  left: 57px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: 0.5s all;
`

const Layers = styled.div`
  width: 350px;
  max-height: calc(100vh - 160px);
`

const SidebarLayersIcon = styled(IconButton)<{ $isVisible: boolean }>`
  position: absolute;
  top: 10px;
  left: 12px;
  ${p => (p.$isVisible ? '' : 'display: none;')}
`
