export const calculateMortgage = (principal: number, rate: number, years: number) => {
    if (principal <= 0 || rate <= 0 || years <= 0) return 0;

    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    const payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return payment;
};

export const calculateROI = (annualProfit: number, totalCost: number) => {
    if (totalCost === 0) return 0;
    return (annualProfit / totalCost) * 100;
};

export const calculateCapRate = (noi: number, value: number) => {
    if (value === 0) return 0;
    return (noi / value) * 100;
};

export const calculateDevProfit = (exitValue: number, acquisition: number, renovation: number, holding: number, sellingCosts: number) => {
    const totalCost = acquisition + renovation + holding + sellingCosts;
    return exitValue - totalCost;
};
