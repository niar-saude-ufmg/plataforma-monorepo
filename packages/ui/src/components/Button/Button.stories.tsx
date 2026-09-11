import type { Meta, StoryObj } from '@storybook/react-vite';
import { niar } from '../../tokens/index';
import { Button } from './Button';

const variants = ['contained', 'outlined', 'text'] as const;
const sizes = ['small', 'medium', 'large'] as const;

const meta = {
  title: 'Componentes/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    color: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: sizes },
    children: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Botão MUI configurado pelo NiarProvider, com estilos e variantes definidos junto ao componente.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowStyle = { display: 'flex', alignItems: 'center', gap: niar.spacing.xl };

export const Playground: Story = {};

export const Primary: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} color="primary" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Secondary: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} color="secondary" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={rowStyle}>
      {sizes.map((size) => (
        <Button key={size} color="primary" variant="contained" size={size}>
          {size[0].toUpperCase() + size.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: niar.spacing.xl }}>
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};
