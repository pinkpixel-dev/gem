import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { serializeRecipeCriteria } from "@/lib/recipeQuery";
import { GUIDE_RECIPES, groupRecipesByCategory } from "@/lib/guideRecipes";
import { TOPIC_GROUPS } from "@/lib/recipeSuggestions";

const QUALIFIER_REFERENCE: { qualifier: string; meaning: string; example: string }[] = [
  { qualifier: "stars:MIN..MAX", meaning: "Only repos with a star count in this range.", example: "stars:3..250" },
  { qualifier: "language:NAME", meaning: "Only repos whose primary language matches.", example: "language:Rust" },
  { qualifier: "topic:NAME", meaning: "Only repos tagged with this GitHub topic. Adding more than one requires all of them (AND, not OR).", example: "topic:cli topic:tui" },
  { qualifier: "created:>DATE", meaning: "Only repos created after the date. The scanner fills DATE in as 30 days ago automatically.", example: "created:>DATE" },
  { qualifier: "pushed:>DATE", meaning: "Only repos pushed to after the date - good for catching renewed activity on older repos.", example: "pushed:>DATE" },
  { qualifier: "-term", meaning: "Excludes repos whose name/description/README mentions this term. Quote multi-word terms.", example: '-windows -"getting started"' },
];

const RECIPE_TIPS: string[] = [
  "Keep star ranges narrow (roughly 3-300) to filter out repos that are already famous - the goal is catching things early.",
  "Topics stack with AND logic, not OR - two topics narrows results, it doesn't broaden them. Start with one topic per recipe.",
  "created:>DATE surfaces brand-new projects; pushed:>DATE surfaces renewed activity on projects of any age. Pick based on what signal you actually want.",
  "Exclude the platforms you don't care about (windows, macos, ios) to cut down on irrelevant results without extra scanner logic.",
  "If a recipe keeps surfacing noise (tutorials, boilerplate, course repos), add those words to your exclude terms - GitHub's search checks name, description, and README.",
  "Run a handful of narrow recipes instead of one broad one. Narrow recipes are easier to reason about and easier to retire if they stop being useful.",
];

export function GuidePage() {
  const [addedQueries, setAddedQueries] = useState<Record<string, boolean>>({});
  const recipeGroups = groupRecipesByCategory(GUIDE_RECIPES);

  const handleAddGuideRecipe = async (query: string) => {
    try {
      await invoke("add_saved_search", { query });
      setAddedQueries((prev) => ({ ...prev, [query]: true }));
      setTimeout(() => {
        setAddedQueries((prev) => ({ ...prev, [query]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to add guide recipe:", err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Introduction */}
      <section className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-3">
        <h3 className="text-base font-bold text-white">Discovery Guide</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Recipes are GitHub searches the scanner runs on your behalf. Each one below is ready to add to your
          rotation with one click - browse by category, add what looks interesting, and prune anything that stops
          being useful. Want full control over stars, language, topics, or exclusions instead? Head to Tuning &
          Settings and use the recipe builder there.
        </p>
      </section>

      {/* GitHub Search Qualifier Reference */}
      <section className="border border-zinc-800 bg-zinc-950/40 rounded-lg p-6 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          How GitHub Search Qualifiers Work
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono">
                <th className="py-2 pr-4 font-semibold">Qualifier</th>
                <th className="py-2 pr-4 font-semibold">What it does</th>
                <th className="py-2 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {QUALIFIER_REFERENCE.map((row) => (
                <tr key={row.qualifier}>
                  <td className="py-2.5 pr-4 align-top">
                    <code className="text-xs font-mono text-zinc-200 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                      {row.qualifier}
                    </code>
                  </td>
                  <td className="py-2.5 pr-4 align-top text-xs text-zinc-400 leading-relaxed">{row.meaning}</td>
                  <td className="py-2.5 align-top">
                    <code className="text-xs font-mono text-zinc-500">{row.example}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recipe Tips */}
      <section className="border border-zinc-800 bg-zinc-950/40 rounded-lg p-6 space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Tips for Building Better Recipes
        </h4>
        <ul className="space-y-2">
          {RECIPE_TIPS.map((tip) => (
            <li key={tip} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
              <span className="text-zinc-600 shrink-0">-</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Prebuilt Recipes, grouped by category */}
      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Suggested Search Recipes
        </h4>
        <div className="space-y-3">
          {recipeGroups.map(({ category, recipes }) => (
            <details key={category} className="border border-zinc-800 bg-zinc-950/50 rounded-lg group" open>
              <summary className="cursor-pointer select-none list-none px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{category}</span>
                <span className="text-xs text-zinc-500 font-mono">{recipes.length} recipe{recipes.length === 1 ? "" : "s"}</span>
              </summary>
              <div className="px-4 pb-4 space-y-3">
                {recipes.map((recipe) => {
                  const query = serializeRecipeCriteria(recipe.criteria);
                  return (
                    <div
                      key={query}
                      className="border border-zinc-900 bg-zinc-950/60 p-4 rounded-lg flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors duration-150"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">{recipe.label}</div>
                        <p className="text-xs text-zinc-400">{recipe.description}</p>
                        <code className="text-xs text-zinc-400 font-mono block break-all bg-zinc-900/60 px-2 py-1 rounded mt-1.5 border border-zinc-900">
                          {query}
                        </code>
                      </div>
                      <Button
                        onClick={() => handleAddGuideRecipe(query)}
                        variant={addedQueries[query] ? "default" : "secondary"}
                        className={`shrink-0 ${addedQueries[query] ? "bg-emerald-500 text-white hover:bg-emerald-500" : ""}`}
                      >
                        {addedQueries[query] ? "Added! ✓" : "+ Add to Recipes"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Discovery Tags, grouped by category */}
      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Discovery Tags by Category
        </h4>
        <p className="text-xs text-zinc-400">
          Use these as topics when building a recipe in Tuning & Settings to discover niche software categories.
          These are real GitHub topic slugs - not every project uses one, but well-maintained repos usually do.
        </p>
        <div className="space-y-3">
          {TOPIC_GROUPS.map((group) => (
            <details key={group.category} className="border border-zinc-800 bg-zinc-950/40 rounded-lg">
              <summary className="cursor-pointer select-none list-none px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{group.category}</span>
                <span className="text-xs text-zinc-500 font-mono">{group.topics.length} tags</span>
              </summary>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {group.topics.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded hover:border-zinc-700 transition-colors duration-150"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
