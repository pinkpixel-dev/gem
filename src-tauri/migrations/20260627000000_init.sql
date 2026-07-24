-- Create tables
CREATE TABLE IF NOT EXISTS repos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    description TEXT,
    primary_language TEXT,
    stars INTEGER NOT NULL,
    forks INTEGER NOT NULL,
    open_issues INTEGER NOT NULL,
    pushed_at TEXT,
    created_at TEXT,
    homepage TEXT,
    latest_release_name TEXT,
    latest_release_published_at TEXT,
    why_surfaced TEXT,
    score INTEGER DEFAULT 0,
    collection TEXT DEFAULT 'Inbox',
    scanned_at TEXT NOT NULL,
    has_readme INTEGER DEFAULT 0,
    has_homepage INTEGER DEFAULT 0,
    has_release INTEGER DEFAULT 0,
    star_growth_7d INTEGER DEFAULT 0,
    fork_growth_7d INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS saved_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL UNIQUE,
    last_scanned_at TEXT
);

CREATE TABLE IF NOT EXISTS repo_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_type TEXT NOT NULL,
    key_name TEXT NOT NULL,
    weight INTEGER NOT NULL,
    UNIQUE(key_type, key_name)
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Seed default saved searches
INSERT OR IGNORE INTO saved_searches (query) VALUES 
('stars:3..250 language:TypeScript'),
('stars:3..250 language:Go'),
('stars:3..250 language:Rust'),
('stars:5..400 topic:developer-tools'),
('stars:3..300 topic:cli'),
('stars:3..300 topic:terminal'),
('stars:3..300 topic:desktop-app'),
('stars:3..300 topic:local-first'),
('stars:3..300 topic:markdown');

-- Seed default topic/language/keyword preference weights
INSERT OR IGNORE INTO preferences (key_type, key_name, weight) VALUES
('topic', 'developer-tools', 9),
('topic', 'terminal', 8),
('topic', 'cli', 7),
('topic', 'markdown', 7),
('topic', 'local-first', 6),
('language', 'typescript', 6),
('language', 'go', 6),
('language', 'rust', 6),
('keyword', 'wrapper', -8),
('keyword', 'starter', -5),
('keyword', 'boilerplate', -5),
('topic', 'ai', -2);
