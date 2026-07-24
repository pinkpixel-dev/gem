# Gem

<p align="center">
  <img src="./icon.png" alt=Logo" width="300" />
</p>

Gem is a desktop app that scans GitHub for small, active, well-made repositories. It's built to run locally, save the projects worth paying attention to, and skip the noise.

## Why I made this

I come across great projects sometimes, usually by accident. GitHub's trending page only shows what's already popular, and searching on Github can be a pain. This tool scans using search criteria you choose, and keeps everything sorted into a few simple categories.

It's opinionated toward the kind of projects I'm personally interested in, but the search recipes and scoring weights are all yours to change.

## Features

- **Recipe-based scanning**: Set up rotating GitHub searches (stars range, language, topic, recency, excluded keywords) and the scanner runs them for you, pulling in small, recently active repos instead of the same tired top-100 lists.
- **Recipe Builder**: Build and edit those searches through a form - dropdowns, chip inputs for topics/exclusions, a live preview of the generated query - so you don't need to memorize GitHub's search qualifier syntax (`stars:3..250 language:Rust -windows -macos` and so on).
- **Taste tuning**: Adjust scoring weights per topic, language, or description keyword. Save something and its topics score higher next time; skip it and they score lower - or set weights manually if you'd rather do it by hand.
- **Collections**: Repos land in Inbox, then you move them to Gems, Tools to Try, or Skipped. Nothing you've already triaged reappears in Inbox on the next scan.
- **Bulk actions**: Select multiple repos at once and move them all to a collection - or trash them - in one shot instead of clicking through each one.
- **Discovery Guide**: A big, categorized set of prebuilt search recipes (languages, dev tools, self-hosted, AI/ML, mobile, games, and more) plus a reference for GitHub's search qualifiers - drop any recipe into your rotation with one click.
- **Local-first**: Everything - repo history, your recipes, your taste weights - lives in a SQLite database on your machine at `~/.gem/scanner.db`. No account, no server, no syncing.

## Tech stack

- **Frontend**: React + TypeScript + Vite, styled with Tailwind CSS v4 and shadcn/ui.
- **Backend**: Tauri v2 + Rust. `reqwest` talks to the GitHub REST API, `sqlx` handles the SQLite queries, `tokio` runs the scan loop.
- **Database**: SQLite, initialized and migrated automatically on first launch.

## Getting started

Grab the latest AppImage from [Releases](https://github.com/pinkpixel-dev/gem/releases), then:

```bash
chmod +x gem_*.AppImage
./gem_*.AppImage
```

On first launch, Gem creates its SQLite database at `~/.gem/scanner.db`. Head to Settings and add a GitHub personal access token to raise your search rate limits (unauthenticated requests are heavily throttled by GitHub's API) - a token with no special scopes is enough for public repo search.

## Development

**Prerequisites**

- [Node.js](https://nodejs.org/) 18+ and npm
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS (webview/system deps)

**Setup**

```bash
git clone https://github.com/pinkpixel-dev/gem.git
cd gem
npm install
```

**Run in dev mode** (hot-reloads the frontend, rebuilds Rust on change)

```bash
npm run tauri dev
```

**Build a release bundle (Linux)**

```bash
npm run tauri build
```

This produces an AppImage, a `.deb`, and a `.rpm`, written to `src-tauri/target/release/bundle/{appimage,deb,rpm}/`. Building the `.deb` requires `dpkg-deb` and the `.rpm` requires `rpmbuild` to be installed on your machine. If you hit stripping-related segfaults on the built binary, build with `NO_STRIP=true npm run tauri build` instead.

**Build a Windows installer**

Windows builds run in CI, not locally. Trigger the "Windows Build" workflow manually from the Actions tab (or `gh workflow run windows-build.yml`) - it builds the NSIS `.exe` and attaches it as a downloadable run artifact.

**Useful scripts**

- `npm run dev` - Vite dev server only (frontend)
- `npm run build` - type-check and build the frontend
- `npm run tauri` - passthrough to the Tauri CLI

Optionally set a `GITHUB_TOKEN` environment variable during development to avoid GitHub API rate limits - it takes priority over the token stored in Settings.

## License

Apache 2.0 - see [LICENSE](LICENSE).

---

*Made with 💖 by Pink Pixel • [pinkpixel.dev](https://pinkpixel.dev)*
