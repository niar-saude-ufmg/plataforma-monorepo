import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { Textarea } from "../../components/Textarea/Textarea";
import { Form } from "./Form";

const meta = {
  title: "Templates/Form",
  component: Form,
  parameters: { layout: "padded", docs: { codePanel: true } },
  argTypes: {
    title: { control: "text", description: "Título exibido acima do formulário.", table: { category: "PROPS" } },
    description: { control: "text", description: "Descrição exibida abaixo do título.", table: { category: "PROPS" } },
    "aria-level": { control: "number", description: "Nível semântico do título.", table: { category: "ACCESSIBILITY", defaultValue: { summary: "1" } } },
    children: { control: false, description: "Conteúdo do formulário renderizado dentro do Card.", table: { category: "PROPS" } },
  },
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { title: "Novo projeto", description: "Preencha os dados para cadastrar um projeto." },
  render: (args) => (
    <Form {...args}>
      <Stack spacing={2}>
        <Input label="Nome do projeto" required />
        <Textarea label="Descrição do projeto" />
        <Select
          label="Tipo de projeto"
          options={[
            { value: "own", label: "Base própria" },
            { value: "niar", label: "Base NIAR" },
          ]}
        />
        <Input label="Responsável" />
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "flex-end", width: "100%" }}
        >
          <Button variant="outlined">Cancelar</Button>
          <Button variant="contained">Cadastrar projeto</Button>
        </Stack>
      </Stack>
    </Form>
  ),
  parameters: { docs: { canvas: { sourceState: "shown" }, description: { story: "Formulário com título, descrição, campos e ações dentro de um Card." }, source: { code: `<Form title="Novo projeto" description="Preencha os dados para cadastrar um projeto.">
  <Input label="Nome do projeto" required />
  <Textarea label="Descrição do projeto" />
  <Select label="Tipo de projeto" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base NIAR" }]} />
  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", width: "100%" }}>
    <Button variant="outlined">Cancelar</Button>
    <Button variant="contained">Cadastrar projeto</Button>
  </Stack>
</Form>` } } },
};
