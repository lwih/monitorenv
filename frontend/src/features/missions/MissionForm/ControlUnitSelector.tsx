/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import _ from 'lodash'
import { MutableRefObject, useRef } from 'react'
import { Form, IconButton, TagPicker } from 'rsuite'
import styled from 'styled-components'

import { useGetControlUnitsQuery } from '../../../api/controlUnitsAPI'
import { FormikInput } from '../../../uiMonitor/CustomFormikFields/FormikInput'
import { SelectPicker } from '../../../uiMonitor/CustomRsuite/SelectPicker'
import { ReactComponent as DeleteSVG } from '../../../uiMonitor/icons/Delete.svg'

import type { ControlResource } from '../../../domain/entities/controlUnit'

export function ControlUnitSelector({ controlUnitIndex, controlUnitPath, removeControlUnit, ...props }) {
  const [administrationField, , administrationHelpers] = useField<string>(
    `controlUnits.${controlUnitIndex}.administration`
  )
  const [unitField, , unitHelpers] = useField<number | undefined>(`controlUnits.${controlUnitIndex}.id`)
  const [, , unitNameHelpers] = useField<string | undefined>(`controlUnits.${controlUnitIndex}.name`)
  const [resourcesField, , resourcesHelpers] = useField<ControlResource[]>(`controlUnits.${controlUnitIndex}.resources`)
  const [, , contactHelpers] = useField<string>(`controlUnits.${controlUnitIndex}.contact`)

  const resourcesRef = useRef() as MutableRefObject<HTMLDivElement>
  const { data, isError, isLoading } = useGetControlUnitsQuery()

  const administrationList = _.chain(data)
    .map(unit => unit.administration)
    .uniq()
    .sort((a, b) => a?.localeCompare(b))
    .map(administration => ({ administration }))
    .value()
  const unitList = _.chain(data)
    .filter(unit => unit.administration === administrationField.value)
    .sort((a, b) => a?.name?.localeCompare(b?.name))
    .value()
  const resourcesList =
    _.chain(data)
      ?.find(unit => unit.administration === administrationField.value && unit.id === unitField.value)
      ?.value()?.resources || []

  // Add any resource from Mission not present in list from API (as the resource might be historized)
  // See: https://github.com/MTES-MCT/monitorenv/issues/103
  // eslint-disable-next-line no-unsafe-optional-chaining
  const combinedResourceList = _.chain([...resourcesList, ...resourcesField?.value])
    .uniqBy('id')
    .sort((a, b) => a?.name?.localeCompare(b?.name))
    .value()

  const handleAdministrationChange = value => {
    if (value !== administrationField.value) {
      administrationHelpers.setValue(value)
      const newUnitList = _.uniqBy(
        _.filter(data, r => r.administration === value),
        'name'
      )
      if (newUnitList.length === 1 && newUnitList[0]?.id) {
        unitHelpers.setValue(newUnitList[0]?.id)
        unitNameHelpers.setValue(newUnitList[0]?.name)
      } else {
        unitHelpers.setValue(undefined)
        unitNameHelpers.setValue(undefined)
      }
      resourcesHelpers.setValue([])
    }
  }
  const handleUnitChange = value => {
    if (value !== unitField.value) {
      unitHelpers.setValue(value)
      resourcesHelpers.setValue([])
      const name = unitList.find(unit => unit.id === value)?.name
      unitNameHelpers.setValue(name)
    }
  }
  const handleResourceChange = values => {
    const resourceObjects = values.map(id => resourcesList.find(resource => resource.id === id))
    resourcesHelpers.setValue(resourceObjects)
  }
  const handleContactChange = value => {
    contactHelpers.setValue(value)
  }
  if (isError) {
    return <div>Erreur</div>
  }
  if (isLoading) {
    return <div>Chargement</div>
  }
  const resourceUnitIndexDisplayed = controlUnitIndex + 1

  return (
    <RessourceUnitWrapper>
      <SelectorWrapper>
        <FormGroupFixed>
          <Form.ControlLabel htmlFor="administration">Administration {resourceUnitIndexDisplayed}</Form.ControlLabel>
          <SelectPicker
            block
            data={administrationList}
            labelKey="administration"
            onChange={handleAdministrationChange}
            searchable={administrationList.length > 10}
            size="sm"
            value={administrationField.value}
            valueKey="administration"
          />
        </FormGroupFixed>
        <FormGroupFixed>
          <Form.ControlLabel htmlFor="unit">Unité {resourceUnitIndexDisplayed}</Form.ControlLabel>
          <SelectPicker
            block
            data={unitList}
            disabled={_.isEmpty(administrationField.value)}
            labelKey="name"
            onChange={handleUnitChange}
            searchable={unitList.length > 10}
            size="sm"
            value={unitField.value}
            valueKey="id"
            {...props}
            key={unitField.value}
          />
        </FormGroupFixed>
        <FormGroupFixed>
          <RefWrapper ref={resourcesRef} data-cy="unit-tag-picker">
            <Form.ControlLabel htmlFor="resources">Moyen(s) {resourceUnitIndexDisplayed}</Form.ControlLabel>
            <TagPicker
              block
              cleanable={false}
              container={() => resourcesRef.current}
              creatable
              data={combinedResourceList}
              disabled={!_.isNumber(unitField.value)}
              labelKey="name"
              onChange={handleResourceChange}
              size="sm"
              value={resourcesField.value.map(resource => resource.id)}
              valueKey="id"
              {...props}
            />
          </RefWrapper>
        </FormGroupFixed>
        <FormGroupFixed>
          <Form.ControlLabel htmlFor={`controlUnits.${controlUnitIndex}.contact`}>
            Contact de l&apos;unité {resourceUnitIndexDisplayed}
          </Form.ControlLabel>
          <FormikInput name={`controlUnits.${controlUnitIndex}.contact`} onChange={handleContactChange} size="sm" />
        </FormGroupFixed>
      </SelectorWrapper>

      {controlUnitIndex > 0 && (
        <div>
          <DeleteButton appearance="ghost" icon={<DeleteSVG className="rs-icon" />} onClick={removeControlUnit} />
        </div>
      )}
    </RessourceUnitWrapper>
  )
}

const RessourceUnitWrapper = styled.div`
  display: flex;
`

const SelectorWrapper = styled.div`
  width: 100%;
  max-width: 416px;
  margin-bottom: 14px;
`

const FormGroupFixed = styled.div`
  height: 52px;
  :not(:last-child) {
    margin-bottom: 4px;
  }
`

const RefWrapper = styled.div`
  .rs-picker-menu {
    position: relative;
    margin-top: -50px;
  }
`

const DeleteButton = styled(IconButton)`
  margin-top: 22px;
  margin-left: 8px;
`