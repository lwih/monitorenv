import { CustomSearch, type Filter, isDefined, pluralize } from '@mtes-mct/monitor-ui'
import { isEmpty, uniq } from 'lodash/fp'

import { ControlUnit } from '../../../../domain/entities/controlUnit'

import type { FiltersState } from './types'

export function displayBaseNamesFromControlUnit(controlUnit: ControlUnit.ControlUnit): string {
  const baseNames = controlUnit.controlUnitResources.map(({ base }) => base.name).filter(isDefined)

  return baseNames.length > 0 ? uniq(baseNames).sort().join(', ') : 'Aucune base'
}

export function displayControlUnitResourcesFromControlUnit(controlUnit: ControlUnit.ControlUnit): string {
  const controlUnitResourceTypeCounts = controlUnit.controlUnitResources.reduce(
    (previousControlUnitResourceTypeCounts, controlUnitResource) => {
      const controlUnitResourceTypeCount = previousControlUnitResourceTypeCounts[controlUnitResource.type]
      if (!controlUnitResourceTypeCount) {
        return {
          ...previousControlUnitResourceTypeCounts,
          [controlUnitResource.type]: 1
        }
      }

      return {
        ...previousControlUnitResourceTypeCounts,
        [controlUnitResource.type]: controlUnitResourceTypeCount + 1
      }
    },
    {} as Record<string, number>
  )

  return !isEmpty(controlUnitResourceTypeCounts)
    ? Object.entries(controlUnitResourceTypeCounts)
        .map(([type, count]) => `${count} ${pluralize(ControlUnit.ControlUnitResourceType[type], count)}`)
        .join(', ')
    : 'Aucun moyen'
}

export function getFilters(
  data: ControlUnit.ControlUnit[],
  filtersState: FiltersState
): Filter<ControlUnit.ControlUnit>[] {
  const customSearch = new CustomSearch(
    data,
    [
      { name: 'administration.name', weight: 0.1 },
      { name: 'name', weight: 0.9 }
    ],
    {
      cacheKey: 'MAP_CONTROL_UNIT_LIST',
      isStrict: true
    }
  )
  const filters: Array<Filter<ControlUnit.ControlUnit>> = []

  if (filtersState.administrationId) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.filter(controlUnit => controlUnit.administrationId === filtersState.administrationId)

    filters.push(filter)
  }

  if (filtersState.query && filtersState.query.trim().length > 0) {
    const filter: Filter<ControlUnit.ControlUnit> = () => customSearch.find(filtersState.query as string)

    filters.push(filter)
  }

  if (filtersState.baseId) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.reduce<ControlUnit.ControlUnit[]>((previousControlUnits, controlUnit) => {
        const matches = controlUnit.controlUnitResources.filter(({ baseId }) => baseId === filtersState.baseId)

        return matches.length > 0 ? [...previousControlUnits, controlUnit] : previousControlUnits
      }, [])

    filters.push(filter)
  }

  if (filtersState.type) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.reduce<ControlUnit.ControlUnit[]>((previousControlUnits, controlUnit) => {
        const matches = controlUnit.controlUnitResources.filter(({ type }) => type === filtersState.type)

        return matches.length > 0 ? [...previousControlUnits, controlUnit] : previousControlUnits
      }, [])

    filters.push(filter)
  }

  return filters
}