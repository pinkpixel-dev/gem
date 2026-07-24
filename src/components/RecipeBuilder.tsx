import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChipInput } from "@/components/ChipInput";
import {
  emptyRecipeCriteria,
  parseRecipeQuery,
  serializeRecipeCriteria,
  type DateField,
  type RecipeCriteria,
} from "@/lib/recipeQuery";
import {
  COMMON_LANGUAGES,
  COMMON_EXCLUDE_TERMS,
  SUGGESTED_TOPICS,
} from "@/lib/recipeSuggestions";

interface RecipeBuilderProps {
  /** Existing raw query to edit. Omit for a fresh/blank recipe. */
  initialQuery?: string;
  onSave: (query: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const RECENCY_NONE = "none";

export function RecipeBuilder({ initialQuery, onSave, onCancel, submitLabel = "Save Recipe" }: RecipeBuilderProps) {
  const [criteria, setCriteria] = useState<RecipeCriteria>(() =>
    initialQuery ? parseRecipeQuery(initialQuery) : emptyRecipeCriteria()
  );

  const recencyValue = criteria.dateQualifier
    ? criteria.dateQualifier.field
    : RECENCY_NONE;

  const preview = serializeRecipeCriteria(criteria);

  const handleRecencyChange = (value: string) => {
    setCriteria((prev) => ({
      ...prev,
      dateQualifier: value === RECENCY_NONE ? undefined : { field: value as DateField, days: 30 },
    }));
  };

  const handleSubmit = () => {
    if (!preview.trim()) return;
    onSave(preview);
  };

  return (
    <div className="space-y-5 border border-zinc-800 bg-zinc-950/60 rounded-lg p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Stars: Min
          </Label>
          <Input
            type="number"
            min={0}
            value={criteria.starsMin ?? ""}
            onChange={(e) =>
              setCriteria((prev) => ({
                ...prev,
                starsMin: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
              }))
            }
            placeholder="e.g. 3"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Stars: Max
          </Label>
          <Input
            type="number"
            min={0}
            value={criteria.starsMax ?? ""}
            onChange={(e) =>
              setCriteria((prev) => ({
                ...prev,
                starsMax: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
              }))
            }
            placeholder="e.g. 250"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Language
          </Label>
          <Input
            list="recipe-language-suggestions"
            value={criteria.language ?? ""}
            onChange={(e) => setCriteria((prev) => ({ ...prev, language: e.target.value }))}
            placeholder="e.g. Rust (optional)"
          />
          <datalist id="recipe-language-suggestions">
            {COMMON_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Recency
          </Label>
          <Select value={recencyValue} onValueChange={handleRecencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RECENCY_NONE}>Any time</SelectItem>
              <SelectItem value="created">Created in the last 30 days</SelectItem>
              <SelectItem value="pushed">Pushed in the last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
          Topics
        </Label>
        <ChipInput
          values={criteria.topics}
          onChange={(topics) => setCriteria((prev) => ({ ...prev, topics }))}
          placeholder="Type a topic and press Enter (e.g. cli, self-hosted)"
          suggestions={SUGGESTED_TOPICS}
          datalistId="recipe-topic-suggestions"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
          Exclude Terms
        </Label>
        <ChipInput
          values={criteria.excludeTerms}
          onChange={(excludeTerms) => setCriteria((prev) => ({ ...prev, excludeTerms }))}
          placeholder="Type a term to exclude and press Enter (e.g. windows, tutorial)"
          suggestions={COMMON_EXCLUDE_TERMS}
          datalistId="recipe-exclude-suggestions"
        />
      </div>

      <details className="group">
        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 select-none">
          Advanced: additional raw qualifiers
        </summary>
        <div className="mt-2 space-y-1.5">
          <Textarea
            value={criteria.rawExtra}
            onChange={(e) => setCriteria((prev) => ({ ...prev, rawExtra: e.target.value }))}
            placeholder="Any extra GitHub search qualifiers not covered above, e.g. license:mit archived:false"
            className="font-mono text-xs min-h-16"
          />
        </div>
      </details>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
          Generated Query Preview
        </Label>
        <code className="block text-xs text-zinc-400 font-mono bg-zinc-900/60 px-3 py-2 rounded border border-zinc-900 break-all">
          {preview || "(empty - add at least one filter)"}
        </code>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!preview.trim()}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
