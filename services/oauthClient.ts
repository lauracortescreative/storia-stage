
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qbsoedfpjyyvqkkmshea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFic29lZGZwanl5dnFra21zaGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTU5NjgsImV4cCI6MjA4NzA5MTk2OH0.4A_rrsWcgRlUqMDSdpGfYM0BqTYyEJ0Vdln9oIVIhrY';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const REDIRECT_URL = typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : 'https://storia.land/';

export async function signInWithGoogle() {
    return supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT_URL },
    });
}

export async function signInWithApple() {
    return supabaseClient.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: REDIRECT_URL },
    });
}

/** After OAuth redirect, exchange the Supabase session for an app token */
export async function getOAuthSession(): Promise<{ token: string; email: string; userId: string } | null> {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session) return null;
    return {
        token: data.session.access_token,
        email: data.session.user.email ?? '',
        userId: data.session.user.id,
    };
}
