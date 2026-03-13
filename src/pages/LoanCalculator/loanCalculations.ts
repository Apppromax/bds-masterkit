import type { LoanScenario, LoanResults } from './loanTypes';

export const calculateGenericLoan = (scenario: LoanScenario): LoanResults => {
    const { amount, rate, term, gracePeriod, graceInterest, method, prepayPenalty, prepayMonth, hasPrepay } = scenario;
    const principal = amount;
    const annualRate = rate / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = term * 12;

    let totalInterestPaid = 0;
    const schedule = [];
    let firstMonthTotal = 0;
    let firstMonthPrincipal = 0;
    let firstMonthInterest = 0;
    let prepayPenaltyAmount = 0;
    let remainingAtPrepay = 0;
    let paidPrincipalUntilPrepay = 0;
    let paidInterestUntilPrepay = 0;

    let remainingPrincipal = principal;

    if (method === 'emi') {
        const monthsToPayPrincipal = totalMonths - (gracePeriod || 0);
        const emiAfterGrace = monthsToPayPrincipal > 0
            ? (principal * monthlyRate * Math.pow(1 + monthlyRate, monthsToPayPrincipal)) / (Math.pow(1 + monthlyRate, monthsToPayPrincipal) - 1)
            : 0;

        for (let i = 1; i <= totalMonths; i++) {
            let interest = remainingPrincipal * monthlyRate;
            let principalPaid = 0;

            if (i <= (graceInterest || 0)) {
                interest = 0;
            }

            let currentPayment = interest;

            if (i > (gracePeriod || 0)) {
                currentPayment = emiAfterGrace;
                principalPaid = emiAfterGrace - interest;
            }

            remainingPrincipal -= principalPaid;

            if (hasPrepay) {
                if (i < prepayMonth) {
                    paidPrincipalUntilPrepay += principalPaid;
                    paidInterestUntilPrepay += interest;
                }

                if (i === prepayMonth) {
                    remainingAtPrepay = remainingPrincipal + principalPaid;
                    prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100);
                }
            }

            if (i === 1) {
                firstMonthTotal = currentPayment;
                firstMonthPrincipal = principalPaid;
                firstMonthInterest = interest;
            }

            if (i <= totalMonths) {
                schedule.push({
                    month: i,
                    payment: currentPayment,
                    principal: principalPaid,
                    interest: interest,
                    remaining: Math.max(0, remainingPrincipal)
                });
            }
            totalInterestPaid += interest;
        }

        return {
            firstMonth: firstMonthTotal,
            totalPayment: principal + totalInterestPaid,
            totalInterest: totalInterestPaid,
            monthlyPrincipal: firstMonthPrincipal,
            monthlyInterest: firstMonthInterest,
            prepayPenaltyAmount,
            remainingAtPrepay,
            paidPrincipalUntilPrepay,
            paidInterestUntilPrepay,
            schedule
        };
    } else {
        const monthsToPayPrincipal = totalMonths - gracePeriod;
        const fixedPrincipal = principal / monthsToPayPrincipal;

        for (let i = 1; i <= totalMonths; i++) {
            const interest = remainingPrincipal * monthlyRate;
            let principalPaid = 0;

            if (i > gracePeriod) {
                principalPaid = fixedPrincipal;
            }

            const totalMonthPayment = interest + principalPaid;
            remainingPrincipal -= principalPaid;

            if (hasPrepay) {
                if (i < prepayMonth) {
                    paidPrincipalUntilPrepay += principalPaid;
                    paidInterestUntilPrepay += interest;
                }

                if (i === prepayMonth) {
                    remainingAtPrepay = remainingPrincipal + principalPaid;
                    prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100);
                }
            }

            if (i === 1) {
                firstMonthTotal = totalMonthPayment;
                firstMonthPrincipal = principalPaid;
                firstMonthInterest = interest;
            }

            if (i <= totalMonths) {
                schedule.push({
                    month: i,
                    payment: totalMonthPayment,
                    principal: principalPaid,
                    interest: interest,
                    remaining: Math.max(0, remainingPrincipal)
                });
            }
            totalInterestPaid += interest;
        }

        return {
            firstMonth: firstMonthTotal,
            totalPayment: principal + totalInterestPaid,
            totalInterest: totalInterestPaid,
            monthlyPrincipal: firstMonthPrincipal,
            monthlyInterest: firstMonthInterest,
            prepayPenaltyAmount,
            remainingAtPrepay,
            paidPrincipalUntilPrepay,
            paidInterestUntilPrepay,
            schedule
        };
    }
};
