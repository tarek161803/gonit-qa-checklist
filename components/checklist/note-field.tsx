import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  value?: string;
  /** True when the field was just opened (focus it). */
  editing: boolean;
  onChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
}

/** Hidden behind "+ Add note" until opened; always shown once a note exists. */
export function NoteField({ value, editing, onChange, onOpen, onClose }: Props) {
  if (!value && !editing) {
    return (
      <Button variant="ghost" size="xs" className="mt-1 -ml-2 text-muted-foreground" onClick={onOpen}>
        <Plus />
        Add note
      </Button>
    );
  }

  return (
    <Input
      autoFocus={editing}
      className="mt-2 h-7 rounded-md bg-background/60 text-xs shadow-none"
      placeholder="Note / ticket"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onClose}
      onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && e.currentTarget.blur()}
    />
  );
}
