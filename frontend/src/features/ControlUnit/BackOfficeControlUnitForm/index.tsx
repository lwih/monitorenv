import {
  Accent,
  Button,
  FormikCheckbox,
  FormikSelect,
  FormikTextInput,
  FormikTextarea,
  getOptionsFromIdAndName
} from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Formik } from 'formik'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

import {
  CONTROL_UNIT_FORM_SCHEMA,
  INITIAL_CONTROL_UNIT_FORM_VALUES,
  CONTROL_UNIT_CONTACT_TABLE_COLUMNS,
  CONTROL_UNIT_RESOURCE_TABLE_COLUMNS
} from './constants'
import { useGetAdministrationsQuery } from '../../../api/administration'
import { controlUnitApi, useGetControlUnitQuery } from '../../../api/controlUnit'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { FrontendError } from '../../../libs/FrontendError'
import { DefaultTable } from '../../../ui/Table/DefaultTable'
import { BACK_OFFICE_MENU_PATH, BackOfficeMenuKey } from '../../BackOfficeMenu/constants'

import type { ControlUnitFormValues } from './types'
import type { ControlUnit } from '../../../domain/entities/controlUnit/types'

export function BackOfficeControlUnitForm() {
  const { controlUnitId } = useParams()
  if (!controlUnitId) {
    throw new FrontendError('`controlUnitId` is undefined.')
  }

  const isNew = controlUnitId === 'new'

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: controlUnit, error } = useGetControlUnitQuery(isNew ? skipToken : Number(controlUnitId))
  const { data: administrations } = useGetAdministrationsQuery()

  const initialValues: ControlUnitFormValues | undefined = isNew
    ? INITIAL_CONTROL_UNIT_FORM_VALUES
    : controlUnit || undefined

  const administrationsAsOptions = useMemo(() => getOptionsFromIdAndName(administrations), [administrations])

  const goBackToList = useCallback(() => {
    navigate(`/backoffice${BACK_OFFICE_MENU_PATH[BackOfficeMenuKey.CONTROL_UNIT_LIST]}`)
  }, [navigate])

  const submit = useCallback(
    async (controlUnitFormValues: ControlUnitFormValues) => {
      // Type-enforced by `CONTROL_UNIT_FORM_SCHEMA`
      const controlUnitData = controlUnitFormValues as ControlUnit.NewControlUnitData

      if (isNew) {
        await dispatch(controlUnitApi.endpoints.createControlUnit.initiate(controlUnitData))

        goBackToList()

        return
      }

      await dispatch(
        controlUnitApi.endpoints.updateControlUnit.initiate({
          id: Number(controlUnitId),
          ...controlUnitData
        })
      )

      goBackToList()
    },
    [controlUnitId, dispatch, goBackToList, isNew]
  )

  return (
    <div>
      <Title>{`${isNew ? 'Nouvelle' : 'Édition d’une'} unité de contrôle`}</Title>

      {!error && (!initialValues || !administrations) && <p>Chargement en cours...</p>}

      {error && <p>Cette unité de contrôle n’existe pas ou plus.</p>}

      {!error && initialValues && administrationsAsOptions && (
        <Formik initialValues={initialValues} onSubmit={submit} validationSchema={CONTROL_UNIT_FORM_SCHEMA}>
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <FormikSelect
                label="Administration"
                name="administrationId"
                options={administrationsAsOptions}
                searchable
              />
              <FormikTextInput label="Nom" name="name" />
              <FormikTextarea label="Zone d'intervention" name="areaNote" />
              <FormikTextarea label="Modalités de contact avec l’unité" name="termsNote" />
              <FormikCheckbox label="Archivée" name="isArchived" />

              <ActionGroup>
                <Button accent={Accent.SECONDARY} onClick={goBackToList}>
                  Annuler
                </Button>
                <Button type="submit">{isNew ? 'Créer' : 'Mettre à jour'}</Button>
              </ActionGroup>
            </Form>
          )}
        </Formik>
      )}

      <hr />

      <SubTitle>Contacts</SubTitle>
      <DefaultTable columns={CONTROL_UNIT_CONTACT_TABLE_COLUMNS as any} data={controlUnit?.controlUnitContacts} />

      <hr />

      <SubTitle>Moyens</SubTitle>
      <DefaultTable columns={CONTROL_UNIT_RESOURCE_TABLE_COLUMNS as any} data={controlUnit?.controlUnitResources} />
    </div>
  )
}

const Title = styled.h1`
  line-height: 1;
  font-size: 24px;
  margin: 0 0 24px;
`

const Form = styled.form`
  > div:not(:first-child) {
    margin-top: 16px;
  }
`

const ActionGroup = styled.div`
  margin-top: 24px !important;

  > button:not(:first-child) {
    margin-left: 16px;
  }
`

const SubTitle = styled.h2`
  line-height: 1;
  font-size: 18px;
  margin: 24px 0 24px;
`
