# Skakia Browser Extension

Adds an "Analyze in Skakia" button to finished Lichess and Chess.com games. Built with [WXT](https://wxt.dev/), which produces one build per browser from the same source.

The extension is a single content script and uses no extension APIs, so the code is identical in every browser. Only the manifest differs (`wxt.config.ts`).

## Development

```bash
# From the monorepo root
bun install

# From this package: opens a browser with the extension loaded and reloads on changes
bun run dev            # Chrome
bun run dev:firefox    # Firefox
```

Unit tests live next to the source (`src/content/*.spec.ts`) and run with `bun run test:unit` from the monorepo root.

## Building

| Command                 | Output                | Store                                         |
| ----------------------- | --------------------- | --------------------------------------------- |
| `bun run build`         | `.output/chrome-mv3`  | Chrome Web Store (also Brave, Vivaldi, Opera) |
| `bun run build:edge`    | `.output/edge-mv3`    | Microsoft Edge Add-ons                        |
| `bun run build:firefox` | `.output/firefox-mv3` | addons.mozilla.org                            |
| `bun run build:safari`  | `.output/safari-mv3`  | App Store, after wrapping (see below)         |

`bun run zip`, `zip:edge` and `zip:firefox` build and write the upload archive to `.output/`. The Firefox command also writes a `-sources.zip`: addons.mozilla.org asks for the source because the bundle is minified.

To try a build by hand, load the output folder unpacked: `chrome://extensions` → **Developer mode** → **Load unpacked**, or `about:debugging` → **This Firefox** → **Load Temporary Add-on** and pick `manifest.json`.

### Safari

Safari only installs extensions that are wrapped in a macOS app. After `bun run build:safari`:

```bash
xcrun safari-web-extension-converter .output/safari-mv3 --project-location .output/safari-xcode
```

Build and sign the generated Xcode project. Distribution needs an Apple Developer Program membership.

## Releasing

The version comes from `package.json`. The Firefox add-on ID (`browser_specific_settings.gecko.id` in `wxt.config.ts`) cannot change once the first version is uploaded.

## Project structure

```
public/icon/         Extension icons, resized from src-tauri/icons/icon.png
src/
  entrypoints/       WXT entrypoints; content.ts declares the content script and its matches
  content/           Game detection for Lichess and Chess.com, and the floating button
wxt.config.ts        Manifest and per-browser settings
```
