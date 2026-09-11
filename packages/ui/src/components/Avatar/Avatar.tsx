import MuiAvatar, {
  type AvatarProps as MuiAvatarProps,
} from "@mui/material/Avatar";

export type AvatarProps = MuiAvatarProps;

export function Avatar(props: AvatarProps) {
  return <MuiAvatar {...props} />;
}
