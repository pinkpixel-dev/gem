CREATE TABLE IF NOT EXISTS repo_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_id TEXT NOT NULL,
    stars INTEGER NOT NULL,
    forks INTEGER NOT NULL,
    open_issues INTEGER NOT NULL,
    pushed_at TEXT,
    scanned_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_repo_scanned ON repo_snapshots(repo_id, scanned_at);
