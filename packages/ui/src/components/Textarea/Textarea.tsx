import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { forwardRef } from "react";
export type TextareaProps = Omit<
  TextFieldProps<"outlined">,
  "variant" | "size" | "type" | "select"
>;
export const Textarea = forwardRef<HTMLDivElement, TextareaProps>(
  function Textarea(props, ref) {
    return (
      <TextField
        {...props}
        ref={ref}
        variant="outlined"
        multiline
        minRows={4}
      />
    );
  },
);
