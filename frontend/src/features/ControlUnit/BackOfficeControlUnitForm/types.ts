import type { ControlUnit } from '../../../domain/entities/ControlUnit/types'
import type { UndefineExceptArrays } from '@mtes-mct/monitor-ui'

export type ControlUnitFormValues = UndefineExceptArrays<ControlUnit.NewControlUnitData>
