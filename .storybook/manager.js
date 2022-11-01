import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import customTheme from './CustomTheme';


addons.setConfig({
  theme: customTheme,
});