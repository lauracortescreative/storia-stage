/**
 * Storia API Service
 * Typed fetch wrapper for the backend at http://localhost:3001
 * JWT token is stored in localStorage as 'storia_jwt'
 */

// In production (Netlify), the frontend and function share one origin,
// so we use a relative /api path. In local dev, we point to the Express server.
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
    return localStorage.getItem('storia_jwt');
}

export function setToken(token: string) {
    localStorage.setItem('storia_jwt', token);
}

export function clearToken() {
    localStorage.removeItem('storia_jwt');
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || `Request failed (${res.status})`);
    }

    return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResult {
    token: string;
    user: { id: string; email: string };
}

export async function apiRegister(email: string, password: string): Promise<AuthResult> {
    const result = await apiFetch<AuthResult>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    setToken(result.token);
    return result;
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
    const result = await apiFetch<AuthResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    setToken(result.token);
    return result;
}

export async function apiUpdateEmail(email: string): Promise<void> {
    await apiFetch('/auth/email', {
        method: 'PUT',
        body: JSON.stringify({ email })
    });
}

export async function apiDeleteAccount(): Promise<void> {
    await apiFetch('/auth/account', { method: 'DELETE' });
    clearToken();
}

// ─── Stories ──────────────────────────────────────────────────────────────────

import type { StoryResult } from '../types';

export async function apiGetStories(): Promise<StoryResult[]> {
    return apiFetch<StoryResult[]>('/stories');
}

export async function apiSaveStory(story: StoryResult): Promise<void> {
    await apiFetch('/stories', {
        method: 'POST',
        body: JSON.stringify(story)
    });
}

export async function apiDeleteStory(id: string): Promise<void> {
    await apiFetch(`/stories/${id}`, { method: 'DELETE' });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

import type { UserStats } from '../types';

export async function apiGetStats(): Promise<UserStats> {
    return apiFetch<UserStats>('/stats');
}

export async function apiUpdateStats(stats: Partial<UserStats>): Promise<void> {
    await apiFetch('/stats', {
        method: 'PUT',
        body: JSON.stringify(stats)
    });
}

// ─── Stripe / Subscriptions ───────────────────────────────────────────────────

export async function apiCreateCheckoutSession(plan: 'monthly' | 'yearly'): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('/subscribe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan })
    });
}

export async function apiCreateTopupSession(count: number): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('/subscribe/topup', {
        method: 'POST',
        body: JSON.stringify({ count })
    });
}


// ─── Public Library ───────────────────────────────────────────────────────────

export async function apiGetPublicStories(): Promise<StoryResult[]> {
    return apiFetch<StoryResult[]>('/public-stories');
}


// ─── Health check (useful for detecting if server is offline) ─────────────────

export async function apiHealthCheck(): Promise<boolean> {
    try {
        await apiFetch('/health');
        return true;
    } catch {
        return false;
    }
}

// ─── Child Profile ─────────────────────────────────────────────────────────────

export interface ChildProfile {
    childName: string;
    childAge: number | null;
    childAvatar: string;
}

export async function apiGetProfile(): Promise<ChildProfile> {
    return apiFetch<ChildProfile>('/profile');
}

export async function apiSaveProfile(profile: ChildProfile): Promise<void> {
    await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
    });
}
