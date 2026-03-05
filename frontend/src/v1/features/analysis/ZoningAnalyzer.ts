/**
 * ZoningAnalyzer.ts
 * Heuristic engine to calculate Build-out Potential based on spatial zoning constraints.
 */

export interface ZoningConstraints {
    maxFAR: number;        // Floor Area Ratio
    maxHeight: number;     // Feet / Floors
    setbacks: {           // Feet
        front: number;
        rear: number;
        side: number;
    };
    lotArea: number;       // Square Feet
}

export interface BuildOutResult {
    maxGFA: number;        // Gross Floor Area
    potentialUnits: number;
    footprintArea: number;
    efficiencyRatio: number;
}

export const ZoningAnalyzer = {
    calculateBuildOut: (params: ZoningConstraints): BuildOutResult => {
        const { lotArea, maxFAR, setbacks } = params;

        // Simplified footprint calculation assuming rectangular lot
        // In a real scenario, this would use GIS polygon geometry
        const width = Math.sqrt(lotArea);
        const effectiveWidth = Math.max(0, width - (setbacks.side * 2));
        const effectiveDepth = Math.max(0, width - (setbacks.front + setbacks.rear));

        const footprintArea = effectiveWidth * effectiveDepth;
        const maxGFA = lotArea * maxFAR;

        // Assumption: 1000 sqft average unit size
        const potentialUnits = Math.floor(maxGFA / 1000);

        return {
            maxGFA,
            potentialUnits,
            footprintArea,
            efficiencyRatio: 0.85 // Default high-efficiency assume
        };
    },

    getHeuristicZoning: (zone: string): ZoningConstraints => {
        // Mock data based on typical US urban zoning codes
        const zones: Record<string, ZoningConstraints> = {
            "R-1": { maxFAR: 0.5, maxHeight: 35, lotArea: 5000, setbacks: { front: 20, rear: 20, side: 5 } },
            "C-2": { maxFAR: 3.5, maxHeight: 80, lotArea: 10000, setbacks: { front: 0, rear: 10, side: 0 } },
            "M-1": { maxFAR: 6.0, maxHeight: 150, lotArea: 20000, setbacks: { front: 5, rear: 15, side: 8 } },
        };

        return zones[zone] || zones["R-1"];
    }
};
