import { useAuth0 } from '@auth0/auth0-react';
import { Typography, Box } from '@mui/material';
import { useAuthEnabled } from './AuthProvider';

export function LogoutButton() {
    const authEnabled = useAuthEnabled();

    if (!authEnabled) {
        return null;
    }

    return <LogoutButtonInner />;
}

function LogoutButtonInner() {
    const { logout, user } = useAuth0();

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 12,
                left: 16,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}
        >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.name ?? user?.email}
            </Typography>
            <Typography
                variant="caption"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { color: 'text.primary' },
                }}
            >
                Logout
            </Typography>
        </Box>
    );
}
