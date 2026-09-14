import { Menubar } from "@base-ui/react/menubar";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { MouseEventHandler, ReactNode } from "react";
import { niar } from "../../tokens/index";
import {
  menuItemStyles,
  menuPopupStyles,
  menuTriggerStyles,
} from "./Menu.theme";

export type MenuItemOption = {
  label: ReactNode;
  value?: string;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

export type MenuGroup = {
  label: ReactNode;
  items: readonly MenuItemOption[];
  disabled?: boolean;
};

export type MenuProps = {
  groups: readonly MenuGroup[];
};

const Trigger = styled("button")(menuTriggerStyles);

export function Menu({ groups }: MenuProps) {
  return (
    <Menubar style={{ display: "flex", gap: niar.spacing["2xs"] }}>
      {groups.map((group, groupIndex) => (
        <BaseMenu.Root key={groupIndex}>
          <BaseMenu.Trigger
            disabled={group.disabled}
            openOnHover
            render={<Trigger />}
          >
            {group.label}
          </BaseMenu.Trigger>
          <BaseMenu.Portal>
            <BaseMenu.Positioner sideOffset={4}>
              <BaseMenu.Popup style={menuPopupStyles}>
                {group.items.map((item, itemIndex) => (
                  <BaseMenu.Item
                    key={itemIndex}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    render={item.href ? <a href={item.href} /> : undefined}
                    style={(state) => ({
                      ...menuItemStyles,
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
