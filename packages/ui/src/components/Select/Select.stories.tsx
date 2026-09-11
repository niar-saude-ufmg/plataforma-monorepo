import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  title: 'Componentes/Select',
  component: Select,
  tags: ['autodocs'],
  args: { label: 'Tipo de projeto', options: [{ value: '', label: 'Selecione uma opção' }, { value: 'own', label: 'Base própria' }, { value: 'niar', label: 'Base do NIAR' }], defaultValue: '', disabled: false, error: false, required: false, fullWidth: true },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  parameters: { docs: { description: { component: 'Seleção simples nativa com o mesmo estilo outlined e altura do Input.' } } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};

export const Filled: Story = { args: { defaultValue: 'own' } };
export const Error: Story = { args: { error: true, helperText: 'Este campo é obrigatório.' } };
export const Disabled: Story = { args: { disabled: true } };
