import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SettingsPage } from "@/components/SettingsPage";
import { GuidePage } from "@/components/GuidePage";
import { RepoCard } from "@/components/RepoCard";
import { BulkActionBar } from "@/components/BulkActionBar";
import type { Repo, CollectionCount } from "@/types";

export default function App() {
  const [activeCollection, setActiveCollection] = useState("Inbox");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Idle");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [collections, setCollections] = useState<CollectionCount[]>([
    { name: "Inbox", count: 0 },
    { name: "Gems", count: 0 },
    { name: "Tools to Try", count: 0 },
    { name: "Skipped", count: 0 },
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchCollections = async () => {
    try {
      const counts = await invoke<CollectionCount[]>("get_collection_counts");
      setCollections(counts);
    } catch (err) {
      console.error("Failed to fetch collection counts:", err);
    }
  };

  const fetchRepos = async (collection: string) => {
    try {
      const data = await invoke<Repo[]>("get_repos", { collection });
      setRepos(data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    }
  };

  useEffect(() => {
    fetchCollections();
    setSelectedIds(new Set());
    if (activeCollection !== "Settings" && activeCollection !== "Guide") {
      fetchRepos(activeCollection);
    }
  }, [activeCollection]);

  const handleAction = async (repoId: string, action: string) => {
    try {
      await invoke("perform_repo_action", { repoId, action });
      fetchCollections();
      fetchRepos(activeCollection);
    } catch (err) {
      console.error("Failed to perform action:", err);
    }
  };

  const toggleSelect = (repoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === repos.length ? new Set() : new Set(repos.map((r) => r.id))
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    try {
      await invoke("bulk_repo_action", { repoIds: Array.from(selectedIds), action });
      setSelectedIds(new Set());
      fetchCollections();
      fetchRepos(activeCollection);
    } catch (err) {
      console.error("Failed to perform bulk action:", err);
    }
  };

  async function handleScan() {
    setIsScanning(true);
    setScanStatus("Scanning GitHub...");
    try {
      const res = await invoke<string>("scan_now");
      setScanStatus(res);
      fetchCollections();
      if (activeCollection !== "Settings" && activeCollection !== "Guide") {
        fetchRepos(activeCollection);
      }
    } catch (err) {
      console.error(err);
      setScanStatus("Scan failed: " + err);
    } finally {
      setIsScanning(false);
    }
  }

  const handleClearSkipped = async () => {
    try {
      await invoke("clear_skipped_repos");
      fetchCollections();
      if (activeCollection === "Skipped") {
        fetchRepos("Skipped");
      }
    } catch (err) {
      console.error("Failed to clear skipped list:", err);
    }
  };

  const handleClearInbox = async () => {
    try {
      await invoke("clear_inbox_repos");
      fetchCollections();
      if (activeCollection === "Inbox") {
        fetchRepos("Inbox");
      }
    } catch (err) {
      console.error("Failed to clear inbox list:", err);
    }
  };

  const handleOpenRepo = async (repoId: string) => {
    try {
      await invoke("open_in_browser", { url: `https://github.com/${repoId}` });
    } catch (err) {
      console.error("Failed to open repository in browser:", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#27272a] bg-[#0d0d0d] flex flex-col">
        <div className="p-6 border-b border-[#27272a]">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span>Gem</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Open Source Discovery Scanner</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Collections
          </div>
          {collections.map((col) => (
            <button
              key={col.name}
              onClick={() => setActiveCollection(col.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                activeCollection === col.name
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <span>{col.name}</span>
              <span className="text-xs text-zinc-500 px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                {col.count}
              </span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-[#27272a] space-y-1">
            <button
              onClick={() => setActiveCollection("Guide")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                activeCollection === "Guide"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Scanner Guide</span>
            </button>

            <button
              onClick={() => setActiveCollection("Settings")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                activeCollection === "Settings"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Tuning & Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 flex items-center justify-center gap-2 ${
              isScanning
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-4 w-4 text-zinc-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Scanning...</span>
              </>
            ) : (
              <span>Scan Now</span>
            )}
          </button>
          <div className="text-[10px] text-zinc-500 mt-2 text-center truncate">
            Status: {scanStatus}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-grid-pattern overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-[#27272a] px-8 flex items-center justify-between bg-[#121212]/80 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-zinc-200">
            {activeCollection === "Guide" ? "Discovery Guide & Recipes" : activeCollection}
          </h2>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            {activeCollection === "Inbox" && repos.length > 0 && (
              <button
                onClick={handleClearInbox}
                className="px-3 py-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-900/60 font-semibold transition-colors duration-150 text-xs"
              >
                Clear Inbox
              </button>
            )}
            {activeCollection === "Skipped" && repos.length > 0 && (
              <button
                onClick={handleClearSkipped}
                className="px-3 py-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-900/60 font-semibold transition-colors duration-150 text-xs"
              >
                Clear Skipped List
              </button>
            )}
            <span>Scanner Connected</span>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto w-full">
            
            {activeCollection === "Guide" ? (
              <GuidePage />
            ) : activeCollection === "Settings" ? (
              <SettingsPage />
            ) : (
              /* Repos Feed View */
              <div className="space-y-4">
                {repos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 border border-zinc-800 border-dashed rounded-lg bg-zinc-950/20 text-zinc-500">
                    <span className="text-sm">No repositories in this collection</span>
                    <p className="text-xs text-zinc-600 mt-1">Gems found during scans will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === repos.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                        />
                        Select all ({repos.length})
                      </label>
                    </div>

                    <BulkActionBar
                      selectedCount={selectedIds.size}
                      activeCollection={activeCollection}
                      onMove={(collection) => handleBulkAction(collection)}
                      onDelete={() => handleBulkAction("delete")}
                      onClear={() => setSelectedIds(new Set())}
                    />

                    <div className="space-y-6">
                      {repos.map((repo) => (
                        <RepoCard
                          key={repo.id}
                          repo={repo}
                          activeCollection={activeCollection}
                          selected={selectedIds.has(repo.id)}
                          onToggleSelect={toggleSelect}
                          onAction={handleAction}
                          onOpenRepo={handleOpenRepo}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
