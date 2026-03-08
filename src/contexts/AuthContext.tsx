import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Profile {
    id: string;
    role: 'user' | 'admin';
    tier: 'free' | 'pro';
    full_name: string;
    phone?: string;
    agency?: string;
    job_title?: string;
    company_address?: string;
    website?: string;
    business_email?: string;
    avatar_url?: string;
    avatar?: string;
    credits: number;
    company_logo?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    const fetchProfile = useCallback(async (userId: string, retries = 3): Promise<Profile | null> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.warn(`[Auth] fetchProfile attempt ${attempt}/${retries} failed:`, error.message);
                    if (attempt < retries) {
                        await new Promise(r => setTimeout(r, 500 * attempt));
                        continue;
                    }
                    return null;
                }
                return data as Profile;
            } catch (err) {
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 500 * attempt));
                    continue;
                }
                return null;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Check current session immediately
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (mounted && initialSession) {
                    console.log('[Auth] Session restored via getSession');
                    setSession(initialSession);
                    setUser(initialSession.user);

                    // CRITICAL: Fetch profile BEFORE setting loading=false
                    // Otherwise ProtectedRoute sees profile=null and redirects PRO users
                    const p = await fetchProfile(initialSession.user.id);
                    if (mounted) {
                        setProfile(p);
                        setLoading(false);
                        initialized.current = true;
                    }
                } else if (mounted && !initialSession) {
                    // No session — mark as done
                    setLoading(false);
                    initialized.current = true;
                }
            } catch (err) {
                console.error('[Auth] Initial session check failed:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for all auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`[Auth Event] ${event}`);
            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (newSession?.user) {
                    setSession(newSession);
                    setUser(newSession.user);

                    // Fetch profile BEFORE marking as loaded
                    const p = await fetchProfile(newSession.user.id);
                    if (mounted) {
                        setProfile(p);
                        setLoading(false);
                        initialized.current = true;
                    }
                } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                    if (!initialized.current) {
                        setLoading(false);
                        initialized.current = true;
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                initialized.current = true;
            }
        });

        // 3. Ultimate safety net: ensure we aren't stuck in "loading" forever
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('[Auth] Safety timeout - unlocking UI');
                setLoading(false);
            }
        }, 6000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [fetchProfile]);

    const value = {
        session,
        user,
        profile,
        loading,
        signOut: async () => {
            try {
                await supabase.auth.signOut();
                // Clear all states
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                // Hard redirect to login to clear internal memory/cache
                window.location.href = '/login';
            } catch (error) {
                console.error('[Auth] SignOut error:', error);
                window.location.href = '/login';
            }
        },
        refreshProfile: async () => {
            if (user) {
                const data = await fetchProfile(user.id);
                setProfile(data);
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
