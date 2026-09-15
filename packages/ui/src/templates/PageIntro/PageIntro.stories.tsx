import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageIntro } from "./PageIntro";

const meta = { title: "Templates/PageIntro", component: PageIntro, parameters: { docs: { codePanel: true } }, args: { title: "Título da página", description: "Descrição contextual da página." }, argTypes: { title: { control: "text", description: "Título principal da página.", table: { category: "PROPS" } }, description: { control: "text", description: "Descrição exibida abaixo do título.", table: { category: "PROPS" } }, loading: { control: "boolean", description: "Exibe Skeleton no lugar da descrição.", table: { category: "PROPS", defaultValue: { summary: "false" } } }, "aria-level": { control: "number", description: "Nível semântico do título.", table: { category: "PROPS", defaultValue: { summary: "1" } } } } } satisfies Meta<typeof PageIntro>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Loading: Story = { args: { loading: true }, parameters: { controls: { disable: true }, docs: { description: { story: "Mantém o espaço da descrição enquanto o conteúdo é carregado." } } } };
