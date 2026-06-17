export type AssetDomain = "character" | "scene" | "prop" | "ui" | "vfx";

export const DEFAULT_ASSET_DOMAIN: AssetDomain = "character";

export const ASSET_DOMAIN_ORDER: AssetDomain[] = [
  "character",
  "scene",
  "prop",
  "ui",
  "vfx",
];

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
