import { Accent, CheckPicker, SingleTag } from '@mtes-mct/monitor-ui'
import { Button } from 'rsuite'
import styled from 'styled-components'

export function LayerFilters({
  ampTypes,
  filteredAmpTypes,
  filteredRegulatoryThemes,
  handleResetFilters,
  regulatoryThemes,
  setFilteredAmpTypes,
  setFilteredRegulatoryThemes
}) {
  const handleSetFilteredAmpTypes = filteredAmps => {
    setFilteredAmpTypes(filteredAmps)
  }

  const handleDeleteAmpType = v => () => {
    setFilteredAmpTypes(filteredAmpTypes.filter(theme => theme !== v))
  }
  const handleSetFilteredRegulatoryThemes = v => {
    setFilteredRegulatoryThemes(v)
  }

  const handleDeleteRegulatoryTheme = v => () => {
    setFilteredRegulatoryThemes(filteredRegulatoryThemes.filter(theme => theme !== v))
  }

  return (
    <FiltersWrapper>
      <CheckPicker
        isLabelHidden
        label="Thématique réglementaire"
        name="regulatoryThemes"
        onChange={handleSetFilteredRegulatoryThemes}
        options={regulatoryThemes || []}
        placeholder="Thématique réglementaire"
        renderValue={() =>
          filteredRegulatoryThemes && (
            <OptionValue>{`Thématique réglementaire (${filteredRegulatoryThemes.length})`}</OptionValue>
          )
        }
        size="sm"
        value={filteredRegulatoryThemes}
        valueKey="value"
      />
      <TagWrapper>
        {filteredRegulatoryThemes?.length > 0 &&
          filteredRegulatoryThemes?.map(theme => (
            <SingleTag
              key={theme}
              accent={Accent.SECONDARY}
              onDelete={handleDeleteRegulatoryTheme(theme)}
              title={theme}
            >
              {theme}
            </SingleTag>
          ))}
      </TagWrapper>

      <CheckPicker
        isLabelHidden
        label="Type d'AMP"
        name="ampTypes"
        onChange={handleSetFilteredAmpTypes}
        options={ampTypes}
        placeholder="Type d'AMP"
        renderValue={() => filteredAmpTypes && <OptionValue>{`Type d'AMP (${filteredAmpTypes.length})`}</OptionValue>}
        size="sm"
        value={filteredAmpTypes}
        valueKey="value"
      />
      <TagWrapper>
        {filteredAmpTypes?.length > 0 &&
          filteredAmpTypes?.map(type => (
            <SingleTag key={type} accent={Accent.SECONDARY} onDelete={handleDeleteAmpType(type)} title={type}>
              {type}
            </SingleTag>
          ))}
      </TagWrapper>

      {(filteredRegulatoryThemes?.length > 0 || filteredAmpTypes?.length > 0) && (
        <ResetFilters appearance="link" onClick={handleResetFilters}>
          Réinitialiser les filtres
        </ResetFilters>
      )}
    </FiltersWrapper>
  )
}

const FiltersWrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  padding: 16px;
  text-align: left;
  border-top: 2px solid ${p => p.theme.color.lightGray};
`
const TagWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`
const ResetFilters = styled(Button)`
  padding: 0px;
`

const OptionValue = styled.span`
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
