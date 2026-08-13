import { useRef, useState } from "react";
import { FileText, Paperclip, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes } from "@/lib/utils";
import type { SubmissionFile } from "@/lib/types";

interface FileDropzoneProps {
  files: SubmissionFile[];
  onChange: (files: SubmissionFile[]) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
}

const EXECUTABLE_EXTENSIONS = ["exe", "bat", "cmd", "com", "msi", "sh", "bin", "dmg", "scr", "ps1"];

export function FileDropzone({ files, onChange, accept, maxSizeBytes = 100 * 1024 * 1024, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;
    setError(null);
    const incoming = Array.from(fileList);
    const rejected = incoming.find((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      return EXECUTABLE_EXTENSIONS.includes(ext) || f.size > maxSizeBytes;
    });
    if (rejected) {
      setError(`"${rejected.name}" can't be submitted — executable files are blocked, and the limit is ${formatBytes(maxSizeBytes)}.`);
      return;
    }
    const next: SubmissionFile[] = [...files];
    incoming.forEach((f) => {
      const id = `${f.name}-${Date.now()}`;
      setProgress((p) => ({ ...p, [id]: 0 }));
      const tick = () => {
        setProgress((p) => {
          const current = p[id] ?? 0;
          if (current >= 100) return p;
          const nextVal = Math.min(100, current + 15 + Math.random() * 25);
          setTimeout(tick, 120);
          return { ...p, [id]: nextVal };
        });
      };
      tick();
      next.push({ id, name: f.name, size: f.size });
    });
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-accent/50" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-accent/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
          <Upload className="h-4 w-4 text-primary" aria-hidden />
        </span>
        <p className="text-sm font-medium">Drag files here, or <span className="text-primary underline underline-offset-2">browse</span></p>
        <p className="text-xs text-muted-foreground">PDF, images, Word, text, code — up to {formatBytes(maxSizeBytes)}. Executables are blocked.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          aria-label="Choose files to submit"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      {error && <p className="text-xs text-danger">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Attached files">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <div className="flex items-center gap-2">
                  <span className="mono-data text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                  {progress[f.id] !== undefined && progress[f.id] < 100 && (
                    <Progress value={progress[f.id]} className="h-1 w-24" aria-label={`Uploading ${f.name}`} />
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${f.name}`}
                disabled={disabled}
                onClick={() => onChange(files.filter((x) => x.id !== f.id))}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LinkSubmissionInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a link (e.g. a Google Docs URL)"
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Submission link"
      />
    </div>
  );
}