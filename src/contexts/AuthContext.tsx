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
    const [profileLoading, setProfileLoading] = useState(true);
    const initialized = useRef(false);

    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('[Auth] fetchProfile failed:', error.message);
                return null;
            }
            return data as Profile;
        } catch (err) {
            console.error('[Auth] fetchProfile exception:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchProfileWithTimeout = async (userId: string) => {
            try {
                // Thêm timeout 10 giây để tránh treo UI vĩnh viễn
                const result = await Promise.race([
                    fetchProfile(userId),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 10000))
                ]);
                return result;
            } catch (err) {
                console.warn('[Auth] fetchProfileWithTimeout error:', err);
                return null;
            }
        };

        const initializeAuth = async () => {
            try {
                const { data: { session: s } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (s?.user) {
                    setSession(s);
                    setUser(s.user);
                    setLoading(false);
                    initialized.current = true;

                    // Profile loads in parallel - UI shows skeleton while loading
                    setProfileLoading(true);
                    const p = await fetchProfileWithTimeout(s.user.id);
                    if (mounted) {
                        setProfile(p);
                        setProfileLoading(false);
                    }
                } else {
                    setLoading(false);
                    setProfileLoading(false);
                    initialized.current = true;
                }
            } catch (err) {
                console.error('[Auth] Init failed:', err);
                if (mounted) {
                    setLoading(false);
                    setProfileLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (newSession?.user) {
                    setSession(newSession);
                    setUser(newSession.user);
                    setLoading(false);
                    initialized.current = true;

                    setProfileLoading(true);
                    const p = await fetchProfileWithTimeout(newSession.user.id);
                    if (mounted) {
                        setProfile(p);
                        setProfileLoading(false);
                    }
                }
            } else if (event === 'INITIAL_SESSION') {
                if (!initialized.current && newSession?.user) {
                    setSession(newSession);
                    setUser(newSession.user);
                    setLoading(false);
                    initialized.current = true;

                    setProfileLoading(true);
                    const p = await fetchProfileWithTimeout(newSession.user.id);
                    if (mounted) {
                        setProfile(p);
                        setProfileLoading(false);
                    }
                } else if (!initialized.current) {
                    setLoading(false);
                    setProfileLoading(false);
                    initialized.current = true;
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                setProfileLoading(false);
                initialized.current = true;
            }
        });

        // Safety net
        const timer = setTimeout(() => {
            if (mounted) {
                if (!initialized.current) {
                    console.warn('[Auth] Safety timeout - unlocking UI');
                    setLoading(false);
                }
                // Thêm safety net cho profile loading
                setProfileLoading(false);
            }
        }, 8000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [fetchProfile]);

    const value: AuthContextType = {
        session,
        user,
        profile,
        loading,
        profileLoading,
        signOut: async () => {
            // Instantly clear state + redirect — don't wait for API
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);

            // Fire signOut in background, redirect immediately
            supabase.auth.signOut().catch(() => { });
            window.location.href = '/login';
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
