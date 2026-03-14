import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkAndDeductCredits } from '../services/aiService';

export type CreditGateState =
    | { type: 'idle' }
    | { type: 'guest' }
    | { type: 'insufficient'; needed: number; current: number }
    | { type: 'processing' };

/**
 * Hook that gates credit-consuming actions behind auth + balance checks.
 * Instead of blocking page access, this only triggers when the user presses "run".
 * 
 * Returns:
 * - gateState: current modal state  
 * - dismissGate: close modal
 * - attemptAction: wraps checkAndDeductCredits with gate logic
 */
export function useCreditGate() {
    const { user, profile, refreshProfile } = useAuth();
    const [gateState, setGateState] = useState<CreditGateState>({ type: 'idle' });

    const dismissGate = useCallback(() => {
        setGateState({ type: 'idle' });
    }, []);

    /**
     * Attempt a credit-consuming action.
     * - If not logged in → show guest modal, return false
     * - If insufficient credits → show insufficient modal, return false
     * - If OK → deduct credits and return true
     */
    const attemptAction = useCallback(async (
        cost: number,
        actionName: string
    ): Promise<{ success: boolean; message?: string }> => {
        // Gate 1: Guest user (not logged in)
        if (!user) {
            setGateState({ type: 'guest' });
            return { success: false, message: 'Chưa đăng nhập' };
        }

        // Gate 2: Insufficient credits (check locally first for instant feedback)
        const currentCredits = profile?.credits ?? 0;
        if (currentCredits < cost) {
            setGateState({ type: 'insufficient', needed: cost, current: currentCredits });
            return { success: false, message: 'Không đủ Xu' };
        }

        // Gate 3: Proceed with server-side deduction
        setGateState({ type: 'processing' });
        const result = await checkAndDeductCredits(cost, actionName);

        if (!result.success) {
            // Server rejected — probably race condition or stale cache
            if (result.message?.includes('số dư') || result.message?.includes('Không đủ')) {
                setGateState({ type: 'insufficient', needed: cost, current: currentCredits });
            } else {
                setGateState({ type: 'idle' });
            }
            return result;
        }

        // Immediately refresh profile to update Xu display
        refreshProfile?.();

        setGateState({ type: 'idle' });
        return { success: true };
    }, [user, profile, refreshProfile]);

    return { gateState, dismissGate, attemptAction };
}
