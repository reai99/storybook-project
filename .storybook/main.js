const fs = require('fs');
const path = require('path');

module.exports = {
  "stories": [
    "../src/Introduction.stories.mdx", 
    "../src/stories/*.stories.@(js|jsx|tsx)",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: '@storybook/preset-create-react-app',  // 处理less
        options: {
          craOverrides: {
            fileLoaderExcludes: ['less'],
          },
      },
    },
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          }
        },
      ],
      include: [path.resolve(__dirname, '../src'), /[\\/]node_modules[\\/].*antd/],
    });
    return config;
  },
}