import type { ChecklistItem } from "@/data/checklist";
import type { Result } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ItemBadges } from "./item-badges";
import { NoteField } from "./note-field";
import { ResultToggle } from "./result-toggle";

interface Props {
  item: ChecklistItem;
  result?: Result;
  note?: string;
  editingNote: boolean;
  onResult: (value: Result) => void;
  onNoteChange: (value: string) => void;
  onEditNote: (open: boolean) => void;
}

export function TestItem({ item, result, note, editingNote, onResult, onNoteChange, onEditNote }: Props) {
  return (
    <li
      className={cn(
        "border-l-2 border-l-transparent px-4 py-3 transition-colors",
        result === "pass" && "border-l-success bg-success/5",
        result === "fail" && "border-l-destructive bg-destructive/5",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm leading-relaxed sm:flex-row sm:items-start sm:gap-2 sm:pt-0.5">
          <ItemBadges item={item} />
          <p className="min-w-0">{item.text}</p>
        </div>
        <ResultToggle num={item.num} result={result} onChange={onResult} />
      </div>
      <NoteField value={note} editing={editingNote} onChange={onNoteChange} onOpen={() => onEditNote(true)} onClose={() => onEditNote(false)} />
    </li>
  );
}
