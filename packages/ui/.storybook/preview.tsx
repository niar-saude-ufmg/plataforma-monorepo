import type { Preview } from '@storybook/react-vite';
import { NiarProvider } from '../src/theme/index';
import '../src/tokens/styles/tokens.css';
import './docs.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <NiarProvider>
        <Story />
      </NiarProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: { source: { state: 'open' } },
    options: {
      storySort: {
        order: ['Fundamentos', ['Identidade Visual', 'Cores', 'Tokens'], 'Componentes'],
      },
    },
  },
};

export default preview;
