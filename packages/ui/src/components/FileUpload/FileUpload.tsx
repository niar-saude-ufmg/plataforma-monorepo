import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import UploadFile from "@mui/icons-material/UploadFile";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import IconButton from "@mui/material/IconButton";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

export type FileUploadProps = {
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
  onRemove?: (file: File) => void;
  "aria-label"?: string;
  selectedFilesLabel?: string;
  removeFileLabel?: (fileName: string) => string;
};

export function FileUpload({
  label = "Selecionar arquivo",
  description = "Arraste um arquivo ou selecione no seu dispositivo",
  accept,
  multiple = false,
  disabled = false,
  onChange,
  onRemove,
  "aria-label": ariaLabel = "Área para enviar arquivos",
  selectedFilesLabel = "Arquivos selecionados",
  removeFileLabel = (fileName) => `Remover ${fileName}`,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const updateFiles = (selected: File[]) => {
    const nextFiles = multiple ? [...files, ...selected] : selected;
    setFiles(nextFiles);
    onChange?.(nextFiles);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      updateFiles(Array.from(event.dataTransfer.files));
    }
  };
  return (
    <>
      <Box>
        <Box
          sx={{
            border: "1px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            transition: "border-color 120ms ease, background-color 120ms ease",
            ...(isDragging && { bgcolor: "action.hover" }),
          }}
          onDragEnter={() => !disabled && setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="region"
          aria-label={ariaLabel}
        >
          <UploadFile color="primary" fontSize="large" aria-hidden="true" />
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            {description}
          </Typography>
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {label}
          </Button>
          <input
            ref={inputRef}
            hidden
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            aria-label={label}
            onChange={handleChange}
          />
        </Box>
        {files.length > 0 && (
          <Box
            component="ul"
            aria-label={selectedFilesLabel}
            sx={{ listStyle: "none", m: 0, mt: 1, p: 0 }}
          >
            {files.map((file) => (
              <Box
                component="li"
                key={`${file.name}-${file.lastModified}`}
                sx={{
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "flex",
                  gap: 1,
                  mb: 1,
                  p: 1.5,
                }}
              >
                <InsertDriveFileOutlined color="primary" aria-hidden="true" />
                <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <Typography variant="body2" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.ceil(file.size / 1024)} KB
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label={removeFileLabel(file.name)}
                  onClick={() => {
                    const remaining = files.filter((item) => item !== file);
                    setFiles(remaining);
                    onChange?.(remaining);
                    onRemove?.(file);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
}
