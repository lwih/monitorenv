import type { Administration } from '../../../domain/entities/Administration/types'
import type { UndefineExceptArrays } from '@mtes-mct/monitor-ui'

export type AdministrationFormValues = UndefineExceptArrays<Administration.NewAdministrationData>
