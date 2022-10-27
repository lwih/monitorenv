/* eslint-disable react/jsx-props-no-spreading */
import { Formik, FieldArray } from 'formik'
import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, IconButton, ButtonToolbar } from 'rsuite'
import styled from 'styled-components'

import {
  useGetMissionsQuery,
  useUpdateMissionMutation,
  useCreateMissionMutation,
  useDeleteMissionMutation
} from '../../api/missionsAPI'
import { setSideWindowPath } from '../../components/SideWindowRouter/SideWindowRouter.slice'
import { COLORS } from '../../constants/constants'
import { missionStatusEnum } from '../../domain/entities/missions'
import { sideWindowPaths } from '../../domain/entities/sideWindow'
import { setError } from '../../domain/shared_slices/Global'
import { setMissionState } from '../../domain/shared_slices/MissionsState'
import { quitEditMission } from '../../domain/use_cases/missions/missionAndControlLocalisation'
import { SyncFormValuesWithRedux } from '../../hooks/useSyncFormValuesWithRedux'
import { FormikForm } from '../../uiMonitor/CustomFormikFields/FormikForm'
import { ReactComponent as DeleteSVG } from '../../uiMonitor/icons/Delete.svg'
import { ReactComponent as SaveSVG } from '../../uiMonitor/icons/Save.svg'
import { SideWindowHeader } from '../side_window/SideWindowHeader'
import { MissionCancelEditModal } from './MissionCancelEditModal'
import { MissionDeleteModal } from './MissionDeleteModal'
import { ActionForm } from './MissionDetails/ActionForm'
import { ActionsForm } from './MissionDetails/ActionsForm'
import { GeneralInformationsForm } from './MissionDetails/GeneralInformationsForm'
import { missionFactory } from './Missions.helpers'

export function CreateOrEditMission({ routeParams }) {
  const dispatch = useDispatch()
  const [currentActionIndex, setCurrentActionIndex] = useState(null)
  const [errorOnSave, setErrorOnSave] = useState(false)
  const [errorOnDelete, setErrorOnDelete] = useState(false)
  const [cancelEditModalIsOpen, setCancelEditModalIsOpen] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  const id = routeParams?.params?.id && parseInt(routeParams?.params?.id, 10)

  const { missionToEdit } = useGetMissionsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      missionToEdit: data?.find(op => op.id === id)
    })
  })

  const [updateMission, { isLoading: isLoadingUpdateMission }] = useUpdateMissionMutation()

  const [createMission, { isLoading: isLoadingCreateMission }] = useCreateMissionMutation()

  const [deleteMission] = useDeleteMissionMutation()

  const mission = useMemo(() => (id === undefined ? missionFactory() : missionToEdit), [id, missionToEdit])

  const upsertMission = id === undefined ? createMission : updateMission

  const handleSetCurrentActionIndex = index => {
    setCurrentActionIndex(index)
  }

  const handleSubmitForm = values => {
    upsertMission(values).then(response => {
      if ('data' in response) {
        dispatch(quitEditMission)
        dispatch(setSideWindowPath(sideWindowPaths.MISSIONS))
        setErrorOnSave(false)
      } else {
        dispatch(setError(response.error))
        setErrorOnSave(true)
      }
    })
  }

  const handleConfirmFormCancelation = () => {
    setCancelEditModalIsOpen(true)
  }
  const handleConfirmDelete = () => {
    setDeleteModalIsOpen(true)
  }
  const handleReturnToEdition = () => {
    setCancelEditModalIsOpen(false)
    setDeleteModalIsOpen(false)
  }
  const handleDelete = () => {
    deleteMission({ id }).then(response => {
      if ('error' in response) {
        dispatch(setError(response.error))
        setErrorOnDelete(true)
      } else {
        dispatch(setSideWindowPath(sideWindowPaths.MISSIONS))
      }
    })
  }
  const handleCancelForm = () => {
    dispatch(setSideWindowPath(sideWindowPaths.MISSIONS))
  }

  return (
    <EditMissionWrapper data-cy="editMissionWrapper">
      <SideWindowHeader
        title={`Edition de la mission${
          isLoadingUpdateMission || isLoadingCreateMission ? ' - Enregistrement en cours' : ''
        }`}
      />
      <Formik
        enableReinitialize
        initialValues={{
          closed_by: mission?.closed_by,
          closedBy: mission?.closedBy,
          envActions: mission?.envActions,
          facade: mission?.facade,
          geom: mission?.geom,
          id: mission?.id,
          inputEndDatetimeUtc: mission?.inputEndDatetimeUtc || '',
          inputStartDatetimeUtc: mission?.inputStartDatetimeUtc,
          missionNature: mission?.missionNature,
          missionStatus: mission?.missionStatus,
          missionType: mission?.missionType,
          observations: mission?.observations,
          openBy: mission?.openBy,
          resourceUnits: mission?.resourceUnits
        }}
        onSubmit={handleSubmitForm}
      >
        {formikProps => {
          const handleCloseMission = () => {
            formikProps.setFieldValue('missionStatus', missionStatusEnum.CLOSED.code)
            formikProps.handleSubmit()
          }

          return (
            <FormikForm>
              <MissionCancelEditModal
                onCancel={handleReturnToEdition}
                onConfirm={handleCancelForm}
                open={cancelEditModalIsOpen}
              />
              <MissionDeleteModal onCancel={handleReturnToEdition} onConfirm={handleDelete} open={deleteModalIsOpen} />
              <SyncFormValuesWithRedux callback={setMissionState} />
              <Wrapper>
                <FirstColumn>
                  <GeneralInformationsForm />
                </FirstColumn>
                <SecondColumn>
                  <FieldArray
                    name="envActions"
                    render={props => (
                      <ActionsForm
                        {...props}
                        currentActionIndex={currentActionIndex}
                        setCurrentActionIndex={handleSetCurrentActionIndex}
                      />
                    )}
                  />
                </SecondColumn>
                <ThirdColumn>
                  <FieldArray
                    name="envActions"
                    render={props => (
                      <ActionForm
                        {...props}
                        currentActionIndex={currentActionIndex}
                        setCurrentActionIndex={handleSetCurrentActionIndex}
                      />
                    )}
                  />
                </ThirdColumn>
              </Wrapper>

              <Footer>
                <FormActionsWrapper>
                  {
                    // id is undefined if creating a new mission
                    !(id === undefined) && (
                      <IconButton
                        appearance="ghost"
                        icon={<DeleteIcon className="rs-icon" />}
                        onClick={handleConfirmDelete}
                        type="button"
                      >
                        Supprimer la mission
                      </IconButton>
                    )
                  }
                  <Separator />
                  <Button onClick={handleConfirmFormCancelation} type="button">
                    Annuler
                  </Button>
                  <IconButton appearance="ghost" icon={<SaveSVG className="rs-icon" />} type="submit">
                    Enregistrer
                  </IconButton>
                  <IconButton
                    appearance="primary"
                    disabled={!(mission.missionStatus === missionStatusEnum.ENDED.code)}
                    icon={<SaveSVG className="rs-icon" />}
                    onClick={handleCloseMission}
                    type="button"
                  >
                    Enregistrer et clôturer
                  </IconButton>
                </FormActionsWrapper>
                {errorOnSave && <ErrorOnSave>Oups... Erreur au moment de la sauvegarde</ErrorOnSave>}
                {errorOnDelete && <ErrorOnDelete>Oups... Erreur au moment de la suppression</ErrorOnDelete>}
              </Footer>
            </FormikForm>
          )
        }}
      </Formik>
    </EditMissionWrapper>
  )
}

const EditMissionWrapper = styled.div`
  flex: 1;
`
const Wrapper = styled.div`
  height: calc(100vh - 118px);
  display: flex;
`
const FirstColumn = styled.div`
  background: ${COLORS.white};
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`

const SecondColumn = styled.div`
  background: ${COLORS.cultured};
  overflow-y: auto;
  flex: 1;
`
const ThirdColumn = styled.div`
  background: ${COLORS.gainsboro};
  flex: 1;
  overflow-y: auto;
`

const ErrorOnSave = styled.div`
  backgound: ${COLORS.goldenPoppy};
  text-align: right;
`
const ErrorOnDelete = styled.div`
  backgound: ${COLORS.goldenPoppy};
`
const Separator = styled.div`
  flex: 1;
`
const DeleteIcon = styled(DeleteSVG)`
  color: ${COLORS.maximumRed};
`
const Footer = styled.div`
  border-top: 1px solid ${COLORS.lightGray};
  padding: 18px;
`
const FormActionsWrapper = styled(ButtonToolbar)`
  display: flex;
`