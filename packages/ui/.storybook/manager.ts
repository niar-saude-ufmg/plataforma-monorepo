import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "NIAR UI",
    brandImage: "/niar-logo.png",
    brandTarget: "_self",
  }),
});
