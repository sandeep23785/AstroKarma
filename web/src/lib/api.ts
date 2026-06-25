const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8077'
const TOKEN_KEY = 'ak_token'

let token: string | null = localStorage.getItem(TOKEN_KEY)

export function setToken(t: string) {
  token = t
  localStorage.setItem(TOKEN_KEY, t)
}

export function clearToken() {
  token = null
  localStorage.removeItem(TOKEN_KEY)
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  })
  if (res.status === 401) {
    clearToken()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, body?: unknown) =>
    req<T>(p, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(p: string, body?: unknown) =>
    req<T>(p, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(p: string) => req<T>(p, { method: 'DELETE' }),
}

/**
 * Single-user local bootstrap: obtain a JWT via dev-login.
 * In production this is replaced by Google sign-in (POST /api/auth/google).
 */
export async function ensureAuth(): Promise<void> {
  if (token) return
  const r = await api.post<{ token: string }>('/api/auth/dev-login', {})
  setToken(r.token)
}
