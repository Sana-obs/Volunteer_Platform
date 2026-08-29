// "thumbnail + text + hidden file input" upload row, built on ImageUploader.

import { CheckCircle2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

function formatFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function UploadRow({
  fieldId,
  previewUrl,
  fileName,
  fileSize,
  onFileChange,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  fallbackIcon = "upload",
  changeText,
  uploadText,
  helperText = "JPG, PNG or WEBP · Up to 2MB",
  error,
  className = "flex w-full cursor-pointer items-center gap-4 rounded-xl border border-heading/10 bg-field px-4 py-3 transition-colors hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/40",
}) {
  const errorId = error ? `${fieldId}-error` : undefined;
  const hasFile = Boolean(previewUrl);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={fieldId} className={className}>
        <ImageUploader
          previewUrl={previewUrl}
          shape="square"
          size="sm"
          fallbackIcon={fallbackIcon}
          disabled
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-heading">
            {hasFile ? fileName || changeText : uploadText}
          </span>

          {hasFile ? (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 size={13} className="shrink-0" aria-hidden="true" />
              <span className="truncate">
                {fileSize ? `${formatFileSize(fileSize)} · ` : ""}Ready to upload
              </span>
            </span>
          ) : (
            <span className="text-xs text-body/70">{helperText}</span>
          )}
        </div>
        <input
          id={fieldId}
          type="file"
          accept={accept}
          className="sr-only"
          aria-describedby={errorId}
          onChange={onFileChange}
        />
      </label>

      {hasFile && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="self-start rounded text-xs font-medium text-danger hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
        >
          Remove file
        </button>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
