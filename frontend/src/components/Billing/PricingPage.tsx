
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';


const TIERS = [
    {
        name: 'Free',
        id: 'free',
        price: 0,
        description: 'For individuals exploring the market.',
        features: [
            '5 Active Deals',
            'Basic Mortgage Calculator',
            'Public Data Access',
            'Community Support',
        ],
        notIncluded: [
            'Export to PDF/CSV',
            'Advanced ROI Calculators',
            'Intel Record Linking',
            'Priority Support',
        ],
    },
    {
        name: 'Pro',
        id: 'pro',
        price: 29,
        description: 'For serious investors building a portfolio.',
        features: [
            'Unlimited Deals',
            'All Calculators (ROI, Dev Profit)',
            'PDF & CSV Exports',
            'Intel Record Linking',
            'Email Support',
        ],
        notIncluded: [
            'Team Collaboration',
            'API Access',
        ],
        recommended: true,
    },
    {
        name: 'Pro+',
        id: 'pro_plus',
        price: 99,
        description: 'For agencies and teams scaling up.',
        features: [
            'Everything in Pro',
            'Team Collaboration (Up to 5 seats)',
            'API Access',
            'Dedicated Account Manager',
            'Custom Branding',
        ],
        notIncluded: [],
    },
];

export const PricingPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null); // loading tier id

    const handleSubscribe = async (tierId: string) => {
        if (!user) {
            alert('Please log in to upgrade.');
            return;
        }
        setLoading(tierId);

        // Simulation of creating a checkout session
        /*
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { priceId: tierId, userId: user.id }
        });
        if (data?.url) window.location.href = data.url;
        */

        // For MVP Demo, we'll just mock the "upgrade" action or show an alert
        setTimeout(() => {
            alert(`Redirecting to Stripe Checkout for ${tierId} tier... (Mock)`);
            setLoading(null);
        }, 1000);
    };

    return (
        <div className="min-h-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="text-center">
                <h2 className="text-base font-semibold text-emerald-600 tracking-wide uppercase">Pricing</h2>
                <p className="mt-1 text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Choose your plan
                </p>
                <p className="max-w-xl mt-5 mx-auto text-xl text-slate-500">
                    Start small and scale as your portfolio grows. No hidden fees.
                </p>
            </div>

            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-7xl lg:mx-auto lg:grid-cols-3 xl:gap-8">
                {TIERS.map((tier) => (
                    <div key={tier.name} className={`border rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col ${tier.recommended ? 'ring-2 ring-emerald-500 relative' : 'border-slate-200'}`}>
                        {tier.recommended && (
                            <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                Most Popular
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-slate-900">{tier.name}</h2>
                            <p className="mt-4">
                                <span className="text-4xl font-extrabold text-slate-900">${tier.price}</span>
                                <span className="text-base font-medium text-slate-500">/mo</span>
                            </p>
                            <p className="mt-4 text-sm text-slate-500">{tier.description}</p>
                            <button
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={!!loading || profile?.subscription_tier === tier.id.toUpperCase()}
                                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${profile?.subscription_tier === tier.id.toUpperCase()
                                    ? 'bg-slate-100 text-slate-500 cursor-default'
                                    : tier.recommended
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {loading === tier.id ? 'Processing...' : profile?.subscription_tier === tier.id.toUpperCase() ? 'Current Plan' : `Subscribe to ${tier.name}`}
                            </button>
                        </div>
                        <div className="pt-6 pb-8 px-6 flex-1 flex flex-col">
                            <h3 className="text-xs font-medium text-slate-900 tracking-wide uppercase">What's included</h3>
                            <ul role="list" className="mt-6 space-y-4 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex space-x-3">
                                        <Check className="flex-shrink-0 h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        <span className="text-sm text-slate-500">{feature}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map((feature) => (
                                    <li key={feature} className="flex space-x-3 text-slate-300">
                                        <X className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
