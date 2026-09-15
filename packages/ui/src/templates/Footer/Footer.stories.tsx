import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link } from "../../components/Link/Link";
import { niar } from "../../tokens/index";
import { Footer } from "./Footer";

const meta = {
  title: "Templates/Footer",
  component: Footer,
  parameters: { layout: "fullscreen", docs: { codePanel: true } },
  argTypes: {
    logo: { control: "boolean", description: "Exibe o logo oficial branco do NIAR.", table: { category: "PROPS", defaultValue: { summary: "true" } } },
    logoAlt: { control: "text", description: "Texto alternativo do logo.", table: { category: "PROPS" } },
    logoHref: { control: "text", description: "Destino do link do logo.", table: { category: "PROPS" } },
    onLogoClick: { action: "logoClicked", description: "Callback acionado ao clicar no logo.", table: { category: "EVENTS" } },
    description: { control: false, description: "Texto institucional exibido junto à identidade.", table: { category: "PROPS" } },
    navigation: { control: false, description: "Menu editável de navegação.", table: { category: "PROPS" } },
    information: { control: false, description: "Informações de contato e localização.", table: { category: "PROPS" } },
    partners: { control: false, description: "Logos ou links de realização e parcerias.", table: { category: "PROPS" } },
    copyright: { control: "text", description: "Texto exibido no rodapé.", table: { category: "PROPS" } },
    language: { control: false, description: "Seletor ou indicação de idioma do rodapé.", table: { category: "PROPS" } },
    children: { control: false, description: "Conteúdo adicional renderizado na área de identidade do rodapé.", table: { category: "PROPS" } },
  },
} satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  args: {
    logo: true,
    description: "Pesquisa interdisciplinar em inteligência artificial responsável para a saúde.",
    navigation: (
      <nav aria-label="Navegação do rodapé">
        <Typography variant="overline">Navegação</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(100px, 1fr))", gap: 1 }}>
          <Link inverse href="#sobre">Sobre</Link>
          <Link inverse href="#noticias">Notícias</Link>
          <Link inverse href="#publicacoes">Publicações</Link>
          <Link inverse href="#equipe">Equipe</Link>
          <Link inverse href="#assistente">Assistente</Link>
          <Link inverse href="#contato">Contato</Link>
        </Box>
      </nav>
    ),
    information: (
      <Box>
        <Typography variant="overline">Informações</Typography>
        <Typography>niar@dcc.ufmg.br</Typography>
        <Typography>UFMG · Belo Horizonte</Typography>
      </Box>
    ),
    partners: (
      <Box>
        <Typography variant="overline">Realização e parcerias</Typography>
        <Box sx={{ alignItems: "center", backgroundColor: niar.colors.surface.card, borderRadius: niar.radius.medium, display: "flex", flexWrap: "wrap", gap: niar.spacing.md, height: { xs: "auto", sm: 44 }, justifyContent: "space-around", maxWidth: "100%", overflow: "hidden", padding: niar.spacing.xs }}>
          <Box component="img" src="/ufmg.png" alt="UFMG" sx={{ maxHeight: 22, maxWidth: "22%", objectFit: "contain" }} />
          <Box component="img" src="/sus.png" alt="SUS 35 Anos" sx={{ maxHeight: 24, maxWidth: "22%", objectFit: "contain" }} />
          <Box component="img" src="/ministerio-saude.png" alt="Ministério da Saúde" sx={{ maxHeight: 22, maxWidth: "28%", objectFit: "contain" }} />
          <Box component="img" src="/governo-brasil.png" alt="Governo do Brasil" sx={{ maxHeight: 24, maxWidth: "22%", objectFit: "contain" }} />
        </Box>
      </Box>
    ),
    copyright: "© 2026 NIAR-Saúde",
    language: (
      <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
        <Link inverse href="#pt" aria-label="Português">PT</Link>
        <Typography component="span" variant="body2" aria-hidden="true">|</Typography>
        <Link inverse href="#en" aria-label="English">EN</Link>
      </Box>
    ),
  },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Estrutura de rodapé institucional com conteúdo editável." },
      source: {
        code: `<Footer
  logo
  description="Pesquisa interdisciplinar em inteligência artificial responsável para a saúde."
  navigation={navigation}
  information={information}
  partners={partners}
  language={language}
  copyright="© 2026 NIAR-Saúde"
/>`,
      },
    },
  },
};
