export type AssetDomain = "character" | "scene" | "prop" | "ui" | "vfx";

export const DEFAULT_ASSET_DOMAIN: AssetDomain = "character";

export const ASSET_DOMAIN_ORDER: AssetDomain[] = [
  "character",
  "scene",
  "prop",
  "ui",
  "vfx",
];

export const ASSET_DOMAIN_LABELS: Record<AssetDomain, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  ui: "UI",
  vfx: "VFX",
};

/** Domains that can browse projects and create new ones. */
export const ASSET_DOMAIN_ENABLED: Record<AssetDomain, boolean> = {
  character: true,
  scene: true,
  prop: false,
  ui: false,
  vfx: false,
};

/** Domains shown greyed out and not selectable in the tab bar. */
export const ASSET_DOMAIN_LOCKED: Record<AssetDomain, boolean> = {
  character: false,
  scene: false,
  prop: true,
  ui: true,
  vfx: true,
};

export function normalizeAssetDomain(value: unknown): AssetDomain {
  if (
    value === "character" ||
    value === "scene" ||
    value === "prop" ||
    value === "ui" ||
    value === "vfx"
  ) {
    return value;
  }
  return DEFAULT_ASSET_DOMAIN;
}
