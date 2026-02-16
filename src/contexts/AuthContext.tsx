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

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // Record not found
                    console.log('Profile not found, creating default one...');
                    // Try to get user metadata for initial full_name
                    const { data: { user } } = await supabase.auth.getUser();
                    const initials = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

                    const { data: newProfile, error: insertError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            full_name: initials,
                            role: 'user',
                            tier: 'free'
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        // If insert fails (e.g. duplicate key), it means another process created it. Retry fetch!
                        console.warn('Profile creation conflict (race condition). Retrying fetch...', insertError.message);
                        const { data: retryData, error: retryError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();

                        if (retryError) {
                            console.error('Retry fetch failed:', retryError);
                            return null;
                        }
                        return retryData as Profile;
                    }
                    return newProfile as Profile;
                }
                console.warn('Error fetching profile:', error.message);
                return null;
            }
            return data as Profile;
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    // We found a session, release the UI lock immediately
                    setLoading(false);

                    if (session?.user) {
                        // Fetch profile in background
                        fetchProfile(session.user.id).then(profileData => {
                            if (mounted) setProfile(profileData);
                        });
                    }
                }
            } catch (error) {
                console.error('Error initializing session:', error);
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_OUT') {
                setProfile(null);
                setLoading(false);
                return;
            }

            if (session?.user) {
                // If we sign in, we want to fetch profile but don't block the UI if it takes too long
                const profilePromise = fetchProfile(session.user.id);

                // If it's a new sign in, we might want to wait a tiny bit to avoid flash, 
                // but let's prioritize responsiveness
                profilePromise.then(profileData => {
                    if (mounted) {
                        setProfile(profileData);
                        setLoading(false);
                    }
                });

                // Safety: ensure loading is false after a short delay even if profile hangs
                setTimeout(() => {
                    if (mounted) setLoading(false);
                }, 2000);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        // Realtime Profile Listener
        const channel = supabase
            .channel('profile_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles'
                },
                (payload) => {
                    // Only update if it allows checking ID match via filter or we check here
                    // Since dynamic filter in subscription setup is tricky with useEffect deps, 
                    // we check payload.new.id against current session user inside
                    supabase.auth.getSession().then(({ data: { session } }) => {
                        if (session?.user?.id === payload.new.id) {
                            // console.log('⚡ Profile updated realtime:', payload.new);
                            if (mounted) setProfile(payload.new as Profile);
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [fetchProfile]);

    const value = {
        session,
        user,
        profile,
        loading,
        signOut: async () => {
            // Optimistic update for instant UI response
            setLoading(true); // Show loading briefly or just clear immediately depending on UX pref
            setSession(null);
            setUser(null);
            setProfile(null);

            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            } finally {
                setLoading(false);
            }
        },
        refreshProfile: async () => {
            if (user) {
                const profileData = await fetchProfile(user.id);
                setProfile(profileData);
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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
