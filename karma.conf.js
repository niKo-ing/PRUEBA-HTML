export default function(config) {
  config.set({
    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // Frameworks to use
    frameworks: ['jasmine'],

    // List of files / patterns to load in the browser
    files: [
      'src/tests/**/*.spec.ts',
      'src/tests/**/*.spec.js'
    ],

    // List of files / patterns to exclude
    exclude: [
      // Exclude React component specs that rely on Jest/RTL (not configured in Karma)
      'src/tests/components/**/*.spec.js',
      'src/tests/components/**/*.spec.ts'
    ],

    // Preprocess matching files before serving them to the browser
    preprocessors: {
      'src/tests/**/*.spec.ts': ['webpack', 'sourcemap'],
      'src/tests/**/*.spec.js': ['webpack', 'sourcemap']
    },

    // Webpack configuration
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            use: 'ts-loader',
            exclude: /node_modules/
          },
          {
            test: /\.(js|jsx)$/,
            use: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      },
      devtool: 'inline-source-map'
    },

    // Test results reporter to use
    reporters: ['progress', 'spec', 'coverage'],

    // Coverage reporter configuration
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      subdir: function(browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
      }
    },

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging
    logLevel: config.LOG_INFO,

  // Enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,

    // Jasmine configuration via Karma client
    client: {
      jasmine: {
        timeoutInterval: 120000 // Allow up to 120s for long async tests
      }
    },

  // Start these browsers
  // Use JSDOM to avoid relying on native Chrome in CI
  browsers: ['jsdom'],

    // Custom launcher for headless Chrome
    customLaunchers: {},

    // Continuous Integration mode
    singleRun: false,

    // Concurrency level
    concurrency: Infinity,

    // Browser disconnect timeout
    browserDisconnectTimeout: 10000,

    // Browser no activity timeout
    browserNoActivityTimeout: 60000
  });
};