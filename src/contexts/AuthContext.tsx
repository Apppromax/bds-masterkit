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
                // Timeout 10s để tránh UI bị treo
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

        const handleAuthSession = async (s: Session | null, isRefresh = false) => {
            if (!mounted) return;

            if (s?.user) {
                setSession(s);
                setUser(s.user);
                setLoading(false);
                initialized.current = true;

                // CHỈ BẬT profileLoading nếu đây là load lần đầu, không bật khi TOKEN_REFRESHED để tránh UI nháy
                if (!isRefresh) {
                    setProfileLoading(true);
                }

                const p = await fetchProfileWithTimeout(s.user.id);

                if (mounted) {
                    // CỰC KỲ QUAN TRỌNG: Chỉ set profile nếu fetch thành công (p != null)
                    // Tránh trường hợp mạng lỗi/timeout tự động đè null làm mất quyền VIP
                    if (p) {
                        setProfile(p);
                    }
                    setProfileLoading(false);
                }
            } else {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                setProfileLoading(false);
                initialized.current = true;
            }
        };

        // Chủ động lấy session lần đầu nếu INITIAL_SESSION chưa kịp chạy
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (mounted && !initialized.current) {
                handleAuthSession(s, false);
            }
        });

        // Lắng nghe thay đổi Auth (event driven)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                handleAuthSession(newSession, false);
            } else if (event === 'TOKEN_REFRESHED') {
                handleAuthSession(newSession, true); // true = isRefresh (đừng bật loading spinner)
            } else if (event === 'SIGNED_OUT') {
                handleAuthSession(null, false);
            }
        });

        // Cứu tinh cuối cùng: Mở khoá UI sau 10s dù chuyện gì xảy ra
        const timer = setTimeout(() => {
            if (mounted) {
                if (!initialized.current) {
                    console.warn('[Auth] Safety timeout - unlocking UI');
                    setLoading(false);
                }
                setProfileLoading(false);
            }
        }, 10000);

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
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);

            try {
                // Must AWAIT signOut so browser clears localstorage tokens
                await supabase.auth.signOut();
            } catch (err) {
                console.error('[Auth] signout exception:', err);
            }

            // Now redirect after storage is definitely cleared
            window.location.href = '/login';
        },
        refreshProfile: async () => {
            if (user) {
                const data = await fetchProfile(user.id);
                if (data) {
                    console.log('[Auth] refreshProfile → credits:', data.credits);
                    setProfile(data);
                }
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
