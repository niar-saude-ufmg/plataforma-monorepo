import type {} from "@mui/x-chat/themeAugmentation";
import type { Components, Theme } from "@mui/material/styles";
import { niar, typographyStyle } from "../../tokens";

export const chatTheme: Pick<
  Components<Theme>,
  "MuiChatBox" | "MuiChatMessage" | "MuiChatComposer" | "MuiChatMessageList"
> = {
  MuiChatBox: {
    styleOverrides: { root: { fontFamily: niar.fontFamily } },
  },
  MuiChatMessage: {
    styleOverrides: {
      bubble: {
        ...typographyStyle("body"),
        borderRadius: niar.radius.medium,
        overflowWrap: "anywhere",
      },
    },
  },
  MuiChatMessageList: {
    styleOverrides: { root: { padding: niar.spacing.md } },
  },
  MuiChatComposer: {
    styleOverrides: {
      root: { padding: niar.spacing.md, gap: niar.spacing.sm },
      textArea: {
        ...typographyStyle("body"),
        borderRadius: niar.radius.small,
      },
      sendButton: {
        width: niar.sizing["3xl"],
        height: niar.sizing["3xl"],
        borderRadius: niar.radius.small,
      },
    },
  },
};
