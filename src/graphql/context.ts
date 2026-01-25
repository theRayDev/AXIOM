import type { IncomingMessage } from 'http';
import { getOrCreateAnonymousUser, parseSessionToken, isAnonymousId } from '@/shared/auth';
import { graphqlLogger } from '@/shared/utils';

/**
 * GraphQL Context
 * Provides user info and services to all resolvers
 */

export interface AxiomContext {
    // Current user (anonymous or registered)
    user: {
        id: string;
        isAnonymous: boolean;
        sessionId: string;
    } | null;

    // Request info
    requestId: string;

    // Logger
    log: typeof graphqlLogger;
}

/**
 * Create context for each GraphQL request
 */
export async function createContext(request: Request): Promise<AxiomContext> {
    const requestId = crypto.randomUUID();
    const log = graphqlLogger.child({ requestId });

    // Get session token from headers or cookies
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let sessionId = parseSessionToken(authHeader ?? undefined);

    // Fallback to cookie
    if (!sessionId && cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        sessionId = cookies['axiom_session'] || cookies['axiom_anon_id'];
    }

    // Get or create user
    let user: AxiomContext['user'] = null;

    try {
        const userResult = await getOrCreateAnonymousUser(sessionId || undefined);
        user = {
            id: userResult.id,
            isAnonymous: userResult.isAnonymous,
            sessionId: userResult.sessionId,
        };
        log.debug({ userId: user.id, isAnonymous: user.isAnonymous }, 'User context created');
    } catch (error) {
        log.warn({ error }, 'Failed to get/create user, continuing without user context');
    }

    return {
        user,
        requestId,
        log,
    };
}

/**
 * Simple cookie parser
 */
function parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    cookieHeader.split(';').forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name) {
            cookies[name] = valueParts.join('=');
        }
    });

    return cookies;
}

/**
 * Context helper to require authenticated user
 */
export function requireUser(context: AxiomContext): { id: string; isAnonymous: boolean } {
    if (!context.user) {
        throw new Error('Authentication required');
    }
    return context.user;
}

/**
 * Context helper to require registered (non-anonymous) user
 */
export function requireRegisteredUser(context: AxiomContext): { id: string } {
    const user = requireUser(context);
    if (user.isAnonymous) {
        throw new Error('Please create an account to access this feature');
    }
    return { id: user.id };
}
