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
    profileLoading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const initialized = useRef(false);
    const fetchingRef = useRef(false);
    const lastFetchedUserId = useRef<string | null>(null);

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

    // Single unified handler: set session + user + profile atomically
    const handleSession = useCallback(async (newSession: Session | null, mounted: { current: boolean }) => {
        if (!newSession?.user) {
            if (mounted.current) {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                initialized.current = true;
            }
            return;
        }

        const userId = newSession.user.id;

        // Skip if we're already fetching for this same user
        if (fetchingRef.current && lastFetchedUserId.current === userId) {
            return;
        }

        fetchingRef.current = true;
        lastFetchedUserId.current = userId;

        if (mounted.current) {
            setSession(newSession);
            setUser(newSession.user);
            setProfileLoading(true);
        }

        const p = await fetchProfile(userId);

        if (mounted.current) {
            setProfile(p);
            setProfileLoading(false);
            setLoading(false);
            initialized.current = true;

            if (!p) {
                console.error('[Auth] Profile is null after 3 retries! User may see incorrect tier/credits.');
            }
        }

        fetchingRef.current = false;
    }, [fetchProfile]);

    useEffect(() => {
        const mounted = { current: true };

        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                await handleSession(initialSession, mounted);
            } catch (err) {
                console.error('[Auth] Initial session check failed:', err);
                if (mounted.current) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`[Auth Event] ${event}`);
            if (!mounted.current) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await handleSession(newSession, mounted);
            } else if (event === 'INITIAL_SESSION') {
                // Only handle if initializeAuth hasn't already processed this
                if (!initialized.current) {
                    await handleSession(newSession, mounted);
                }
            } else if (event === 'SIGNED_OUT') {
                lastFetchedUserId.current = null;
                fetchingRef.current = false;
                if (mounted.current) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    initialized.current = true;
                }
            }
        });

        // Safety net: don't let UI stuck in loading forever
        const timer = setTimeout(() => {
            if (mounted.current && loading && !initialized.current) {
                console.warn('[Auth] Safety timeout (10s) - unlocking UI');
                setLoading(false);
            }
        }, 10000);

        return () => {
            mounted.current = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [handleSession]);

    const value = {
        session,
        user,
        profile,
        loading,
        profileLoading,
        signOut: async () => {
            try {
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                window.location.href = '/login';
            } catch (error) {
                console.error('[Auth] SignOut error:', error);
                window.location.href = '/login';
            }
        },
        refreshProfile: async () => {
            if (user) {
                setProfileLoading(true);
                const data = await fetchProfile(user.id);
                setProfile(data);
                setProfileLoading(false);
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
