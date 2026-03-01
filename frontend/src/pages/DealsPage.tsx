import React from 'react';
import { DealsBoard } from '../components/Deals/DealsBoard';

export const DealsPage: React.FC = () => {
    return (
        <div className="h-full">
            <DealsBoard />
        </div>
    );
}
// Note: We need to export default for lazy loading if used, but named export is fine for now.
export default DealsPage;
