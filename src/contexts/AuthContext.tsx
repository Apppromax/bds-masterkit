import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        try {
            console.log(`[Auth] Fetching profile for ${userId}...`);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('[Auth] Profile fetch error:', error.message);
                if (error.code === 'PGRST116') {
                    const { data: { user } } = await supabase.auth.getUser();
                    const initials = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

                    const { data: newProfile, error: insErr } = await supabase
                        .from('profiles')
                        .upsert([{
                            id: userId,
                            email: user?.email,
                            full_name: initials,
                            role: 'user',
                            tier: 'free',
                            credits: 0
                        }])
                        .select()
                        .single();

                    return insErr ? null : (newProfile as Profile);
                }
                return null;
            }
            console.log('[Auth] Profile loaded:', data.full_name, data.role, data.tier);
            return data as Profile;
        } catch (err) {
            console.error('[Auth] Unexpected profile error:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // FAST PATH: Don't block anything. Just check session quickly.
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (!mounted) return;

                if (currentSession?.user) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    // IMPORTANT: Stop loading IMMEDIATELY so user isn't blocked
                    setLoading(false);
                    // Fetch profile in background (non-blocking)
                    fetchProfile(currentSession.user.id).then(p => {
                        if (mounted) setProfile(p);
                    });
                } else {
                    // No session = show login page right away
                    setLoading(false);
                }
            } catch (err) {
                console.error('[Auth] Init error:', err);
                // Even on error, let the user proceed
                if (mounted) setLoading(false);
            }
        };

        // Safety net: If getSession hangs, force loading=false after 3s
        const safetyTimer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('[Auth] Safety timeout - forcing loading=false');
                setLoading(false);
            }
        }, 3000);

        initAuth();

        // Listen for auth changes (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`[Auth] Event: ${event}`);
            if (!mounted) return;

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);

                if (newSession?.user) {
                    // Profile fetch is non-blocking
                    fetchProfile(newSession.user.id).then(p => {
                        if (mounted) setProfile(p);
                    });
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const value = {
        session,
        user,
        profile,
        loading,
        signOut: async () => {
            // Optimistic: clear state first, then tell server
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.error('[Auth] SignOut error:', error);
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
