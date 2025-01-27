import _ from 'lodash'
import * as Yup from 'yup'

import { ClosedInfractionSchema, NewInfractionSchema } from './Infraction'
import { ThemeSchema } from './Theme'
import { ActionTypeEnum, type EnvActionControl } from '../../../../domain/entities/missions'
import { TargetTypeEnum } from '../../../../domain/entities/targetType'
import { REACT_APP_CYPRESS_TEST } from '../../../../env'

const shouldUseAlternateValidationInTestEnvironment = process.env.NODE_ENV === 'development' || REACT_APP_CYPRESS_TEST

const ControlPointSchema = Yup.object().test({
  message: 'Point de contrôle requis',
  name: 'has-geom',
  test: val => val && !_.isEmpty(val?.coordinates)
})

export const getNewEnvActionControlSchema = (ctx: any): Yup.SchemaOf<EnvActionControl> =>
  Yup.object()
    .shape({
      actionStartDateTimeUtc: Yup.string()
        .nullable()
        .test({
          message: 'La date doit être postérieure à celle de début de mission',
          test: value => (value ? !(new Date(value) < new Date(ctx.from[1].value.startDateTimeUtc)) : true)
        })
        .test({
          message: 'La date doit être antérieure à celle de fin de mission',
          test: value => {
            if (!ctx.from[1].value.endDateTimeUtc) {
              return true
            }

            return value ? !(new Date(value) > new Date(ctx.from[1].value.endDateTimeUtc)) : true
          }
        }),
      actionType: Yup.mixed().oneOf([ActionTypeEnum.CONTROL]),
      id: Yup.string().required(),
      infractions: Yup.array().of(NewInfractionSchema).ensure().required()
    })
    .nullable()
    .required()

export const getClosedEnvActionControlSchema = (ctx: any): Yup.SchemaOf<EnvActionControl> =>
  Yup.object()
    .shape({
      actionNumberOfControls: Yup.number().required('Requis'),
      actionStartDateTimeUtc: Yup.string()
        .nullable()
        .required('Date requise')
        .test({
          message: 'La date doit être postérieure à celle de début de mission',
          test: value => (value ? !(new Date(value) < new Date(ctx.from[1].value.startDateTimeUtc)) : true)
        })
        .test({
          message: 'La date doit être antérieure à celle de fin de mission',
          test: value => {
            if (!ctx.from[1].value.endDateTimeUtc) {
              return true
            }

            return value ? !(new Date(value) > new Date(ctx.from[1].value.endDateTimeUtc)) : true
          }
        }),
      actionTargetType: Yup.string().nullable().required('Requis'),
      actionType: Yup.mixed().oneOf([ActionTypeEnum.CONTROL]),
      geom: shouldUseAlternateValidationInTestEnvironment
        ? Yup.object().nullable()
        : Yup.array().of(ControlPointSchema).ensure().min(1, 'Point de contrôle requis'),
      id: Yup.string().required(),
      infractions: Yup.array().of(ClosedInfractionSchema).ensure().required(),
      themes: Yup.array().of(ThemeSchema).ensure().required().min(1),
      vehicleType: Yup.string().when('actionTargetType', (actionTargetType, schema) => {
        if (!actionTargetType || actionTargetType === TargetTypeEnum.VEHICLE) {
          return schema.nullable().required('Requis')
        }

        return schema.nullable()
      })
    })
    .nullable()
