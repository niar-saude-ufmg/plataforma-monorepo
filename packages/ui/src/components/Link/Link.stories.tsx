import LaunchIcon from "@mui/icons-material/Launch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { niar } from "../../tokens/index";
import { Link } from "./Link";
const meta = {
  title: "Componentes/Link",
  component: Link,
  args: { children: "Saiba mais", href: "#" },
  argTypes: {
    children: { control: "text", description: "Texto visível que identifica o destino do link.", table: { category: "PROPS", defaultValue: { summary: "Saiba mais" } } },
    inverse: { control: "boolean", description: "Usa a versão clara para fundos escuros ou imagens.", table: { category: "PROPS", defaultValue: { summary: "false" } } },
    startIcon: { control: false, description: "Ícone exibido antes do texto.", table: { category: "PROPS" } },
    endIcon: { control: false, description: "Ícone exibido depois do texto.", table: { category: "PROPS" } },
    underline: { control: "select", options: ["none", "hover", "always"], description: "Define quando o link deve ser sublinhado.", table: { category: "PROPS", defaultValue: { summary: "hover" } } },
    href: { control: "text", description: "Destino do link.", table: { category: "PROPS" } },
    onClick: { action: "clicked", description: "Callback executado quando o link é ativado.", table: { category: "EVENTS", defaultValue: { summary: "undefined" } } },
  },
  parameters: { docs: { codePanel: true, description: { component: "Link acessível para navegação, com ícones opcionais e versão inverse para fundos escuros." } } },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { parameters: { docs: { canvas: { sourceState: "shown" }, source: { code: '<Link href="/projetos" endIcon={<LaunchIcon />}>Ver projetos</Link>' } } } };

export const Inverse: Story = {
  args: { inverse: true, endIcon: <LaunchIcon /> },
  parameters: { controls: { disable: true }, docs: { canvas: { sourceState: "shown" }, description: { story: "Use inverse sobre superfícies escuras, mantendo o sublinhado somente ao passar o mouse." }, source: { code: '<Link inverse href="/sobre" endIcon={<LaunchIcon />}>Sobre o NIAR</Link>' } } },
  decorators: [(Story) => <div style={{ background: niar.colors.brand.deep, padding: 24 }}><Story /></div>],
};

export const Icons: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Demonstra o uso de ícones antes e depois do texto do link." },
      source: {
        code: `<Link href="/voltar" startIcon={<ArrowBackIcon />}>Voltar</Link>
<Link href="/projetos" endIcon={<LaunchIcon />}>Ver projetos</Link>`,
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: niar.spacing.xl }}>
      <Link href="#voltar" startIcon={<ArrowBackIcon />}>Voltar</Link>
      <Link href="#projetos" endIcon={<LaunchIcon />}>Ver projetos</Link>
    </div>
  ),
};

export const Underline: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Compara as três opções de sublinhado disponíveis no MUI: nenhum, somente ao passar o mouse e sempre visível." },
      source: {
        code: `<Link href="/sobre" underline="none">None</Link>
<Link href="/sobre" underline="hover">Hover</Link>
<Link href="/sobre" underline="always">Always</Link>`,
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: niar.spacing.xl }}>
      <Link href="#none" underline="none">None</Link>
      <Link href="#hover" underline="hover">Hover</Link>
      <Link href="#always" underline="always">Always</Link>
    </div>
  ),
};
