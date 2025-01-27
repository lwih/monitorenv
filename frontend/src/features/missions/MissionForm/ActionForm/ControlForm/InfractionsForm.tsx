import { useState } from 'react'
import { Button } from 'rsuite'
import styled from 'styled-components'

import { InfractionCard } from './InfractionCard'
import { InfractionForm } from './InfractionForm/InfractionForm'
import { infractionFactory } from '../../../Missions.helpers'

import type { Infraction } from '../../../../../domain/entities/missions'

export function InfractionsForm({ canAddInfraction, envActionIndex, form, push, remove }) {
  const [currentInfractionIndex, setCurrentInfractionIndex] = useState<number | undefined>(undefined)

  const handleAddInfraction = () => {
    const numberOfInfractions = form?.values.envActions[envActionIndex]?.infractions?.length || 0
    push(infractionFactory())
    setCurrentInfractionIndex(numberOfInfractions)
  }

  const handleValidate = () => {
    setCurrentInfractionIndex(undefined)
  }

  const handleEditInfraction = index => () => {
    setCurrentInfractionIndex(index)
  }

  const handleRemoveInfraction = index => () => {
    setCurrentInfractionIndex(undefined)
    remove(index)
  }

  const handleDuplicateInfraction = index => () => {
    const numberOfInfractions = form?.values.envActions[envActionIndex]?.infractions.length || 0
    const selectedInfraction = form?.values.envActions[envActionIndex]?.infractions[index] as Infraction

    push(infractionFactory(selectedInfraction))
    setCurrentInfractionIndex(numberOfInfractions)
  }

  return (
    <>
      <Header>
        <Title>Détails de la cible en infraction</Title>
        <Button appearance="ghost" disabled={!canAddInfraction} onClick={handleAddInfraction} size="sm">
          + Ajouter un contrôle avec infraction
        </Button>
      </Header>

      {form?.values.envActions?.length > 0 && form?.values.envActions[envActionIndex]?.infractions?.length > 0 ? (
        <InfractionsWrapper>
          {form?.values.envActions[envActionIndex]?.infractions.map((infraction, index) =>
            currentInfractionIndex !== undefined && index === currentInfractionIndex ? (
              <InfractionForm
                key={infraction.id}
                currentInfractionIndex={currentInfractionIndex}
                envActionIndex={envActionIndex}
                removeInfraction={handleRemoveInfraction(index)}
                validateInfraction={handleValidate}
              />
            ) : (
              <InfractionCard
                key={infraction.id}
                canAddInfraction={canAddInfraction}
                currentInfractionIndex={index}
                duplicateInfraction={handleDuplicateInfraction(index)}
                envActionIndex={envActionIndex}
                removeInfraction={handleRemoveInfraction(index)}
                setCurrentInfractionIndex={handleEditInfraction(index)}
              />
            )
          )}
        </InfractionsWrapper>
      ) : (
        <NoActionWrapper>
          <NoAction>aucun contrôle avec infraction enregistré pour le moment</NoAction>
        </NoActionWrapper>
      )}
    </>
  )
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`
const Title = styled.h3`
  font-size: 13px;
  line-height: 22px;
  display: inline-block;
  color: ${p => p.theme.color.slateGray};
`
const InfractionsWrapper = styled.div`
  flex: 1;
`
const NoActionWrapper = styled.div`
  background: ${p => p.theme.color.white};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`

const NoAction = styled.div`
  text-align: center;
`
