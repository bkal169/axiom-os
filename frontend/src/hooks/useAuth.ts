import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContextSchema';

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    // FIX: AuthContext is initialised with null (not a default object), so this
    // check now correctly fires when a component is rendered outside <AuthProvider>.
    // Previously the context was initialised with a default object, meaning
    // `context === undefined` was always false and the guard was dead code — consumers
    // outside the provider would silently receive { loading: true, user: null }
    // instead of getting a clear error.
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
