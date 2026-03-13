export type CalcMethod = 'emi' | 'diminishing';

export interface LoanScenario {
    id: number;
    name: string;
    amount: number;
    term: number;
    rate: number;
    gracePeriod: number;
    graceInterest: number;
    method: CalcMethod;
    prepayPenalty: number;
    prepayMonth: number;
    hasPrepay: boolean;
    bankCode: string;
    bankName: string;
}

export interface ScheduleEntry {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remaining: number;
}

export interface LoanResults {
    firstMonth: number;
    totalPayment: number;
    totalInterest: number;
    monthlyPrincipal: number;
    monthlyInterest: number;
    prepayPenaltyAmount: number;
    remainingAtPrepay: number;
    paidPrincipalUntilPrepay: number;
    paidInterestUntilPrepay: number;
    schedule: ScheduleEntry[];
}

export interface BankInfo {
    name: string;
    code: string;
    logo: string;
    color: string;
}
