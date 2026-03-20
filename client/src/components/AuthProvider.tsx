import { Auth0Provider } from '@auth0/auth0-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

interface Auth0Config {
    authEnabled: boolean;
    domain: string;
    clientId: string;
    audience: string;
    scope: string;
}

const AuthEnabledContext = createContext(true);
export const useAuthEnabled = () => useContext(AuthEnabledContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<Auth0Config | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get<Auth0Config>('/api/client_config')
            .then(res => setConfig(res.data))
            .catch(() => setError('Failed to load authentication configuration'));
    }, []);

    if (error) return <div style={{ color: 'white', padding: '2rem' }}>{error}</div>;
    if (!config) return null;

    if (!config.authEnabled) {
        return (
            <AuthEnabledContext.Provider value={false}>
                {children}
            </AuthEnabledContext.Provider>
        );
    }

    return (
        <AuthEnabledContext.Provider value={true}>
            <Auth0Provider
                domain={config.domain}
                clientId={config.clientId}
                authorizationParams={{
                    redirect_uri: window.location.origin,
                    audience: config.audience,
                    scope: config.scope,
                }}
            >
                {children}
            </Auth0Provider>
        </AuthEnabledContext.Provider>
    );
}
