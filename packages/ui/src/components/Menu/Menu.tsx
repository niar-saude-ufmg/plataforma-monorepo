import { Menubar } from "@base-ui/react/menubar";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { niar } from "../../tokens/index";

export type MenuItemOption = {
  label: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export type MenuGroup = {
  label: ReactNode;
  items: readonly MenuItemOption[];
  disabled?: boolean;
};

export type MenuProps = {
  groups: readonly MenuGroup[];
};

const Trigger = styled("button")({
  background: "transparent",
  border: 0,
  borderRadius: niar.radius.small,
  color: niar.colors.text.body,
  cursor: "pointer",
  fontFamily: niar.fontFamily,
  fontSize: niar.fontSize.body,
  fontWeight: niar.fontWeight.medium,
  padding: `${niar.spacing.xs} ${niar.spacing.sm}`,
  "&:hover": { backgroundColor: niar.colors.surface.page },
  '&[aria-expanded="true"]': { backgroundColor: niar.colors.border },
  '&:focus-visible': { outline: `${niar.borderWidth.focus} solid ${niar.colors.focus}`, outlineOffset: 1 },
});

const popupStyle = {
  background: niar.colors.surface.card,
  border: `${niar.borderWidth.default} solid ${niar.colors.border}`,
  borderRadius: niar.radius.small,
  boxShadow: niar.shadow.card,
  minWidth: 180,
  padding: niar.spacing["2xs"],
};

const itemStyle = {
  alignItems: "center",
  border: 0,
  boxSizing: "border-box" as const,
  borderRadius: niar.radius.small,
  color: niar.colors.text.body,
  cursor: "pointer",
  display: "flex",
  fontFamily: niar.fontFamily,
  fontSize: niar.fontSize.body,
  fontWeight: niar.fontWeight.regular,
  padding: `${niar.spacing.xs} ${niar.spacing.sm}`,
  textAlign: "left" as const,
  width: "100%",
};

export function Menu({ groups }: MenuProps) {
  return (
    <Menubar style={{ display: "flex", gap: niar.spacing["2xs"] }}>
      {groups.map((group, groupIndex) => (
        <BaseMenu.Root key={groupIndex}>
          <BaseMenu.Trigger disabled={group.disabled} openOnHover render={<Trigger />}>
            {group.label}
          </BaseMenu.Trigger>
          <BaseMenu.Portal>
            <BaseMenu.Positioner sideOffset={4}>
              <BaseMenu.Popup style={popupStyle}>
                {group.items.map((item, itemIndex) => (
                  <BaseMenu.Item
                    key={itemIndex}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    style={(state) => ({
                      ...itemStyle,
                      backgroundColor: state.highlighted
                        ? niar.colors.surface.page
                        : niar.colors.surface.card,
                    })}
                  >
                    {item.label}
                  </BaseMenu.Item>
                ))}
              </BaseMenu.Popup>
            </BaseMenu.Positioner>
          </BaseMenu.Portal>
        </BaseMenu.Root>
      ))}
    </Menubar>
  );
}
