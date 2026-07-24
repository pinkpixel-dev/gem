import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeBuilder } from "@/components/RecipeBuilder";
import { describeRecipeCriteria, parseRecipeQuery } from "@/lib/recipeQuery";
import { COMMON_LANGUAGES, SUGGESTED_TOPICS } from "@/lib/recipeSuggestions";
import type { Preference, SavedSearch } from "@/types";

export function SettingsPage() {
  const [githubToken, setGithubToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("");
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [activePrefTab, setActivePrefTab] = useState<"topic" | "language" | "keyword">("topic");
  const [autoClearDays, setAutoClearDays] = useState("0");

  const [newPrefName, setNewPrefName] = useState("");
  const [newPrefWeight, setNewPrefWeight] = useState(0);

  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);

  const fetchSettings = async () => {
    try {
      const token = await invoke<string | null>("get_github_token");
      setGithubToken(token || "");

      const searchList = await invoke<SavedSearch[]>("get_saved_searches");
      setSearches(searchList);

      const prefList = await invoke<Preference[]>("get_preferences");
      setPreferences(prefList);

      const clearDays = await invoke<string | null>("get_setting", { key: "auto_clear_skipped_days" });
      setAutoClearDays(clearDays || "0");
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveToken = async () => {
    try {
      await invoke("set_github_token", { token: githubToken });
      setTokenStatus("Token saved successfully.");
      setTimeout(() => setTokenStatus(""), 3000);
    } catch (err) {
      setTokenStatus("Failed to save token: " + err);
    }
  };

  const handleSaveAutoClearDays = async (value: string) => {
    try {
      setAutoClearDays(value);
      await invoke("set_setting", { key: "auto_clear_skipped_days", value });
    } catch (err) {
      console.error("Failed to save auto-clear setting:", err);
    }
  };

  const refreshSearches = async () => {
    const searchList = await invoke<SavedSearch[]>("get_saved_searches");
    setSearches(searchList);
  };

  const handleAddRecipe = async (query: string) => {
    try {
      await invoke("add_saved_search", { query });
      setIsAddingRecipe(false);
      await refreshSearches();
    } catch (err) {
      console.error("Failed to add recipe:", err);
    }
  };

  const handleUpdateRecipe = async (search: SavedSearch, query: string) => {
    try {
      if (query !== search.query) {
        await invoke("delete_saved_search", { id: search.id });
        await invoke("add_saved_search", { query });
      }
      setEditingRecipeId(null);
      await refreshSearches();
    } catch (err) {
      console.error("Failed to update recipe:", err);
    }
  };

  const handleDeleteSearch = async (id: number) => {
    try {
      await invoke("delete_saved_search", { id });
      await refreshSearches();
    } catch (err) {
      console.error("Failed to delete search:", err);
    }
  };

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefName.trim()) return;
    try {
      await invoke("update_preference", {
        keyType: activePrefTab,
        keyName: newPrefName.trim(),
        weight: newPrefWeight,
      });
      setNewPrefName("");
      setNewPrefWeight(0);
      const prefList = await invoke<Preference[]>("get_preferences");
      setPreferences(prefList);
    } catch (err) {
      console.error("Failed to add preference:", err);
    }
  };

  const handleUpdateWeight = async (pref: Preference, delta: number) => {
    try {
      await invoke("update_preference", {
        keyType: pref.keyType,
        keyName: pref.keyName,
        weight: pref.weight + delta,
      });
      const prefList = await invoke<Preference[]>("get_preferences");
      setPreferences(prefList);
    } catch (err) {
      console.error("Failed to update weight:", err);
    }
  };

  const handleDeletePreference = async (id: number) => {
    try {
      await invoke("delete_preference", { id });
      const prefList = await invoke<Preference[]>("get_preferences");
      setPreferences(prefList);
    } catch (err) {
      console.error("Failed to delete preference:", err);
    }
  };

  const prefSuggestions = activePrefTab === "topic"
    ? SUGGESTED_TOPICS
    : activePrefTab === "language"
    ? COMMON_LANGUAGES
    : undefined;

  return (
    <div className="space-y-10">
      {/* GitHub Token Config */}
      <section className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
        <h3 className="text-base font-bold text-white">GitHub Personal Access Token</h3>
        <p className="text-xs text-zinc-400">
          A token is required to increase search limits. Scans check the `GITHUB_TOKEN` environment variable first, then fallback to this token.
        </p>
        <div className="flex gap-3">
          <Input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_..."
            className="flex-1"
          />
          <Button onClick={handleSaveToken}>Save Token</Button>
        </div>
        {tokenStatus && (
          <div className="text-xs text-zinc-400 font-mono mt-1">{tokenStatus}</div>
        )}
      </section>

      {/* Auto-Clear Skipped Config */}
      <section className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Auto-Clear Skipped Repositories</h3>
        <p className="text-xs text-zinc-400">
          To prevent database bloat, configure how long skipped repositories should remain in the database.
          Cleared items are temporarily marked as hidden so they won't show up in your Inbox again, and physically deleted after 30 days.
        </p>
        <div className="w-64">
          <Select value={autoClearDays} onValueChange={handleSaveAutoClearDays}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Never (Keep indefinitely)</SelectItem>
              <SelectItem value="7">After 7 days</SelectItem>
              <SelectItem value="30">After 30 days</SelectItem>
              <SelectItem value="90">After 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Saved Searches / Recipes Config */}
      <section className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">GitHub Search Recipes</h3>
            <p className="text-xs text-zinc-400">
              Build the rotating queries scanned by the engine using the fields below - no GitHub search syntax required.
            </p>
          </div>
          {!isAddingRecipe && (
            <Button onClick={() => setIsAddingRecipe(true)} className="shrink-0">
              + Add Recipe
            </Button>
          )}
        </div>

        {isAddingRecipe && (
          <RecipeBuilder
            onSave={handleAddRecipe}
            onCancel={() => setIsAddingRecipe(false)}
            submitLabel="Add Recipe"
          />
        )}

        <div className="space-y-3">
          {searches.length === 0 && !isAddingRecipe && (
            <div className="text-xs text-zinc-500 text-center py-6 border border-dashed border-zinc-800 rounded">
              No recipes configured yet.
            </div>
          )}
          {searches.map((search) =>
            editingRecipeId === search.id ? (
              <RecipeBuilder
                key={search.id}
                initialQuery={search.query}
                onSave={(query) => handleUpdateRecipe(search, query)}
                onCancel={() => setEditingRecipeId(null)}
                submitLabel="Save Changes"
              />
            ) : (
              <div
                key={search.id}
                className="border border-zinc-900 rounded-lg p-4 flex items-start justify-between gap-4 hover:border-zinc-800 transition-colors duration-150"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="text-sm text-zinc-200 font-medium">
                    {describeRecipeCriteria(parseRecipeQuery(search.query))}
                  </div>
                  <code className="block text-xs text-zinc-500 font-mono break-all">
                    {search.query}
                  </code>
                  <div className="text-[10px] text-zinc-600">
                    Last scanned: {search.lastScannedAt ? new Date(search.lastScannedAt).toLocaleString() : "Never"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditingRecipeId(search.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Preferences Weight Config */}
      <section className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Taste Tuning Weights</h3>
          <p className="text-xs text-zinc-400">
            Tweak scoring rules. Positive weights boost matches; negative weights suppress matching languages, topics, or description keywords.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800">
          {(["topic", "language", "keyword"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePrefTab(tab)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors duration-150 ${
                activePrefTab === tab
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>

        {/* Add New Preference Rule */}
        <form onSubmit={handleAddPreference} className="grid grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-zinc-500 font-bold block">
              Rule Name
            </Label>
            <Input
              type="text"
              list={prefSuggestions ? "pref-name-suggestions" : undefined}
              value={newPrefName}
              onChange={(e) => setNewPrefName(e.target.value)}
              placeholder={
                activePrefTab === "topic"
                  ? "e.g. tui"
                  : activePrefTab === "language"
                  ? "e.g. Go"
                  : "e.g. boilerplate"
              }
            />
            {prefSuggestions && (
              <datalist id="pref-name-suggestions">
                {prefSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-zinc-500 font-bold block">
              Weight Modifier
            </Label>
            <Input
              type="number"
              value={newPrefWeight}
              onChange={(e) => setNewPrefWeight(parseInt(e.target.value) || 0)}
              placeholder="e.g. +8 or -5"
            />
          </div>
          <Button type="submit" className="h-9">
            Add Weight Rule
          </Button>
        </form>

        {/* Active List */}
        <div className="border border-zinc-900 rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs font-mono">
                <th className="p-3">Key Name</th>
                <th className="p-3 w-32 text-center">Score Weight</th>
                <th className="p-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-zinc-950/40">
              {preferences
                .filter((p) => p.keyType === activePrefTab)
                .map((pref) => (
                  <tr key={pref.id} className="hover:bg-zinc-900/30">
                    <td className="p-3 text-zinc-300 font-mono text-xs">
                      {pref.keyType === "topic" && "#"}
                      {pref.keyName}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateWeight(pref, -1)}
                          className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className={`w-8 font-mono text-xs font-bold ${
                          pref.weight > 0
                            ? "text-emerald-400"
                            : pref.weight < 0
                            ? "text-rose-400"
                            : "text-zinc-500"
                        }`}>
                          {pref.weight > 0 && "+"}
                          {pref.weight}
                        </span>
                        <button
                          onClick={() => handleUpdateWeight(pref, 1)}
                          className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeletePreference(pref.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {preferences.filter((p) => p.keyType === activePrefTab).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-xs text-zinc-500">
                    No tuning weights configured for {activePrefTab}s.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
