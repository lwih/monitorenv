import _ from 'lodash'
import { transformExtent, transform } from 'ol/proj'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { IconButton, Input } from 'rsuite'
import styled from 'styled-components'

import { usePhotonAPI } from '../../api/photonAPI'
import { COLORS } from '../../constants/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../domain/entities/map'
import { setFitToExtent } from '../../domain/shared_slices/Map'
import { ReactComponent as CloseIconSVG } from '../../uiMonitor/icons/Croix_grise.svg'
import { ReactComponent as SearchIconSVG } from '../../uiMonitor/icons/Loupe.svg'

export function LocateOnMap() {
  const dispatch = useDispatch()
  const [searchedLocation, setSearchedLocation] = useState('')

  // const handleResetSearch = () => setSearchedLocation('')
  const handleOnchange = value => {
    setSearchedLocation(value)
  }

  let latlon
  if (window.location.hash !== '') {
    const hash = window.location.hash.replace('@', '').replace('#', '')
    const viewParts = hash.split(',')
    if (
      viewParts.length === 3 &&
      !Number.isNaN(viewParts[0]) &&
      !Number.isNaN(viewParts[1]) &&
      !Number.isNaN(viewParts[2])
    ) {
      latlon = transform([viewParts[1], viewParts[0]], OPENLAYERS_PROJECTION, WSG84_PROJECTION)
    }
  }

  const results = usePhotonAPI(searchedLocation, { latlon })
  const uniqueResults = _.uniqBy(
    _.filter(results, location => location?.properties.extent),
    location => location?.properties?.osm_id
  ).slice(0, 10)

  const handleSelectLocation = location => () => {
    dispatch(
      setFitToExtent({ extent: transformExtent(location.properties.extent, WSG84_PROJECTION, OPENLAYERS_PROJECTION) })
    )
  }

  return (
    <Wrapper>
      <InputWrapper inside>
        <SearchBoxInput
          data-cy={'location-search-input'}
          placeholder={'rechercher un lieu (port, lieu-dit, baie...)'}
          type="text"
          value={searchedLocation}
          size='lg'
          onChange={handleOnchange}/>
        <InputGroup.Addon>
          <SearchIcon className={'rs-icon'} />
        </InputGroup.Addon>
      </InputWrapper>
      <ResultsList>
        {uniqueResults &&
          uniqueResults?.map(location => (
            <Location key={location.properties.osm_id} onClick={handleSelectLocation(location)}>
              <Name>{location.properties.name}</Name>

              <Country>
                {[
                  location.properties.city || location.properties.osm_value,
                  location.properties.state,
                  location.properties.country
                ]
                  .filter(t => t)
                  .join(', ')}
              </Country>
            </Location>
          ))}
      </ResultsList>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 320px;
`
const InputWrapper = styled(InputGroup)`
  border: 0;
  box-shadow: 0px 3px 6px ${COLORS.slateGray};
  :focus-within {
    outline: none !important;
    border-bottom: 2px solid ${COLORS.blueJeans};
  }
`

  // display: flex;
  // align-items: center;
  // justify-content: flex-end;

const SearchBoxInput = styled(Input)`
  display: inline-block;
  background-color: white;
  padding-left: 16px;
  padding-top: 11px;
  padding-bottom: 11px;
  font-size: 13px;
  line-height: 18px;
  :focus {
    outline: none !important;
  }
  .rs-input-group-addon {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  
`

const SearchIcon = styled(SearchIconSVG)`
  width: 20px;
  height: 20px;
`

const ResultsList = styled.ul`
  width: 306px;
  list-style: none;
  padding: 0;
  text-align: left;
  background: ${COLORS.background};
`

const Location = styled.li`
  padding: 7px;
  display: flex;
  flex-direction: column;
  :hover,
  :focus {
    background: ${COLORS.gainsboro};
    cursor: pointer;
  }
`
const Name = styled.div`
  flex: 1;
`

const Country = styled.div`
  font-style: italic;
  text-align: right;
`
