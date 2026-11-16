export const REPOSITORY_URL = "https://github.com/flys1ck/skakia";
export const RELEASES_URL = `${REPOSITORY_URL}/releases/latest`;
const LATEST_RELEASE_API_URL = "https://api.github.com/repos/flys1ck/skakia/releases/latest";

export type Platform = "macos" | "windows" | "linux";

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface Installer {
  platform: Platform;
  label: string;
  url: string;
}

export interface Release {
  version: string | null;
  installers: Installer[];
  primary: Record<Platform, string>;
}

interface InstallerKind {
  platform: Platform;
  matches: (name: string) => boolean;
  label: (name: string) => string;
  isPrimary: (name: string) => boolean;
}

const isAppleSilicon = (name: string) => /aarch64|arm64/i.test(name);
const isIntel = (name: string) => /x64|x86_64|amd64/i.test(name);

// Order here is the order installers are listed in, and the first primary match per platform wins.
const INSTALLER_KINDS: InstallerKind[] = [
  {
    platform: "macos",
    matches: (name) => name.endsWith(".dmg") && isAppleSilicon(name),
    label: () => "macOS · Apple Silicon",
    isPrimary: () => true,
  },
  {
    platform: "macos",
    matches: (name) => name.endsWith(".dmg"),
    label: (name) => (isIntel(name) ? "macOS · Intel" : "macOS"),
    isPrimary: () => true,
  },
  {
    platform: "windows",
    matches: (name) => name.endsWith(".exe"),
    label: () => "Windows · Installer",
    isPrimary: () => true,
  },
  {
    platform: "windows",
    matches: (name) => name.endsWith(".msi"),
    label: () => "Windows · MSI",
    isPrimary: () => false,
  },
  {
    platform: "linux",
    matches: (name) => name.endsWith(".AppImage"),
    label: () => "Linux · AppImage",
    isPrimary: () => true,
  },
  {
    platform: "linux",
    matches: (name) => name.endsWith(".deb"),
    label: () => "Linux · .deb",
    isPrimary: () => false,
  },
  {
    platform: "linux",
    matches: (name) => name.endsWith(".rpm"),
    label: () => "Linux · .rpm",
    isPrimary: () => false,
  },
];

export function mapAssets(assets: ReleaseAsset[]): Pick<Release, "installers" | "primary"> {
  const installers: Installer[] = [];
  const primary: Partial<Record<Platform, string>> = {};
  const unclaimed = new Set(assets);

  for (const kind of INSTALLER_KINDS) {
    for (const asset of unclaimed) {
      if (!kind.matches(asset.name)) continue;
      unclaimed.delete(asset);
      installers.push({ platform: kind.platform, label: kind.label(asset.name), url: asset.browser_download_url });
      if (kind.isPrimary(asset.name)) primary[kind.platform] ??= asset.browser_download_url;
    }
  }

  return {
    installers,
    primary: {
      macos: primary.macos ?? RELEASES_URL,
      windows: primary.windows ?? RELEASES_URL,
      linux: primary.linux ?? RELEASES_URL,
    },
  };
}

const FALLBACK_RELEASE: Release = { version: null, ...mapAssets([]) };

export async function fetchLatestRelease(): Promise<Release> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const response = await fetch(LATEST_RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
    const release = (await response.json()) as { tag_name?: string; assets?: ReleaseAsset[] };
    return { version: release.tag_name ?? null, ...mapAssets(release.assets ?? []) };
  } catch (error) {
    console.warn(`Could not load the latest release, linking to ${RELEASES_URL} instead.`, error);
    return FALLBACK_RELEASE;
  }
}
