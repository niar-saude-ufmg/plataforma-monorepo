export type DownloadedFile = {
  blob: Blob;
  filename: string;
};

export function getFilenameFromContentDisposition(
  value: string | null | undefined,
  fallback: string,
) {
  if (!value) return fallback;

  const encodedFilename = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename.replace(/^"|"$/g, '')) || fallback;
    } catch {
      return fallback;
    }
  }

  const filename = value.match(/filename="?([^";]+)"?/i)?.[1]?.trim();
  return filename || fallback;
}

export function downloadBlob({ blob, filename }: DownloadedFile) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
