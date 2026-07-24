import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  datalistId: string;
}

/** Free-text tag input: type a value and press Enter/comma to add it as a
 * removable chip. Suggestions are offered via a native <datalist> so users
 * get autocomplete without being restricted to the suggested list. */
export function ChipInput({ values, onChange, placeholder, suggestions, datalistId }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim().replace(/,$/, "");
    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-input/30 px-2.5 py-1.5 min-h-9">
        {values.map((value, i) => (
          <Badge key={`${value}-${i}`} variant="secondary" className="gap-1 pr-1">
            {value}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="rounded-sm hover:bg-foreground/10"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          list={datalistId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : undefined}
          className="flex-1 min-w-[8ch] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {suggestions && (
        <datalist id={datalistId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
