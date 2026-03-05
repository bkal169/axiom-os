import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AuthGate: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <Loader2 className="animate-spin" size={32} color="#D4A843" />
                    <div style={{ fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Synchronizing Axiom...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

