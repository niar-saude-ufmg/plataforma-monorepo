import type { Preview } from "@storybook/react-vite";
import { create } from "storybook/theming";
import { NiarProvider } from "../src/theme/index";
import { niar } from "../src/tokens/index";
import "../src/tokens/styles/tokens.css";
import "./docs.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <NiarProvider>
        <Story />
      </NiarProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: niar.colors.surface.card }],
    },
    controls: { expanded: true },
    docs: {
      canvas: { sourceState: "shown" },
      source: { state: "open" },
      theme: create({ base: "light" }),
    },
    options: {
      storySort: {
        order: [
          "Fundamentos",
          ["Identidade Visual", "Cores", "Tokens"],
          "Componentes",
        ],
      },
    },
  },
};

export default preview;
