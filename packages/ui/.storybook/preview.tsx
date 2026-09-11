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
<<<<<<< HEAD
    docs: { source: { state: 'open' } },
=======
>>>>>>> 5ddaf0d (Build initial platform administration flow)
    options: {
      storySort: {
        order: ['Fundamentos', ['Identidade Visual', 'Cores', 'Tokens'], 'Componentes'],
      },
    },
  },
};

export default preview;
