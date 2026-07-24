// Curated suggestion lists shown as <datalist> autocomplete options in the
// recipe builder, and as browsable tag groups in the Scanner Guide. These
// are hints, not constraints - any free text is valid GitHub search syntax
// and will be accepted.

export const COMMON_LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C", "C++",
  "C#", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Shell", "HTML", "CSS",
  "Vue", "Zig", "Lua", "Elixir", "Haskell", "Scala", "Clojure", "R",
  "Objective-C", "Perl", "Nix", "OCaml", "Julia",
];

/** GitHub topic slugs grouped by category, shown as headed sections in the
 * Scanner Guide's tag cloud and offered as autocomplete hints when building
 * a recipe's Topics field. Grouping these makes it much easier to browse
 * for a niche you're curious about instead of scanning one giant flat list. */
export const TOPIC_GROUPS: { category: string; topics: string[] }[] = [
  {
    category: "Developer Tools & CLI",
    topics: [
      "developer-tools", "cli", "tui", "dotfiles", "linter", "formatter",
      "build-tool", "package-manager", "devtools", "productivity-tool",
      "code-generator", "static-analysis",
    ],
  },
  {
    category: "Terminal & Shell",
    topics: [
      "terminal", "terminal-emulator", "shell", "zsh", "bash", "fish-shell",
      "tmux", "neovim", "vim-plugin", "prompt-customization",
    ],
  },
  {
    category: "Self-Hosted & Local-First",
    topics: [
      "self-hosted", "local-first", "homelab", "homeserver", "docker-compose",
      "offline-first", "sync-engine",
    ],
  },
  {
    category: "Desktop Apps",
    topics: [
      "desktop-app", "electron", "tauri", "gtk", "qt", "cross-platform",
      "system-tray", "menu-bar-app",
    ],
  },
  {
    category: "AI & Machine Learning",
    topics: [
      "machine-learning", "llm", "ai-agents", "rag", "embeddings",
      "prompt-engineering", "computer-vision", "nlp", "generative-ai",
      "ollama", "langchain", "fine-tuning", "vector-database",
    ],
  },
  {
    category: "Web & Browser",
    topics: [
      "browser-extension", "chrome-extension", "firefox-extension", "webapp",
      "pwa", "web-components", "userscript", "webassembly",
    ],
  },
  {
    category: "Data & Visualization",
    topics: [
      "data-visualization", "dashboard", "charting-library", "analytics",
      "data-engineering", "etl", "observability", "data-pipeline",
    ],
  },
  {
    category: "Notes & Productivity",
    topics: [
      "markdown", "note-taking", "pkm", "task-management", "knowledge-base",
      "obsidian-plugin", "zettelkasten", "todo-list", "second-brain",
    ],
  },
  {
    category: "DevOps & Infrastructure",
    topics: [
      "kubernetes", "infrastructure-as-code", "ci-cd", "monitoring",
      "terraform", "docker", "gitops", "deployment", "iac",
    ],
  },
  {
    category: "Security & Privacy",
    topics: [
      "security-tools", "encryption", "privacy", "pentesting", "oauth",
      "authentication", "secrets-management", "vulnerability-scanner",
    ],
  },
  {
    category: "Games & Creative Coding",
    topics: [
      "game-dev", "godot", "gamedev", "generative-art", "creative-coding",
      "procedural-generation", "pixel-art", "game-engine",
    ],
  },
  {
    category: "Mobile",
    topics: [
      "android", "ios", "flutter", "react-native", "kotlin-multiplatform",
      "mobile-app",
    ],
  },
  {
    category: "APIs & Backend",
    topics: [
      "rest-api", "graphql", "microservices", "serverless", "websocket",
      "grpc", "api-gateway",
    ],
  },
  {
    category: "Design & UI",
    topics: [
      "design-system", "ui-components", "css-framework", "animation",
      "accessibility", "icon-library", "component-library",
    ],
  },
];

/** Flat list of every topic above, used for the ChipInput autocomplete
 * datalist in the Recipe Builder (keeps that one source of truth). */
export const SUGGESTED_TOPICS = TOPIC_GROUPS.flatMap((group) => group.topics);

export const COMMON_EXCLUDE_TERMS = [
  "windows", "macos", "osx", "linux", "ios", "android",
  "tutorial", "awesome-list", "course", "bootcamp",
  "interview-questions", "algorithm", "leetcode", "boilerplate",
  "deprecated", "archived", "example", "demo", "template", "starter",
  "sample", "playground", "clone", "hackathon", "coursework", "homework",
  "wrapper", "test-repo",
];
