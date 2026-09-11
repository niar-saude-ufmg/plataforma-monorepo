import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';
const meta = { title: 'Componentes/IconButton', component: IconButton, tags: ['autodocs'], args: { name: 'close', 'aria-label': 'Fechar' } } satisfies Meta<typeof IconButton>;
export default meta; type Story = StoryObj<typeof meta>; export const Playground: Story = {}; export const Actions: Story = { render: () => <div style={{ display: 'flex', gap: 8 }}><IconButton name="close" aria-label="Fechar" /><IconButton name="visibility" aria-label="Mostrar senha" /></div> };
