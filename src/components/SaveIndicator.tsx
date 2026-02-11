import { Check, Loader2, AlertCircle } from "lucide-react";

interface Props {
  status: "idle" | "saving" | "saved" | "error";
}

export function SaveIndicator({ status }: Props) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground saving-indicator">Menyimpan…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-primary" />
          <span className="text-primary">Tersimpan</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Gagal menyimpan</span>
        </>
      )}
    </div>
  );
}
