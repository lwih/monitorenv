const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 1024,
  scrollBehavior: false,
  projectId: 's1fr1i',
  retries: {
    runMode: 5,
    openMode: 0,
  },
  updateSnapshots: false,
  env: {
    'cypress-plugin-snapshots': {
      imageConfig: {
        threshold: 20,
        thresholdType: 'pixel',
      },
      updateSnapshots: false,
    },
  },
  e2e: {
    // TODO Properly import Cypress (custom) plugins.
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
