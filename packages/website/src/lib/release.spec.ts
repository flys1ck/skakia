import { describe, expect, it } from "vitest";
import { mapAssets, RELEASES_URL } from "./release";

const BASE = "https://github.com/flys1ck/skakia/releases/download/v0.1.1";
const asset = (name: string) => ({ name, browser_download_url: `${BASE}/${name}` });

const RELEASE_ASSETS = [
  "latest.json",
  "OpenChess-0.1.1-1.x86_64.rpm",
  "OpenChess-0.1.1-1.x86_64.rpm.sig",
  "OpenChess_0.1.1_aarch64.app.tar.gz",
  "OpenChess_0.1.1_aarch64.app.tar.gz.sig",
  "OpenChess_0.1.1_x64.dmg",
  "OpenChess_0.1.1_aarch64.dmg",
  "OpenChess_0.1.1_amd64.AppImage",
  "OpenChess_0.1.1_amd64.AppImage.sig",
  "OpenChess_0.1.1_amd64.AppImage.tar.gz",
  "OpenChess_0.1.1_amd64.AppImage.tar.gz.sig",
  "OpenChess_0.1.1_amd64.deb",
  "OpenChess_0.1.1_amd64.deb.sig",
  "OpenChess_0.1.1_x64-setup.exe",
  "OpenChess_0.1.1_x64-setup.exe.sig",
  "OpenChess_0.1.1_x64-setup.nsis.zip",
  "OpenChess_0.1.1_x64_en-US.msi",
  "OpenChess_0.1.1_x64_en-US.msi.sig",
].map(asset);

describe("mapAssets", () => {
  it("lists installers by platform and skips updater files", () => {
    const { installers } = mapAssets(RELEASE_ASSETS);

    expect(installers.map(({ label, url }) => [label, url.replace(`${BASE}/`, "")])).toEqual([
      ["macOS · Apple Silicon", "OpenChess_0.1.1_aarch64.dmg"],
      ["macOS · Intel", "OpenChess_0.1.1_x64.dmg"],
      ["Windows · Installer", "OpenChess_0.1.1_x64-setup.exe"],
      ["Windows · MSI", "OpenChess_0.1.1_x64_en-US.msi"],
      ["Linux · AppImage", "OpenChess_0.1.1_amd64.AppImage"],
      ["Linux · .deb", "OpenChess_0.1.1_amd64.deb"],
      ["Linux · .rpm", "OpenChess-0.1.1-1.x86_64.rpm"],
    ]);
  });

  it("picks the Apple Silicon dmg, the exe and the AppImage as primary downloads", () => {
    expect(mapAssets(RELEASE_ASSETS).primary).toEqual({
      macos: `${BASE}/OpenChess_0.1.1_aarch64.dmg`,
      windows: `${BASE}/OpenChess_0.1.1_x64-setup.exe`,
      linux: `${BASE}/OpenChess_0.1.1_amd64.AppImage`,
    });
  });

  it("labels a dmg without an architecture in its name as plain macOS", () => {
    expect(mapAssets([asset("Skakia.dmg")]).installers).toEqual([
      { platform: "macos", label: "macOS", url: `${BASE}/Skakia.dmg` },
    ]);
  });

  it("falls back to the releases page for platforms without a primary installer", () => {
    const { primary } = mapAssets([asset("Skakia_1.0.0_x64_en-US.msi"), asset("Skakia_1.0.0_amd64.deb")]);

    expect(primary).toEqual({ macos: RELEASES_URL, windows: RELEASES_URL, linux: RELEASES_URL });
  });
});
