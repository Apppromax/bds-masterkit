import { createContext, useContext, useEffect, useState } from 'react';
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

    const fetchProfile = async (userId: string) => {
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
    };

    useEffect(() => {
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            }
            setLoading(false);
        };

        initSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            } else {
                setProfile(null);
            }
            setLoading(false);
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
                            console.log('⚡ Profile updated realtime:', payload.new);
                            setProfile(payload.new as Profile);
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);

    const value = {
        session,
        user,
        profile,
        loading,
        signOut: async () => {
            await supabase.auth.signOut();
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
