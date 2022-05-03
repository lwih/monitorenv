import React from 'react'

import { Missions } from './Missions'
import { Mission } from './Mission'
import { SideWindowRoute } from '../commonComponents/SideWindowRouter/SideWindowRoute'

import { sideWindowPaths } from '../../domain/entities/sideWindow'

export const MissionsWrapper = () => {
  
  return (<div style={{display: "flex", flexDirection:'column', flex:1}}>
    <SideWindowRoute path={sideWindowPaths.MISSIONS}>
      <Missions />
    </SideWindowRoute>
    <SideWindowRoute path={sideWindowPaths.MISSION}>
      <Mission></Mission>
    </SideWindowRoute>
  </div>)
}