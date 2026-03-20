import { describe, it, expect, vi } from 'vitest';

const { _capture } = vi.hoisted(() => {
    const _capture: { interceptorFn?: (config: any) => Promise<any> } = {};
    return { _capture };
});

vi.mock('axios', () => {
    const interceptors = {
        request: {
            use: vi.fn((fn: any) => {
                _capture.interceptorFn = fn;
            }),
        },
        response: { use: vi.fn() },
    };
    return {
        default: {
            create: vi.fn(() => ({
                interceptors,
                get: vi.fn(),
                post: vi.fn(),
                put: vi.fn(),
                delete: vi.fn(),
            })),
        },
    };
});

// Import the module under test — this registers the interceptor
import { setAccessTokenGetter } from '../../src/api';

describe('api interceptor', () => {
    it('does not attach header when no token getter is set', async () => {
        const config = { headers: {} as any };
        const result = await _capture.interceptorFn!(config);
        expect(result.headers.Authorization).toBeUndefined();
    });

    it('attaches Authorization header when token getter is set', async () => {
        const mockGetter = vi.fn().mockResolvedValue('test-token-123');
        setAccessTokenGetter(mockGetter);

        const config = { headers: {} as any };
        const result = await _capture.interceptorFn!(config);

        expect(mockGetter).toHaveBeenCalled();
        expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });
});
