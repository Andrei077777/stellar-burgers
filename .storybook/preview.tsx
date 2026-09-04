import React from 'react';
import type { Preview } from '@storybook/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../src/services/store';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <BrowserRouter>
          <div style={{ padding: 20, width: 'fit-content' }}>
            <Story />
          </div>
        </BrowserRouter>
      </Provider>
    )
  ]
};

export default preview;
