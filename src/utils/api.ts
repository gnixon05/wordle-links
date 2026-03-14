import { User } from '../types';

const SESSION_KEY = 'wl_session_token';

function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setSessionToken(token: string | null): void {
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    const body = await res.json();

    if (!res.ok) {
      return { error: body.error || `Request failed (${res.status})` };
    }

    return { data: body as T };
  } catch (err) {
    console.error('[API]', err);
    return { error: 'Network error. Is the server running?' };
  }
}

// ---------- Auth API ----------

interface AuthResponse {
  sessionId: string;
  user: User;
}

export async function apiSignup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nickname?: string;
  avatar: { category: string; variant: string };
}): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.data) {
    setSessionToken(result.data.sessionId);
    return { user: result.data.user };
  }
  return { error: result.error };
}

export async function apiLogin(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.data) {
    setSessionToken(result.data.sessionId);
    return { user: result.data.user };
  }
  return { error: result.error };
}

export async function apiLogout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  setSessionToken(null);
}

export async function apiGetMe(): Promise<{ user?: User; error?: string }> {
  const token = getSessionToken();
  if (!token) return { error: 'No session' };

  const result = await apiRequest<{ user: User }>('/api/auth/me');
  if (result.data) {
    return { user: result.data.user };
  }
  // Session expired or invalid — clear token
  setSessionToken(null);
  return { error: result.error };
}

export async function apiUpdateProfile(
  userId: string,
  updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar' | 'theme'>>
): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<User>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (result.data) return { user: result.data };
  return { error: result.error };
}

export async function apiGetUsers(): Promise<User[]> {
  const result = await apiRequest<User[]>('/api/users');
  return result.data || [];
}

export { getSessionToken, setSessionToken };
