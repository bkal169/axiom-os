import type { Deal } from '../types/deals';


export interface DashboardMetrics {
    activeDealsCount: number;
    pipelineValue: number;
    totalCost: number;
    projectedProfit: number;
    weightedROI: number;
    capitalRequired: number;
    capitalRaised: number;
    capitalGap: number;
}

export interface DashboardAlert {
    id: string;
    type: 'GAP' | 'STALLED' | 'ROI' | 'MISSING';
    message: string;
    dealId: string;
    dealName: string;
    severity: 'high' | 'medium' | 'low';
}

export const computeMetrics = (deals: Deal[]): DashboardMetrics => {
    const activeDeals = deals.filter(d => d.stage !== 'dead' && d.stage !== 'sold');

    const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.projected_value || 0), 0);
    const totalAcq = activeDeals.reduce((sum, d) => sum + (d.acquisition_price || 0), 0);
    const totalReno = activeDeals.reduce((sum, d) => sum + (d.renovation_cost || 0), 0);
    const totalCost = totalAcq + totalReno;

    const projectedProfit = pipelineValue - totalCost;
    const weightedROI = totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0;

    const capitalRequired = activeDeals.reduce((sum, d) => sum + (d.capital_required || 0), 0);
    const capitalRaised = activeDeals.reduce((sum, d) => sum + (d.capital_raised || 0), 0);

    return {
        activeDealsCount: activeDeals.length,
        pipelineValue,
        totalCost,
        projectedProfit,
        weightedROI,
        capitalRequired,
        capitalRaised,
        capitalGap: capitalRequired - capitalRaised
    };
};

export const generateAlerts = (deals: Deal[]): DashboardAlert[] => {
    const alerts: DashboardAlert[] = [];
    const activeDeals = deals.filter(d => d.stage !== 'dead' && d.stage !== 'sold');

    activeDeals.forEach(deal => {
        // Gap Check
        const gap = (deal.capital_required || 0) - (deal.capital_raised || 0);
        if (gap > 250000 && deal.stage !== 'sourcing') {
            alerts.push({
                id: `gap-${deal.id}`,
                type: 'GAP',
                message: `Capital Gap > $250k (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(gap)})`,
                dealId: deal.id,
                dealName: deal.project_name,
                severity: 'high'
            });
        }

        // Stalled Check (Mock logic: updated > 30 days)
        const daysSinceUpdate = (new Date().getTime() - new Date(deal.updated_at).getTime()) / (1000 * 3600 * 24);
        if (daysSinceUpdate > 30) {
            alerts.push({
                id: `stalled-${deal.id}`,
                type: 'STALLED',
                message: `No activity for 30+ days`,
                dealId: deal.id,
                dealName: deal.project_name,
                severity: 'medium'
            });
        }

        // ROI Check
        const cost = (deal.acquisition_price || 0) + (deal.renovation_cost || 0);
        if (cost > 0) {
            const profit = (deal.projected_value || 0) - cost;
            const roi = (profit / cost) * 100;
            if (roi < 10) {
                alerts.push({
                    id: `roi-${deal.id}`,
                    type: 'ROI',
                    message: `Projected ROI < 10% (${roi.toFixed(1)}%)`,
                    dealId: deal.id,
                    dealName: deal.project_name,
                    severity: 'medium'
                });
            }
        }
    });

    return alerts.slice(0, 5); // Top 5
};
