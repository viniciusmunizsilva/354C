"use client";

import { useRef, useState, type ReactNode } from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/constants";

interface FileDropzoneProps {
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  icon?: ReactNode;
  disabled?: boolean;
}

export function FileDropzone({
  label,
  hint,
  accept,
  multiple = false,
  files,
  onChange,
  icon,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    const list = Array.from(incoming);
    onChange(multiple ? [...files, ...list] : [list[0]]);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-card px-4 py-7 text-center transition-colors",
          dragging && "border-accent bg-accent/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {icon ?? <UploadCloud className="size-5" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <span className="truncate" title={file.name}>
                {file.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  aria-label={`Remover ${file.name}`}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                >
                  <X className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
