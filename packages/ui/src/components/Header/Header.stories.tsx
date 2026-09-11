import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import { Header } from "./Header";

const meta = {
  title: "Componentes/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { codePanel: true } },
  decorators: [
    (Story) => (
      <div style={{ boxSizing: "border-box", display: "block", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: <ContentSlot />,
  },
};

export const WithLogo: Story = {
  args: {
    logo: (
      <img src="/niar-logo.png" alt="NIAR" style={{ height: 20, width: 92 }} />
    ),
    children: <ContentSlot />,
  },
};

function ContentSlot() {
  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "grey.100",
        border: "1px dashed",
        borderColor: "grey.400",
        color: "text.secondary",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        minHeight: 40,
        p: 2,
      }}
    >
      Content
    </Box>
  );
}
