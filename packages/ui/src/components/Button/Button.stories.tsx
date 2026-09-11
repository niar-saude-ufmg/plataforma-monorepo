<<<<<<< HEAD
import type { Meta, StoryObj } from "@storybook/react-vite";
import { niar } from "../../tokens/index";
import { Button } from "./Button";

const variants = ["contained", "outlined", "text"] as const;
const sizes = ["small", "medium", "large"] as const;

const meta = {
  title: "Componentes/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
    variant: "contained",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: variants },
    color: { control: "select", options: ["primary", "secondary"] },
    size: { control: "select", options: sizes },
    children: { control: "text" },
    disabled: { control: "boolean" },
=======
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
>>>>>>> 5ddaf0d (Build initial platform administration flow)
  },
  parameters: {
    docs: {
      description: {
<<<<<<< HEAD
        component:
          "Botão MUI configurado pelo NiarProvider, com estilos e variantes definidos junto ao componente.",
=======
        component: 'Botão MUI configurado pelo NiarProvider, com estilos e variantes definidos junto ao componente.',
>>>>>>> 5ddaf0d (Build initial platform administration flow)
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

<<<<<<< HEAD
const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: niar.spacing.xl,
};
=======
const rowStyle = { display: 'flex', alignItems: 'center', gap: niar.spacing.xl };
>>>>>>> 5ddaf0d (Build initial platform administration flow)

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
<<<<<<< HEAD
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, max-content)",
        gap: niar.spacing.xl,
      }}
    >
=======
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: niar.spacing.xl }}>
>>>>>>> 5ddaf0d (Build initial platform administration flow)
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};
