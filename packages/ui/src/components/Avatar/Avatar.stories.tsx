import Person from "@mui/icons-material/Person";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "Componentes/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { docs: { codePanel: true } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { children: "UN", alt: "Usuário NIAR" },
};
export const Initials: Story = {
  args: { children: "UN", alt: "Usuário NIAR" },
};
export const Icon: Story = {
  args: { children: <Person />, alt: "Usuário NIAR" },
};
export const Image: Story = {
  args: {
    alt: "Usuário NIAR",
    src: "https://mui.com/static/images/avatar/1.jpg",
  },
};
