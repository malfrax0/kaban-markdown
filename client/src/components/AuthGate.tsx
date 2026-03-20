import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, type ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthEnabled } from './AuthProvider';

export function AuthGate({ children }: { children: ReactNode }) {
    const authEnabled = useAuthEnabled();

    if (!authEnabled) {
        return <>{children}</>;
    }

    return <AuthGateInner>{children}</AuthGateInner>;
}

function AuthGateInner({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            loginWithRedirect();
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading || !isAuthenticated) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <CircularProgress color="primary" />
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Authenticating...
                </Typography>
            </Box>
        );
    }

    return <>{children}</>;
}
