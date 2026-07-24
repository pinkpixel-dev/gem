import type { RecipeCriteria } from "@/lib/recipeQuery";

export interface GuideRecipe {
  label: string;
  category: string;
  /** Short explanation of what this recipe surfaces and why it's useful. */
  description: string;
  criteria: RecipeCriteria;
}

/** Prebuilt search recipes shown in the Scanner Guide, one click away from
 * being added to your rotation. Grouped by category so it's easy to browse
 * for a niche instead of scrolling one long undifferentiated list. Feel
 * free to use these as a starting point - duplicate one in Tuning &
 * Settings and tweak the stars range, language, or topics to match what
 * you're actually after. */
export const GUIDE_RECIPES: GuideRecipe[] = [
  // Languages & Frameworks
  {
    label: "Fresh TypeScript Repos",
    category: "Languages & Frameworks",
    description: "Brand new TypeScript projects before they show up anywhere else.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, language: "TypeScript", topics: [], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Fresh Go Repos",
    category: "Languages & Frameworks",
    description: "Newly created Go projects, filtered down to Linux-relevant results.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, language: "Go", topics: [], excludeTerms: ["windows", "macos"], rawExtra: "" },
  },
  {
    label: "Fresh Rust Repos",
    category: "Languages & Frameworks",
    description: "Newly created Rust projects, filtered down to Linux-relevant results.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, language: "Rust", topics: [], excludeTerms: ["windows", "macos"], rawExtra: "" },
  },
  {
    label: "Fresh Python Repos",
    category: "Languages & Frameworks",
    description: "New Python projects, before the tutorial/bootcamp noise takes over.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, language: "Python", topics: [], excludeTerms: ["tutorial", "bootcamp", "course"], rawExtra: "" },
  },

  // Developer Tools & CLI
  {
    label: "Linux CLI Tools",
    category: "Developer Tools & CLI",
    description: "Command-line tools, filtered to exclude Windows/macOS-only projects.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["cli"], excludeTerms: ["windows", "macos", "osx"], rawExtra: "" },
  },
  {
    label: "Terminal Applications",
    category: "Developer Tools & CLI",
    description: "TUI/terminal apps - dashboards, file managers, monitors, and the like.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["terminal"], excludeTerms: ["windows"], rawExtra: "" },
  },
  {
    label: "Developer Tooling & Utilities",
    category: "Developer Tools & CLI",
    description: "General-purpose dev tools with recent activity - linters, generators, build helpers.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 5, starsMax: 400, topics: ["developer-tools"], excludeTerms: ["windows", "macos", "osx"], rawExtra: "" },
  },
  {
    label: "Dotfiles & Shell Setups",
    category: "Developer Tools & CLI",
    description: "Personal dotfiles/shell configs worth stealing ideas from.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 200, topics: ["dotfiles"], excludeTerms: [], rawExtra: "" },
  },

  // Self-Hosted & Local-First
  {
    label: "Self-Hosted Services",
    category: "Self-Hosted & Local-First",
    description: "Things you can run on your own server instead of a SaaS subscription.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["self-hosted"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Local-First Software",
    category: "Self-Hosted & Local-First",
    description: "Apps that work offline-first and sync later, instead of cloud-only.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["local-first"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Homelab Tools",
    category: "Self-Hosted & Local-First",
    description: "Tools built for home server / homelab setups.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["homelab"], excludeTerms: [], rawExtra: "" },
  },

  // Desktop Apps
  {
    label: "Desktop Applications",
    category: "Desktop Apps",
    description: "General cross-platform desktop apps, excluding Windows-only builds.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["desktop-app"], excludeTerms: ["windows"], rawExtra: "" },
  },
  {
    label: "Tauri Desktop Apps",
    category: "Desktop Apps",
    description: "Apps built with Tauri - small, fast, Rust-backed desktop apps like this one.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["tauri"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Electron Desktop Apps",
    category: "Desktop Apps",
    description: "Apps built with Electron, filtered clear of boilerplate starter kits.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["electron"], excludeTerms: ["boilerplate", "starter"], rawExtra: "" },
  },

  // AI & Machine Learning
  {
    label: "AI Agent & LLM Tooling",
    category: "AI & Machine Learning",
    description: "Agent frameworks and LLM tooling, filtered clear of thin API wrappers.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 400, topics: ["ai-agents"], excludeTerms: ["wrapper", "boilerplate"], rawExtra: "" },
  },
  {
    label: "Local LLM & Ollama Tools",
    category: "AI & Machine Learning",
    description: "Tools built around running models locally instead of calling a hosted API.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["ollama"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "RAG & Embeddings Tools",
    category: "AI & Machine Learning",
    description: "Retrieval-augmented generation and embeddings/vector-search projects.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, topics: ["rag"], excludeTerms: [], rawExtra: "" },
  },

  // Web & Browser
  {
    label: "Browser Extensions",
    category: "Web & Browser",
    description: "New browser extensions across Chrome/Firefox-compatible manifest formats.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, topics: ["browser-extension"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Progressive Web Apps",
    category: "Web & Browser",
    description: "PWA projects - installable, offline-capable web apps.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, topics: ["pwa"], excludeTerms: [], rawExtra: "" },
  },

  // Data & Visualization
  {
    label: "Data Visualization Libraries",
    category: "Data & Visualization",
    description: "Charting and visualization libraries/tools.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["data-visualization"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Dashboard & Analytics Tools",
    category: "Data & Visualization",
    description: "Self-buildable dashboards and lightweight analytics tools.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["dashboard"], excludeTerms: [], rawExtra: "" },
  },

  // Notes & Productivity
  {
    label: "Markdown Ecosystem Utilities",
    category: "Notes & Productivity",
    description: "Editors, converters, and tools built around Markdown.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["markdown"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Note-Taking & PKM Tools",
    category: "Notes & Productivity",
    description: "Personal knowledge management and note-taking apps.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["note-taking"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Obsidian Plugins",
    category: "Notes & Productivity",
    description: "Community plugins for Obsidian - a good pulse check on that ecosystem.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 150, topics: ["obsidian-plugin"], excludeTerms: [], rawExtra: "" },
  },

  // DevOps & Infrastructure
  {
    label: "Kubernetes Tooling",
    category: "DevOps & Infrastructure",
    description: "Tools and operators built around Kubernetes.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 5, starsMax: 400, topics: ["kubernetes"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "CI/CD & Automation Tools",
    category: "DevOps & Infrastructure",
    description: "Pipeline and automation tooling for build/deploy workflows.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 3, starsMax: 300, topics: ["ci-cd"], excludeTerms: [], rawExtra: "" },
  },

  // Security & Privacy
  {
    label: "Security & Privacy Tools",
    category: "Security & Privacy",
    description: "Security tooling - scanners, hardening scripts, privacy utilities.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["security-tools"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Encryption & Secrets Tools",
    category: "Security & Privacy",
    description: "Encryption utilities and secrets-management tools.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, topics: ["encryption"], excludeTerms: [], rawExtra: "" },
  },

  // Games & Creative Coding
  {
    label: "Godot Game Projects",
    category: "Games & Creative Coding",
    description: "Games and tools built with the Godot engine.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["godot"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "Generative & Creative Coding",
    category: "Games & Creative Coding",
    description: "Generative art, shaders, and creative-coding experiments.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 250, topics: ["generative-art"], excludeTerms: [], rawExtra: "" },
  },

  // Mobile
  {
    label: "Flutter Apps & Packages",
    category: "Mobile",
    description: "Flutter apps and pub.dev-style packages.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["flutter"], excludeTerms: [], rawExtra: "" },
  },
  {
    label: "React Native Libraries",
    category: "Mobile",
    description: "React Native components and libraries.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 3, starsMax: 300, topics: ["react-native"], excludeTerms: [], rawExtra: "" },
  },

  // Niche & Personal Discovery
  {
    label: "One-Person Wonders",
    category: "Niche & Personal Discovery",
    description: "Very early, low-star projects - the stuff nobody has found yet. Expect noise, but this is where the real hidden gems are.",
    criteria: { dateQualifier: { field: "created", days: 30 }, starsMin: 1, starsMax: 20, topics: [], excludeTerms: ["tutorial", "template", "boilerplate"], rawExtra: "" },
  },
  {
    label: "Quietly Shipping (Renewed Momentum)",
    category: "Niche & Personal Discovery",
    description: "Not new, but recently active again - projects with a pulse after a quiet stretch.",
    criteria: { dateQualifier: { field: "pushed", days: 30 }, starsMin: 50, starsMax: 2000, topics: [], excludeTerms: ["archived"], rawExtra: "" },
  },
];

/** Groups GUIDE_RECIPES by category, preserving the array's category order. */
export function groupRecipesByCategory(recipes: GuideRecipe[]): { category: string; recipes: GuideRecipe[] }[] {
  const order: string[] = [];
  const byCategory = new Map<string, GuideRecipe[]>();

  for (const recipe of recipes) {
    if (!byCategory.has(recipe.category)) {
      byCategory.set(recipe.category, []);
      order.push(recipe.category);
    }
    byCategory.get(recipe.category)!.push(recipe);
  }

  return order.map((category) => ({ category, recipes: byCategory.get(category)! }));
}
