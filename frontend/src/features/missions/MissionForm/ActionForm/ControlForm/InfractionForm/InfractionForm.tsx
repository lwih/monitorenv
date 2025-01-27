import { FieldError, FormikCheckbox, FormikMultiRadio, FormikTextarea, FormikTextInput } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { Form, Button, ButtonToolbar } from 'rsuite'
import styled from 'styled-components'

import { InfractionFormHeaderCompany } from './InfractionFormHeaderCompany'
import { InfractionFormHeaderVehicle } from './InfractionFormHeaderVehicle'
import { NatinfSelector } from './NatinfSelector'
import { RelevantCourtSelector } from './RelevantCourtSelector'
import { infractionTypeLabels, formalNoticeLabels } from '../../../../../../domain/entities/missions'
import { TargetTypeEnum } from '../../../../../../domain/entities/targetType'

import type { MouseEventHandler } from 'react'

const infractionTypeOptions = Object.values(infractionTypeLabels).map(o => ({ label: o.libelle, value: o.code }))
const formalNoticeOPtions = Object.values(formalNoticeLabels).map(o => ({ label: o.libelle, value: o.code }))

type InfractionFormProps = {
  currentInfractionIndex: number
  envActionIndex: number
  removeInfraction: MouseEventHandler
  validateInfraction: MouseEventHandler
}
export function InfractionForm({
  currentInfractionIndex,
  envActionIndex,
  removeInfraction,
  validateInfraction
}: InfractionFormProps) {
  const infractionPath = `envActions[${envActionIndex}].infractions[${currentInfractionIndex}]`

  const [actionTargetField] = useField<string>(`envActions.${envActionIndex}.actionTargetType`)
  const [, meta] = useField(infractionPath)

  return (
    <FormWrapper data-cy="infraction-form">
      {actionTargetField.value === TargetTypeEnum.VEHICLE && (
        <InfractionFormHeaderVehicle envActionIndex={envActionIndex} infractionPath={infractionPath} />
      )}

      {actionTargetField.value === TargetTypeEnum.COMPANY && (
        <InfractionFormHeaderCompany infractionPath={infractionPath} />
      )}

      <Form.Group>
        <FormikTextInput
          label="Identité de la personne contrôlée"
          name={`${infractionPath}.controlledPersonIdentity`}
        />
      </Form.Group>

      <SubGroup>
        <Form.ControlLabel htmlFor={`${infractionPath}.infractionType`} />
        <FormikMultiRadio
          isErrorMessageHidden
          isInline
          label="Type d'infraction"
          name={`${infractionPath}.infractionType`}
          options={infractionTypeOptions}
        />
      </SubGroup>

      <SubGroup>
        <FormikMultiRadio
          isErrorMessageHidden
          isInline
          label="Mise en demeure"
          name={`${infractionPath}.formalNotice`}
          options={formalNoticeOPtions}
        />
      </SubGroup>

      <FormGroupFixedHeight>
        <NatinfSelector infractionPath={infractionPath} />
      </FormGroupFixedHeight>

      <Form.Group>
        <FormColumn>
          <RelevantCourtSelector infractionPath={infractionPath} />
        </FormColumn>

        <FormColumnWithCheckbox>
          <FormikCheckbox inline label="A traiter" name={`${infractionPath}.toProcess`} />
        </FormColumnWithCheckbox>
      </Form.Group>

      <Form.Group>
        <FormikTextarea label="Observations" name={`${infractionPath}.observations`} />
      </Form.Group>
      <ButtonToolbarRight>
        <Button onClick={removeInfraction}>Supprimer l&apos;infraction</Button>
        <Button appearance="primary" data-cy="infraction-form-validate" onClick={validateInfraction}>
          Valider l&apos;infraction
        </Button>
      </ButtonToolbarRight>
      {!!meta.error && <FieldError>Veuillez compléter les champs en rouge pour valider l&apos;infraction</FieldError>}
    </FormWrapper>
  )
}

const FormWrapper = styled.div`
  background: ${p => p.theme.color.white};
  padding: 32px;
`
const FormGroupFixedHeight = styled(Form.Group)`
  haight: 58px;
`

const FormColumn = styled.div`
  display: inline-block;
`
const FormColumnWithCheckbox = styled.div`
  display: inline-block;
  vertical-align: top;
  padding-top: 16px;
`
const ButtonToolbarRight = styled(ButtonToolbar)`
  display: flex;
  justify-content: flex-end;
`
const SubGroup = styled.div`
  margin-bottom: 16px;
`
