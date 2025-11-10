import path from 'path';

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
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        // Alinear resolución de paths con tsconfig y Vite
        alias: {
          '@': path.resolve('src'),
          '@atoms': path.resolve('src/components/atoms'),
          '@molecules': path.resolve('src/components/molecules'),
          '@organisms': path.resolve('src/components/organisms'),
          '@templates': path.resolve('src/components/templates'),
          '@pages': path.resolve('src/components/pages'),
          '@domain': path.resolve('src/domain'),
          '@app': path.resolve('src/app/index.ts'),
          '@assets': path.resolve('src/assets')
        }
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            use: {
              loader: 'ts-loader',
              options: {
                transpileOnly: true // Evita chequear tipos de todo el proyecto durante pruebas
              }
            },
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

    // Test results reporter to use (solo errores con spec)
    reporters: ['spec', 'coverage'],

    // Configuración del spec reporter para ocultar tests que pasan/skipped
    specReporter: {
      suppressPassed: true,
      suppressSkipped: true,
      showSpecTiming: false,
      suppressErrorSummary: false,
      failFast: false
    },

    // Coverage reporter configuration (forzar carpeta 'jsdom')
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      subdir: 'jsdom'
    },

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging (solo errores)
    logLevel: config.LOG_ERROR,

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
