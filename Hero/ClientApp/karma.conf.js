// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['parallel', 'jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),  // easier to publish junit format tests reports in azure devops
      require('karma-spec-reporter'),
      require("karma-remap-coverage"),
      require("karma-coverage"),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-parallel')
    ],
    client: {
      captureConsole: true,
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reports: ['html', 'lcovonly', 'text-summary', 'cobertura'],
      fixWebpackSourcePaths: true,
      // Omit files with no statements, no functions and no branches from the report
      skipFilesWithNoCoverage: true,
      fixWebpackSourcePaths: true
    },
    captureTimeout: 210000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 210000,
    browserNoActivityTimeout: 210000,
    coverageReporter: {
      type: 'in-memory'
    },
    remapCoverageReporter: {
      'text-summary': null, // any falsy value to show summary in console
      html: require('path').join(__dirname, './coverage/html'),
      cobertura: require('path').join(__dirname, './coverage/cobertura.xml')
    },
    reporters: ['spec', 'kjhtml', 'junit', 'coverage', 'remap-coverage'],
    junitReporter: {
      outputDir: require('path').join(__dirname, './coverage'),
      outputFile: 'junit.xml',
      useBrowserName: false
    },
    specReporter: {
      maxLogLines: 1,              // limit number of lines logged per test
      suppressFailed: false,       // do not print information about failed tests
      suppressPassed: false,       // if set to true, it won't print information about passed tests
      suppressSkipped: true,       // do not print information about skipped tests
      showSpecTiming: true,        // print the time elapsed for each spec
      failFast: true              // if set to true, test would finish with error when a first fail occurs.
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    browserConsoleLogOptions: {
      level: "error", // avoid printing console logs, change level to see more detail
      terminal: false
    },
    customLaunchers: {
      "Chrome-headless": {
        base: 'Chrome',
        flags: ['--headless', '--remote-debugging-port=9222', '--no-sandbox']
      }
    },
    singleRun: true,
    restartOnFileChange: true
  });
};
