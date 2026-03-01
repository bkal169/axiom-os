import React from 'react';
import { CalculatorHub } from '../components/Calculators/CalculatorHub';

export const CalculatorsPage: React.FC = () => {
    return (
        <div className="h-full overflow-auto bg-gray-50">
            <CalculatorHub />
        </div>
    );
};
export default CalculatorsPage;
