import { clearLegacyBrowserAuthKeys } from "./legacyStorageClear";
import { tokenMemory } from "./tokenMemory";

/** SPA tokens stored in memory (auth-service JWT access + refresh rotation). */
export function persistTokens(access, refresh) {
  tokenMemory.setPair(access ?? null, refresh ?? null);
}

export function clearAuthStorage() {
  tokenMemory.clear();
  clearLegacyBrowserAuthKeys();
}

export function getStoredAccessToken() {
  return tokenMemory.getAccess();
}

export function getStoredRefreshTokenMem() {
  return tokenMemory.getRefresh();
}

export const STORAGE_ACCESS_TOKEN_KEY = "access_token_removed";
export const STORAGE_REFRESH_TOKEN_KEY = "refresh_token_removed";
