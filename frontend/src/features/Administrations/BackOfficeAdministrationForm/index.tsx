import { Accent, Button, DataTable, FormikTextInput } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Formik } from 'formik'
import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

import { ADMINISTRATION_FORM_SCHEMA, CONTROL_UNIT_TABLE_COLUMNS, INITIAL_ADMINISTRATION_FORM_VALUES } from './constants'
import { administrationsAPI, useGetAdministrationQuery } from '../../../api/administrationsAPI'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { FrontendError } from '../../../libs/FrontendError'
import { BACK_OFFICE_MENU_PATH, BackOfficeMenuKey } from '../../BackOfficeMenu/constants'

import type { AdministrationFormValues } from './types'
import type { Administration } from '../../../domain/entities/administration'

export function BackOfficeAdministrationForm() {
  const { administrationId } = useParams()
  if (!administrationId) {
    throw new FrontendError('`administrationId` is undefined.')
  }

  const isNew = administrationId === 'new'

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: administration, error: getAdministrationQueryError } = useGetAdministrationQuery(
    isNew ? skipToken : Number(administrationId)
  )

  const initialValues: AdministrationFormValues | undefined = isNew
    ? INITIAL_ADMINISTRATION_FORM_VALUES
    : administration || undefined

  const goBackToList = useCallback(() => {
    navigate(`/backoffice${BACK_OFFICE_MENU_PATH[BackOfficeMenuKey.ADMINISTRATION_LIST]}`)
  }, [navigate])

  const submit = useCallback(
    async (administrationFormValues: AdministrationFormValues) => {
      // Type-enforced by `ADMINISTRATION_FORM_SCHEMA`
      const administrationData = administrationFormValues as Administration.NewAdministrationData

      if (isNew) {
        await dispatch(administrationsAPI.endpoints.createAdministration.initiate(administrationData))

        goBackToList()

        return
      }

      await dispatch(
        administrationsAPI.endpoints.updateAdministration.initiate({
          id: Number(administrationId),
          ...administrationData
        })
      )

      goBackToList()
    },
    [administrationId, dispatch, goBackToList, isNew]
  )

  return (
    <div>
      <Title>{`${isNew ? 'Création' : 'Édition'} d’une administration`}</Title>

      {!getAdministrationQueryError && !initialValues && <p>Chargement en cours...</p>}

      {getAdministrationQueryError && <p>Cette administration n’existe pas ou plus.</p>}

      {!getAdministrationQueryError && initialValues && (
        <Formik initialValues={initialValues} onSubmit={submit} validationSchema={ADMINISTRATION_FORM_SCHEMA}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <FormikTextInput label="Nom" name="name" />

              <ActionGroup>
                <Button accent={Accent.SECONDARY} onClick={goBackToList}>
                  Annuler
                </Button>
                <Button type="submit">{isNew ? 'Créer' : 'Mettre à jour'}</Button>
              </ActionGroup>
            </form>
          )}
        </Formik>
      )}

      <hr />

      <SubTitle>Unités de contrôle</SubTitle>
      <DataTable
        columns={CONTROL_UNIT_TABLE_COLUMNS}
        data={administration?.controlUnits}
        initialSorting={[{ desc: false, id: 'name' }]}
      />
    </div>
  )
}

const Title = styled.h1`
  line-height: 1;
  font-size: 24px;
  margin: 0 0 24px;
`

const ActionGroup = styled.div`
  margin-top: 24px;

  > button:not(:first-child) {
    margin-left: 16px;
  }
`

const SubTitle = styled.h2`
  line-height: 1;
  font-size: 18px;
  margin: 24px 0 24px;
`
