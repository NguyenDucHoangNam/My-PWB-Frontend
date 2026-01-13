let accessTokenCache: string | null = null;

export function setToken(token: string) {
  accessTokenCache = token;
}

export function getToken(): string | null {
  return accessTokenCache;
}

export function clearToken(): void {
  accessTokenCache = null;
}

// Optional: sync from storage on app start if needed by callers
export function hydrateTokenFromStorage(): void {
  try {
    const t = localStorage.getItem("accessToken");
    if (t) {
      accessTokenCache = t;
    }
  } catch {
    // ignore
  }
}


