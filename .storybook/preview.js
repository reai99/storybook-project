
import { themes } from '@storybook/theming';
import 'antd/dist/antd.less'; // 引入less

import { addDecorator, configure } from '@storybook/react';
// import WrapperDecorator from './decorators/WrapperDecorator';

// 通过addDecorator添加插件
// addDecorator(WrapperDecorator);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: themes.light,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewMode: 'docs',
  backgrounds: {
    default: 'light',
  },
  previewTabs: {
    canvas: { // 隐藏canvas tab
      hidden: true,
      disable: true
    }
  }
}