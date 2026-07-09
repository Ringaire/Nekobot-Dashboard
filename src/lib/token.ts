const TOKEN_KEY = 'access_token';
const USERNAME_KEY = 'username';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY) ?? sessionStorage.getItem(USERNAME_KEY);
}

export function setToken(token: string, username: string, remember: boolean): void {
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  primary.setItem(TOKEN_KEY, token);
  primary.setItem(USERNAME_KEY, username);
  secondary.removeItem(TOKEN_KEY);
  secondary.removeItem(USERNAME_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}
