const ALL_COLLECTIONS = ["Inbox", "Gems", "Tools to Try", "Skipped"];

interface BulkActionBarProps {
  selectedCount: number;
  activeCollection: string;
  onMove: (collection: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, activeCollection, onMove, onDelete, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const targets = ALL_COLLECTIONS.filter((c) => c !== activeCollection);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm shadow-lg">
      <span className="text-xs font-semibold text-zinc-200">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider font-mono hidden sm:inline">
          Move to:
        </span>
        {targets.map((c) => (
          <button
            key={c}
            onClick={() => onMove(c)}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors duration-150 text-xs font-medium"
          >
            {c}
          </button>
        ))}
        <button
          onClick={onDelete}
          className="px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/60 transition-colors duration-150 text-xs font-semibold"
        >
          Trash
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 transition-colors duration-150 text-xs"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}
