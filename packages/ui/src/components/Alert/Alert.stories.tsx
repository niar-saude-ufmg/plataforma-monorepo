import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta = {
  title: 'Componentes/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { children: 'Mensagem para a pessoa usuária.' },
  argTypes: { severity: { control: 'select', options: ['error', 'warning', 'info', 'success'] }, variant: { control: 'select', options: ['standard', 'filled', 'outlined'] } },
  parameters: { docs: { description: { component: 'Mensagem persistente para comunicar sucesso, aviso, erro ou informação.' } } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Success: Story = { args: { severity: 'success', children: 'Projeto salvo com sucesso.' } };
export const Error: Story = { args: { severity: 'error', children: 'Não foi possível concluir a operação.' } };
export const Warning: Story = { args: { severity: 'warning', children: 'Revise os campos obrigatórios.' } };
export const Info: Story = { args: { severity: 'info', children: 'A análise do projeto está em andamento.' } };
