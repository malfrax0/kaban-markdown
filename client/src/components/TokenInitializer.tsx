import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setAccessTokenGetter } from '../api';
import { useAuthEnabled } from './AuthProvider';

export function TokenInitializer() {
    const authEnabled = useAuthEnabled();

    if (!authEnabled) {
        return null;
    }

    return <TokenInitializerInner />;
}

function TokenInitializerInner() {
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        setAccessTokenGetter(getAccessTokenSilently);
    }, [getAccessTokenSilently]);

    return null;
}
