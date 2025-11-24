// lib/storageKeys.ts
import { BRAND_NAME } from "./brand";

const BRAND_STORAGE_SLUG = BRAND_NAME.toLowerCase().replace(/\s+/g, "");

export const STORAGE_PREFIX = BRAND_STORAGE_SLUG; // "bauerfit"

export function storageKey(suffix: string) {
  return `${STORAGE_PREFIX}:${suffix}`;
}
