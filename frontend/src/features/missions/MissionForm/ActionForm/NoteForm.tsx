import { FormikTextarea } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { Form, IconButton } from 'rsuite'
import styled from 'styled-components'

import { ActionTypeEnum, actionTypeLabels } from '../../../../domain/entities/missions'
import { ReactComponent as DeleteSVG } from '../../../../uiMonitor/icons/Delete.svg'
import { ReactComponent as NoteSVG } from '../../../../uiMonitor/icons/Note_libre.svg'

export function NoteForm({ currentActionIndex, remove, setCurrentActionIndex }) {
  const [actionTypeField] = useField<ActionTypeEnum>(`envActions.${currentActionIndex}.actionType`)

  const handleRemoveAction = () => {
    setCurrentActionIndex(undefined)
    remove(currentActionIndex)
  }

  return (
    <>
      <Header>
        <NoteIcon />
        <Title>{actionTypeLabels[actionTypeField.value]?.libelle}</Title>
        <IconButtonRight
          appearance="ghost"
          icon={<DeleteIcon className="rs-icon" />}
          onClick={handleRemoveAction}
          size="sm"
          title="supprimer"
        >
          Supprimer
        </IconButtonRight>
      </Header>

      <Form.Group>
        <FormikTextarea isLight label="Observations" name={`envActions.${currentActionIndex}.observations`} />
      </Form.Group>
    </>
  )
}

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
`

const Title = styled.h2`
  font-size: 16px;
  line-height: 22px;
  display: inline-block;
  color: ${p => p.theme.color.charcoal};
`

const NoteIcon = styled(NoteSVG)`
  color: ${p => p.theme.color.gunMetal};
  margin-right: 8px;
  margin-top: 2px;
  width: 18px;
`

const DeleteIcon = styled(DeleteSVG)`
  color: ${p => p.theme.color.maximumRed};
`

const IconButtonRight = styled(IconButton)`
  margin-left: auto;
`
