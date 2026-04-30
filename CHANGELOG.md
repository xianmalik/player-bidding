# Changelog

## [Unreleased]

### Added
- **Side swap** — After game 1 in a series, a "Swap" button appears in the game controls. Toggling it visually swaps both team names and pick/ban slots between blue and red sides without modifying any underlying data arrays. Swap state is persisted per game in the draft save.
- **Fearless draft series** — Multi-game support with up to 5 games (BO5). Champions picked in previous games are fearless-banned for subsequent games.
- **Fearless badge in draft list** — Fearless drafts show an amber `⚔ G{n}` badge in the My Drafts modal indicating the mode and number of games played.
- **App favicon** — `arena-draft-logo.png` is used as the site favicon via Next.js app router `icon.png`.
- **Next.js metadata** — Added `title: "ArenaDraft"` and `description` to the root layout for browser tab and SEO.

### Changed
- **App name** — Renamed from "Champion Draft" / "player-bidding" to **ArenaDraft** across the header, page metadata, and `package.json`.
- **App logo** — Header now uses `arena-draft-logo.png` instead of the gradient sword icon box. Logo size increased to 48px mobile / 64px desktop.
- **Fearless icon** — Replaced `Shield` with `Swords` across all fearless-related UI: toggle button, "Proceed" button, fearless-banned champion overlay, and the My Drafts modal.
- **Fearless history thumbnails** — Rearranged from a single column to a 2-row-first, column-overflow grid (`grid-rows-2 grid-flow-col`). Removed amber overlay; thumbnails now use neutral grayscale styling matching the ban slots. Game label font size increased for readability.
- **Draft list shows latest game** — The My Drafts modal now displays picks from the most recent game in a fearless series instead of always showing game 1.
- **Save navigates to draft URL** — After saving a new draft, the URL silently updates to `/?draft=<id>` via `history.pushState` without reloading the UI.
- **Save no longer copies link** — Clipboard copy on save was removed. Use "Copy Link" in the dropdown instead.
- **Max games capped at 5** — Series limited to a maximum of 5 games (BO5).
- **`canAddNextGame` checks last game** — The gate for adding the next game now checks whether the last game in the series has picks, not the currently viewed game tab.

### Fixed
- **Could not navigate to game 3+** — `canAddNextGame` was checking the currently viewed game's picks rather than the last game's picks, causing the add-game button to be incorrectly disabled when browsing an earlier game tab.
