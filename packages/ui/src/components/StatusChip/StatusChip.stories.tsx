import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusChip } from './StatusChip';
const meta = { title: 'Componentes/StatusChip', component: StatusChip, tags: ['autodocs'], args: { label: 'Em análise', status: 'info' }, argTypes: { status: { control: 'select', options: ['default', 'info', 'success', 'warning', 'error'] } } } satisfies Meta<typeof StatusChip>;
export default meta; type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const States: Story = { render: () => <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(['default', 'info', 'success', 'warning', 'error'] as const).map((status) => <StatusChip key={status} status={status} label={status} />)}</div> };
