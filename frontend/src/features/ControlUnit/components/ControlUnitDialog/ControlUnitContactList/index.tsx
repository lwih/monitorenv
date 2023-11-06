import { Accent, Button } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES } from './constants'
import { Form } from './Form'
import { Item } from './Item'
import { sortControlUnitContactsByQualifiedName } from './utils'
import {
  useCreateControlUnitContactMutation,
  useUpdateControlUnitContactMutation
} from '../../../../../api/controlUnitContactsAPI'
import { Section } from '../shared/Section'
import { TextareaForm } from '../shared/TextareaForm'

import type { ControlUnitContactFormValues } from './types'
import type { ControlUnit } from '../../../../../domain/entities/controlUnit'

type ControlUnitContactListProps = {
  controlUnit: ControlUnit.ControlUnit
  onSubmit: (nextControlUnit: ControlUnit.ControlUnit) => any
}
export function ControlUnitContactList({ controlUnit, onSubmit }: ControlUnitContactListProps) {
  const [createControlUnitContact] = useCreateControlUnitContactMutation()
  const [updateControlUnitContact] = useUpdateControlUnitContactMutation()

  const [editedControlUnitContactId, setEditedControlUnitContactId] = useState<number | undefined>(undefined)
  const [isNewControlUnitContactFormOpen, setIsNewControlUnitContactFormOpen] = useState(false)

  const sortedControlUnitContacts = useMemo(
    () => sortControlUnitContactsByQualifiedName(controlUnit.controlUnitContacts),
    [controlUnit.controlUnitContacts]
  )

  const editedControlUnitContact = useMemo(
    () =>
      sortedControlUnitContacts.find(({ id }) => id === editedControlUnitContactId) || {
        ...INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES,
        controlUnitId: controlUnit.id
      },
    [controlUnit.id, editedControlUnitContactId, sortedControlUnitContacts]
  )

  const isFormOpen = isNewControlUnitContactFormOpen || !!editedControlUnitContactId

  const closeForm = useCallback(() => {
    setEditedControlUnitContactId(undefined)
    setIsNewControlUnitContactFormOpen(false)
  }, [])

  const createOrUpdateControlUnitContact = useCallback(
    async (controlUnitContactFormValues: ControlUnitContactFormValues) => {
      if (isNewControlUnitContactFormOpen) {
        await createControlUnitContact(controlUnitContactFormValues as ControlUnit.NewControlUnitContactData)
      } else {
        await updateControlUnitContact(controlUnitContactFormValues as ControlUnit.ControlUnitContactData)
      }

      closeForm()
    },
    [closeForm, createControlUnitContact, isNewControlUnitContactFormOpen, updateControlUnitContact]
  )

  const openForm = useCallback(() => {
    setIsNewControlUnitContactFormOpen(true)
  }, [])

  return (
    <Section>
      <Section.Title>Contacts</Section.Title>
      <StyledSectionBody>
        <TextareaForm
          controlUnit={controlUnit}
          label="Modalités de contact avec l’unité"
          name="termsNote"
          onSubmit={onSubmit}
        />

        {sortedControlUnitContacts.map(controlUnitContact => (
          <Item
            key={controlUnitContact.id}
            controlUnitContact={controlUnitContact}
            onEdit={setEditedControlUnitContactId}
          />
        ))}

        {isFormOpen ? (
          <Form
            initialValues={editedControlUnitContact}
            isNew={isNewControlUnitContactFormOpen}
            onCancel={closeForm}
            onSubmit={createOrUpdateControlUnitContact}
          />
        ) : (
          <div>
            <Button accent={Accent.SECONDARY} onClick={openForm}>
              Ajouter un contact
            </Button>
          </div>
        )}
      </StyledSectionBody>
    </Section>
  )
}

const StyledSectionBody = styled(Section.Body)`
  padding: 16px 32px 24px;

  > .Field-Textarea {
    margin-bottom: 16px;
  }
  > div:last-child {
    margin-top: 16px;
  }
`
