/**
 * Core Financial Math Engine for Axiom OS
 */

export const calcNPV = (rate: number, cashFlows: number[]): number => {
    return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);
};

export const calcIRR = (
    cashFlows: number[],
    guess: number = 0.1,
    maxIter: number = 100,
    tol: number = 1e-7
): number | null => {
    let rate = guess;
    for (let i = 0; i < maxIter; i++) {
        const npv = calcNPV(rate, cashFlows);
        const dnpv = cashFlows.reduce(
            (d, cf, t) => d - (t * cf) / Math.pow(1 + rate, t + 1),
            0
        );
        if (Math.abs(dnpv) < tol) break;
        const newRate = rate - npv / dnpv;
        if (Math.abs(newRate - rate) < tol) return newRate;
        rate = newRate;
    }
    return rate;
};

export interface FinModel {
    totalLots: number;
    hardCostPerLot: number;
    softCostPct: number;
    planningFees: number;
    permitFeePerLot: number;
    schoolFee: number;
    impactFeePerLot: number;
    contingencyPct: number;
    landCost: number;
    closingCosts: number;
    absorbRate: number;
    salesPricePerLot: number;
    salesCommission: number;
    reservePercentage?: number;
}

export const buildMonthlyCashFlows = (fin: FinModel) => {
    const lots = fin.totalLots || 1;
    const hard = lots * (fin.hardCostPerLot || 0);
    const soft = hard * ((fin.softCostPct || 0) / 100);
    const fees =
        (fin.planningFees || 0) +
        ((fin.permitFeePerLot || 0) +
            (fin.schoolFee || 0) +
            (fin.impactFeePerLot || 0)) *
        lots;
    const cont = (hard + soft) * ((fin.contingencyPct || 0) / 100);
    const totalCost = (fin.landCost || 0) + (fin.closingCosts || 0) + hard + soft + cont + fees;

    const constMonths = Math.max(6, Math.ceil(lots / 8)); // construction duration estimate
    const sellMonths = Math.ceil(lots / (fin.absorbRate || 1));
    const totalMonths = constMonths + sellMonths;

    const monthlyCost = (totalCost - (fin.landCost || 0)) / constMonths;
    const monthlyRev =
        (fin.absorbRate || 1) *
        (fin.salesPricePerLot || 0) *
        (1 - (fin.salesCommission || 0) / 100);

    // month 0: land acquisition
    const flows = [-(fin.landCost || 0) - (fin.closingCosts || 0)];

    for (let m = 1; m <= totalMonths; m++) {
        let cf = 0;
        if (m <= constMonths) cf -= monthlyCost; // construction spend
        if (m > constMonths) cf += monthlyRev; // lot sales
        flows.push(cf);
    }

    return { flows, constMonths, sellMonths, totalMonths, totalCost };
};


