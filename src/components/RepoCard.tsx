import type { Repo } from "@/types";

interface RepoCardProps {
  repo: Repo;
  activeCollection: string;
  selected: boolean;
  onToggleSelect: (repoId: string) => void;
  onAction: (repoId: string, action: string) => void;
  onOpenRepo: (repoId: string) => void;
}

export function RepoCard({ repo, activeCollection, selected, onToggleSelect, onAction, onOpenRepo }: RepoCardProps) {
  return (
    <div
      className={`border bg-zinc-950/80 backdrop-blur-sm rounded-lg p-6 space-y-4 transition-all duration-200 ${
        selected ? "border-zinc-600" : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(repo.id)}
          aria-label={`Select ${repo.owner}/${repo.name}`}
          className="mt-1.5 h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        />
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div onClick={() => onOpenRepo(repo.id)} className="cursor-pointer group min-w-0">
              <span className="text-xs text-zinc-400 font-mono group-hover:text-zinc-300">{repo.owner} / </span>
              <h3 className="text-lg font-bold text-white mt-0.5 group-hover:underline break-words">
                {repo.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                Score: {repo.score}
              </span>
              {repo.primaryLanguage && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {repo.primaryLanguage}
                </span>
              )}
            </div>
          </div>

          {repo.description && (
            <p className="text-sm text-zinc-300">{repo.description}</p>
          )}

          {repo.whySurfaced && (
            <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-3 rounded border border-zinc-900/80 font-mono whitespace-pre-line leading-relaxed">
              <span className="text-zinc-500 block mb-1">Why this surfaced:</span>
              {repo.whySurfaced}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span>⭐ {repo.stars} stars</span>
              {repo.pushedAt && (
                <span>pushed {new Date(repo.pushedAt).toLocaleDateString()}</span>
              )}
            </div>
            {activeCollection === "Inbox" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onAction(repo.id, "maybe")}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-white transition-colors duration-150 text-xs"
                >
                  Maybe
                </button>
                <button
                  onClick={() => onAction(repo.id, "skip")}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-white transition-colors duration-150 text-xs"
                >
                  Skip
                </button>
                <button
                  onClick={() => onAction(repo.id, "save")}
                  className="px-3 py-1.5 rounded bg-white text-black hover:bg-zinc-200 font-medium transition-colors duration-150 text-xs"
                >
                  Save Gem
                </button>
                <button
                  onClick={() => onAction(repo.id, "delete")}
                  className="px-3 py-1.5 rounded bg-zinc-900/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 transition-colors duration-150 flex items-center gap-1 text-xs"
                  title="Remove completely"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider font-mono">Move to:</span>
                  <select
                    value={activeCollection}
                    onChange={(e) => onAction(repo.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="Inbox">Inbox</option>
                    <option value="Gems">Gems</option>
                    <option value="Tools to Try">Tools to Try</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                </div>

                <button
                  onClick={() => onAction(repo.id, "delete")}
                  className="px-2.5 py-1.5 rounded bg-zinc-900/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 transition-colors duration-150 flex items-center gap-1 text-xs"
                  title="Delete/Hide forever"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
