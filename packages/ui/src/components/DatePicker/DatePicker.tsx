import { Input, type InputProps } from "../Input/Input";
import { useRef } from "react";

export type DatePickerProps = Omit<
  InputProps,
  "type" | "showPasswordLabel" | "hidePasswordLabel"
>;

/** Campo de data com o padrão visual do Design System e seletor nativo do navegador. */
export function DatePicker({ disabled, sx, ...props }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursor = disabled ? "not-allowed" : "pointer";

  const openPicker = () => {
    if (disabled) {
      return;
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
  };

  return (
    <div
      className={`niar-date-picker${disabled ? " niar-date-picker--disabled" : ""}`}
      style={{ cursor }}
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).closest("input")) {
          event.preventDefault();
          openPicker();
        }
      }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("input, button")) {
          return;
        }
        openPicker();
      }}
    >
      <Input
        {...props}
        disabled={disabled}
        type="date"
        inputRef={inputRef}
        sx={[
          {
            "& .MuiTextField-root, & .MuiInputBase-root, & .MuiInputLabel-root, & input[type='date']": {
              cursor,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    </div>
  );
}
