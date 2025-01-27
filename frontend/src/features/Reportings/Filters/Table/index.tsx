import {
  CheckPicker,
  DateRangePicker,
  useNewWindow,
  Checkbox,
  Icon,
  CustomSearch,
  type Option
} from '@mtes-mct/monitor-ui'
import { forwardRef, useMemo } from 'react'
import styled from 'styled-components'

import { FilterTags } from './FilterTags'
import { ReportingsFiltersEnum } from '../../../../domain/shared_slices/ReportingsFilters'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import {
  OptionValue,
  StyledCustomPeriodContainer,
  StyledCutomPeriodLabel,
  StyledSelect,
  StyledStatusFilter,
  StyledTagsContainer
} from '../style'

export function TableReportingsFiltersWithRef(
  {
    isCustomPeriodVisible,
    optionsList,
    resetFilters,
    updateCheckboxFilter,
    updateDateRangeFilter,
    updatePeriodFilter,
    updateSimpleFilter,
    updateSourceTypeFilter
  },
  ref
) {
  const { newWindowContainerRef } = useNewWindow()

  const {
    hasFilters,
    periodFilter,
    seaFrontFilter = [],
    sourceFilter = [],
    sourceTypeFilter = [],
    startedAfter,
    startedBefore,
    statusFilter = [],
    subThemesFilter = [],
    themeFilter = [],
    typeFilter = []
  } = useAppSelector(state => state.reportingFilters)
  const {
    dateRangeOptions,
    seaFrontsOptions,
    sourceOptions,
    sourceTypeOptions,
    statusOptions,
    subThemesListAsOptions,
    themesListAsOptions,
    typeOptions
  } = optionsList

  const sourceCustomSearch = useMemo(
    () =>
      new CustomSearch(sourceOptions as Option[], ['label'], {
        cacheKey: 'REPORTINGS_LIST',
        withCacheInvalidation: true
      }),
    [sourceOptions]
  )
  const themeCustomSearch = useMemo(
    () =>
      new CustomSearch(themesListAsOptions as Option[], ['label'], {
        cacheKey: 'REPORTINGS_LIST',
        withCacheInvalidation: true
      }),
    [themesListAsOptions]
  )

  const subThemeCustomSearch = useMemo(
    () =>
      new CustomSearch(subThemesListAsOptions as Option[], ['label'], {
        cacheKey: 'REPORTINGS_LIST',
        withCacheInvalidation: true
      }),
    [subThemesListAsOptions]
  )

  return (
    <>
      <FilterWrapper ref={ref}>
        <StyledFiltersFirstLine>
          <StyledStatusFilter>
            {statusOptions.map(status => (
              <Checkbox
                key={status.label}
                checked={statusFilter?.includes(String(status.value))}
                data-cy={`status-filter-${status.label}`}
                label={status.label}
                name={status.label}
                onChange={isChecked =>
                  updateCheckboxFilter(isChecked, status.value, ReportingsFiltersEnum.STATUS_FILTER, statusFilter)
                }
              />
            ))}
          </StyledStatusFilter>
        </StyledFiltersFirstLine>
        <StyledFiltersSecondLine>
          <StyledSelect
            baseContainer={newWindowContainerRef.current}
            cleanable={false}
            data-cy="select-period-filter"
            isLabelHidden
            label="Période"
            name="Période"
            onChange={updatePeriodFilter}
            options={dateRangeOptions}
            placeholder="Date de signalement depuis"
            style={tagPickerStyle}
            value={periodFilter}
          />

          <CheckPicker
            data-cy="select-source-type-filter"
            isLabelHidden
            label="Type de source"
            name="sourceType"
            onChange={value => updateSourceTypeFilter(value)}
            options={sourceTypeOptions}
            placeholder="Type de source"
            renderValue={() => sourceTypeFilter && <OptionValue>{`Type (${sourceTypeFilter.length})`}</OptionValue>}
            style={tagPickerStyle}
            value={sourceTypeFilter}
          />

          <CheckPicker
            key={sourceOptions.length}
            customSearch={sourceCustomSearch}
            data-cy="select-source-filter"
            isLabelHidden
            label="Source"
            menuStyle={{ maxWidth: '200%' }}
            name="source"
            onChange={value => updateSimpleFilter(value, ReportingsFiltersEnum.SOURCE_FILTER)}
            options={sourceOptions}
            optionValueKey={'label' as any}
            placeholder="Source"
            renderValue={() => sourceFilter && <OptionValue>{`Source (${sourceFilter.length})`}</OptionValue>}
            style={tagPickerStyle}
            value={sourceFilter as any}
          />

          <StyledSelect
            baseContainer={newWindowContainerRef.current}
            data-cy="select-type-filter"
            isLabelHidden
            label="Type de signalement"
            name="type"
            onChange={value => updateSimpleFilter(value, ReportingsFiltersEnum.TYPE_FILTER)}
            options={typeOptions}
            placeholder="Type de signalement"
            style={tagPickerStyle}
            value={typeFilter}
          />
          <CheckPicker
            key={themesListAsOptions.length}
            customSearch={themeCustomSearch}
            isLabelHidden
            label="Thématiques"
            menuStyle={{ maxWidth: '200%' }}
            name="themes"
            onChange={value => updateSimpleFilter(value, ReportingsFiltersEnum.THEME_FILTER)}
            options={themesListAsOptions}
            placeholder="Thématiques"
            renderValue={() => themeFilter && <OptionValue>{`Thème (${themeFilter.length})`}</OptionValue>}
            style={{ width: 311 }}
            value={themeFilter}
          />
          <CheckPicker
            key={subThemesListAsOptions.length}
            customSearch={subThemeCustomSearch}
            isLabelHidden
            label="Sous-thématiques"
            menuStyle={{ maxWidth: '200%' }}
            name="subThemes"
            onChange={value => updateSimpleFilter(value, ReportingsFiltersEnum.SUB_THEMES_FILTER)}
            options={subThemesListAsOptions}
            placeholder="Sous-thématiques"
            renderValue={() => subThemesFilter && <OptionValue>{`Sous-thème (${subThemesFilter.length})`}</OptionValue>}
            searchable
            style={{ width: 311 }}
            value={subThemesFilter}
          />
          <CheckPicker
            isLabelHidden
            label="Facade"
            name="seaFront"
            onChange={value => updateSimpleFilter(value, ReportingsFiltersEnum.SEA_FRONT_FILTER)}
            options={seaFrontsOptions}
            placeholder="Facade"
            renderValue={() => seaFrontFilter && <OptionValue>{`Facade (${seaFrontFilter.length})`}</OptionValue>}
            size="sm"
            style={tagPickerStyle}
            value={seaFrontFilter}
          />
        </StyledFiltersSecondLine>
      </FilterWrapper>
      <StyledTagsContainer $withMargin={isCustomPeriodVisible || hasFilters}>
        {isCustomPeriodVisible && (
          <StyledCustomPeriodContainer>
            <StyledCutomPeriodLabel>Période spécifique</StyledCutomPeriodLabel>
            <DateRangePicker
              key="dateRange"
              baseContainer={newWindowContainerRef.current}
              data-cy="datepicker-missionStartedAfter"
              defaultValue={
                startedAfter && startedBefore ? [new Date(startedAfter), new Date(startedBefore)] : undefined
              }
              isLabelHidden
              isStringDate
              label="Date de début entre le et le"
              onChange={updateDateRangeFilter}
            />
          </StyledCustomPeriodContainer>
        )}

        <FilterTags />

        {hasFilters && (
          <ResetFiltersButton data-cy="reinitialize-filters" onClick={resetFilters}>
            <Icon.Reset size={14} />
            <span>Réinitialiser les filtres</span>
          </ResetFiltersButton>
        )}
      </StyledTagsContainer>
    </>
  )
}

export const TableReportingsFilters = forwardRef(TableReportingsFiltersWithRef)

const FilterWrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`
const StyledFiltersFirstLine = styled.div`
  display: flex;
`

const StyledFiltersSecondLine = styled.div`
  display: flex;
  gap: 10px;
`
const ResetFiltersButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
  display: flex;
  align-items: end;
  gap: 4px;
  margin-bottom: 8px;
  > span {
    font-size: 13px;
  }
`

const tagPickerStyle = { width: 200 }
