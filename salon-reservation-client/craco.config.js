const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.plugins = [
        ...(webpackConfig.resolve.plugins || []),
        new TsconfigPathsPlugin({
          configFile: './tsconfig.json',
        }),
      ];
      
      // ESLint 플러그인 제거
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );
      
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
        '^axios$': 'axios/dist/node/axios.cjs'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(axios|date-fns)/)'
      ]
    }
  }
};