import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';


const persistConfig = {
  key: 'measurement',
  storage,
  whitelist: ['measurementsDrawed']
};

const measurementSlice = createSlice({
  name: 'measurement',
  initialState: {
    measurementTypeToAdd: null,
    circleMeasurementToAdd: null,
    circleMeasurementInDrawing: null,
    measurementsDrawed: []
  },
  reducers: {
    setMeasurementTypeToAdd (state, action) {
      state.measurementTypeToAdd = action.payload
    },
    resetMeasurementTypeToAdd (state) {
      state.measurementTypeToAdd = null
    },
    addMeasurementDrawed (state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.concat(action.payload)

      state.measurementsDrawed = nextMeasurementsDrawed
    },
    removeMeasurementDrawed (state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.filter(measurement => {
        return measurement.feature.id !== action.payload
      })

      state.measurementsDrawed = nextMeasurementsDrawed
    },
    /**
     * Add a circle measurement currently in drawing mode - so the
     * current measurement done in the map is showed in the Measurement box
     * @param {Object=} state
     * @param {{
     *  payload: {
          circleCoordinates: string
          circleRadius: string
        }
     * }} action - The coordinates and radius of the measurement
     */
    setCircleMeasurementInDrawing (state, action) {
      state.circleMeasurementInDrawing = action.payload
    },
    resetCircleMeasurementInDrawing (state) {
      state.circleMeasurementInDrawing = null
    },
    /**
     * Add a circle measurement to the measurements list from the measurement input form
     * @param {Object=} state
     * @param {{
     *  payload: {
          circleCoordinatesToAdd: string
          circleRadiusToAdd: string
        }
     * }} action - The coordinates and radius of the measurement
     */
    setCircleMeasurementToAdd (state, action) {
      state.circleMeasurementToAdd = action.payload
    },
    resetCircleMeasurementToAdd (state) {
      state.circleMeasurementToAdd = null
    }
  }
})

export const {
  setMeasurementTypeToAdd,
  resetMeasurementTypeToAdd,
  addMeasurementDrawed,
  removeMeasurementDrawed,
  setCircleMeasurementToAdd,
  resetCircleMeasurementToAdd,
  setCircleMeasurementInDrawing,
  resetCircleMeasurementInDrawing
} = measurementSlice.actions

export const measurementSlicePersistedReducer = persistReducer(persistConfig, measurementSlice.reducer);
