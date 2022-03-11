import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { openSideWindowTab } from '../../domain/shared_slices/Global'

import { COLORS } from '../../constants/constants'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'
import { ReactComponent as BeaconStatusesSVG } from '../icons/Icone_VMS.svg'

const SideWindowMenu = ({ selectedMenu }) => {
  const dispatch = useDispatch()

  return <Menu>
    <Link/>
    <Link
      title={sideWindowMenu.ALERTS.name}
      selected={selectedMenu === sideWindowMenu.ALERTS.code}
      onClick={() => dispatch(openSideWindowTab(sideWindowMenu.ALERTS.code))}
    >
      <AlertsIcon/>
    </Link>
    <Link
      data-cy={'side-window-menu-beacon-statuses'}
      title={sideWindowMenu.BEACON_STATUSES.name}
      selected={selectedMenu === sideWindowMenu.BEACON_STATUSES.code}
      onClick={() => dispatch(openSideWindowTab(sideWindowMenu.BEACON_STATUSES.code))}
    >
      <BeaconStatusesIcon/>
    </Link>
  </Menu>
}

const Menu = styled.div`
  width: 66px;
  height: 100vh;
  background: ${COLORS.charcoal};
  flex-shrink: 0;
  font-size: 11px;
  color: ${COLORS.gainsboro};
  padding: 0;
`

const Link = styled.div`
  text-align: center;
  background: ${props => props.selected ? COLORS.shadowBlue : 'none'};
  padding: 7px 5px;
  height: 50px;
  cursor: pointer;
  border-bottom: 0.5px solid ${COLORS.slateGray};
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 12px;
`

const BeaconStatusesIcon = styled(BeaconStatusesSVG)`
  margin-top: 12px;
`

export default SideWindowMenu
