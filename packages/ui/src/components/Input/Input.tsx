import TextField, { type TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SvgIcon from "@mui/material/SvgIcon";
import { forwardRef, useState } from "react";

export type InputProps = Omit<
  TextFieldProps<"outlined">,
  | "variant"
  | "size"
  | "type"
  | "select"
  | "multiline"
  | "rows"
  | "minRows"
  | "maxRows"
  | "slots"
  | "slotProps"
> & {
  type?: "text" | "email" | "password";
};

export const Input = forwardRef<HTMLDivElement, InputProps>(function Input(
  { type = "text", disabled, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <TextField
      {...props}
      ref={ref}
      variant="outlined"
      size="medium"
      disabled={disabled}
      type={isPassword && showPassword ? "text" : type}
      slotProps={{
        input: {
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                disabled={disabled}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <SvgIcon>
                  {showPassword ? (
                    <path d="M2.1 3.51 3.51 2.1 21.9 20.49l-1.41 1.41-3.2-3.2A11.8 11.8 0 0 1 12 20C7 20 2.73 16.89 1 12a13.6 13.6 0 0 1 4.06-5.94L2.1 3.51ZM12 7c-.58 0-1.14.1-1.66.28l1.72 1.72A3 3 0 0 1 15 11.94l1.72 1.72A5 5 0 0 0 12 7Zm0-3c5 0 9.27 3.11 11 8a13.7 13.7 0 0 1-3.23 5.13l-2.12-2.12A7 7 0 0 0 7.99 5.35L6.48 3.84A12 12 0 0 1 12 4ZM7 12a5 5 0 0 0 7.66 4.23l-1.5-1.5a3 3 0 0 1-3.89-3.89l-1.5-1.5A5 5 0 0 0 7 12Z" />
                  ) : (
                    <path d="M12 4C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8Zm0 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  )}
                </SvgIcon>
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
});
