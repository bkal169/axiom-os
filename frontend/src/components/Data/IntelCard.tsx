import React from 'react';
import { type IntelRecord, INTEL_LABELS } from '../../types/intel';
import { MapPin, Tag } from 'lucide-react';

interface IntelCardProps {
    record: IntelRecord;
    onClick: (record: IntelRecord) => void;
}

export const IntelCard: React.FC<IntelCardProps> = ({ record, onClick }) => {
    return (
        <div
            onClick={() => onClick(record)}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {INTEL_LABELS[record.record_type]}
                </span>
                {record.internal_only && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Internal
                    </span>
                )}
            </div>

            <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-slate-900 line-clamp-2">
                {record.title}
            </h3>

            <div className="flex items-center text-xs text-slate-500 mb-3">
                <MapPin size={12} className="mr-1" />
                {record.city ? `${record.city}, ${record.state}` : `${record.county}, ${record.state}`}
            </div>

            <div className="flex flex-wrap gap-1 mt-auto">
                {record.geo_tags.map(tag => (
                    <span key={tag} className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center">
                        <Tag size={8} className="mr-1" />
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};
