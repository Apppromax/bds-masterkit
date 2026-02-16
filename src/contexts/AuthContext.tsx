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
    const retryCount = useRef(0);

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
                if (error.code === 'PGRST116') { // Not found
                    // Fallback: try to create if missing
                    const { data: { user } } = await supabase.auth.getUser();
                    const initials = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

                    const { data: newProfile, error: insErr } = await supabase
                        .from('profiles')
                        .upsert([{
                            id: userId,
                            email: user?.email,
                            full_name: initials,
                            role: 'user',
                            tier: 'free'
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

        const syncAuth = async () => {
            setLoading(true);
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (!mounted) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    const profileData = await fetchProfile(currentSession.user.id);
                    if (mounted) {
                        setProfile(profileData);
                        // Even if profile fails, we stop loading to let user see SOMETHING
                        setLoading(false);
                    }
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            } catch (err) {
                console.error('[Auth] Sync error:', err);
                if (mounted) setLoading(false);
            }
        };

        syncAuth();

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

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    const profileData = await fetchProfile(newSession.user.id);
                    if (mounted) setProfile(profileData);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const value = {
        session,
        user,
        profile,
        loading,
        signOut: async () => {
            setLoading(true);
            try {
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                setProfile(null);
            } catch (error) {
                console.error('[Auth] SignOut error:', error);
            } finally {
                setLoading(false);
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
