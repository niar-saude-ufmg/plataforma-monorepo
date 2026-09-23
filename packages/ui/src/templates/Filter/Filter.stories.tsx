import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import {
  Filter,
  type FilterCheckedField,
  type FilterSearchField,
  type FilterSelectableField,
} from "./Filter";

const search: FilterSearchField[] = [
  { key: "project", label: "Projeto", options: ["Opção 1", "Opção 2"] },
  {
    key: "status",
    label: "Status",
    options: ["Em análise", "Aprovado", "Arquivado"],
    multiple: true,
  },
];
const selectableOptions: FilterSelectableField[] = [
  {
    key: "base",
    label: "Base de dados",
    options: [
      { value: "own", label: "Base própria" },
      { value: "niar", label: "Base NIAR" },
    ],
  },
];
const checkedOptions: FilterCheckedField[] = [
  {
    key: "visibility",
    label: "Visibilidade",
    type: "checkbox",
    options: [
      { value: "active", label: "Ativos" },
      { value: "archived", label: "Arquivados" },
    ],
  },
];
const radioOptions: FilterCheckedField[] = [
  {
    key: "owner",
    label: "Responsável",
    type: "radio",
    row: true,
    options: [
      { value: "me", label: "Meus projetos" },
      { value: "team", label: "Toda a equipe" },
    ],
  },
];

const meta = {
  title: "Templates/Filter",
  component: Filter,
  parameters: { layout: "padded", docs: { codePanel: true } },
  argTypes: {
    "aria-label": { control: "text", description: "Nome acessível do formulário de filtros.", table: { category: "ACCESSIBILITY", defaultValue: { summary: "Filtros" } } },
    search: {
      control: "object",
      description: "Campos de busca baseados no Autocomplete.",
      table: { category: "PROPS" },
    },
    selectableOptions: {
      control: "object",
      description: "Campos renderizados como Select com opções value/label.",
      table: { category: "PROPS" },
    },
    checkedOptions: {
      control: "object",
      description: "Campos renderizados como Checkbox ou RadioGroup conforme type.",
      table: { category: "PROPS" },
    },
    values: {
      control: "object",
      description: "Valores selecionados controlados por chave de campo.",
      table: { category: "PROPS" },
    },
    onChange: {
      action: "filter changed",
      description: "Evento disparado com o objeto atualizado de filtros, como { project: \"Opção 1\" }.",
      table: { category: "EVENTS" },
    },
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { search, selectableOptions, checkedOptions },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Configure os campos e valores do filtro." },
      source: {
        code: "<Filter search={search} selectableOptions={selectableOptions} checkedOptions={checkedOptions} onChange={handleFilterChange} />",
      },
    },
  },
  render: (args) => {
    const [values, setValues] = useState(args.values ?? {});
    const lastChange = useRef<string>();
    return (
      <Filter
        {...args}
        values={values}
        onChange={(nextValues) => {
          const changeKey = JSON.stringify(nextValues);
          if (lastChange.current === changeKey) return;
          lastChange.current = changeKey;
          setValues(nextValues);
          args.onChange?.(nextValues);
        }}
      />
    );
  },
};

export const Search: Story = {
  args: { search },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Filtros de busca usando Autocomplete, com seleção simples e múltipla." },
      source: { code: '<Filter search={[{ key: "project", label: "Projeto", options: ["Opção 1", "Opção 2"] }]} />' },
    },
  },
};

export const Select: Story = {
  args: { search, selectableOptions },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Filtro de seleção única usando Select." },
      source: { code: '<Filter selectableOptions={[{ key: "base", label: "Base de dados", options: [{ value: "own", label: "Base própria" }, { value: "niar", label: "Base NIAR" }] }]} />' },
    },
  },
};

export const Checkbox: Story = {
  args: { search, checkedOptions },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Filtro de múltipla escolha usando Checkbox." },
      source: { code: '<Filter checkedOptions={[{ key: "visibility", label: "Visibilidade", type: "checkbox", options: [{ value: "active", label: "Ativos" }, { value: "archived", label: "Arquivados" }] }]} />' },
    },
  },
};

export const Radio: Story = {
  args: { search, checkedOptions: radioOptions },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Filtro de escolha única renderizado como RadioGroup." },
      source: {
        code: '<Filter checkedOptions={[{ key: "owner", label: "Responsável", type: "radio", options: [{ value: "me", label: "Meus projetos" }, { value: "team", label: "Toda a equipe" }] }]} />',
      },
    },
  },
};
