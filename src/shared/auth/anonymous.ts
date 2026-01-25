import { nanoid } from 'nanoid';
import { getSupabase } from '@/shared/database';
import { logger } from '@/shared/utils';

const authLogger = logger.child({ context: 'auth' });

/**
 * Anonymous User System
 * 
 * AXIOM is anonymous-first. Users can:
 * 1. Explore without creating an account
 * 2. Have their curiosity graph tracked via anonymous ID
 * 3. Optionally convert to a registered account later
 */

// Anonymous user ID prefix for identification
const ANON_PREFIX = 'anon_';

/**
 * Generate a new anonymous user ID
 */
export function generateAnonymousId(): string {
    return `${ANON_PREFIX}${nanoid(21)}`;
}

/**
 * Check if an ID is anonymous
 */
export function isAnonymousId(id: string): boolean {
    return id.startsWith(ANON_PREFIX);
}

/**
 * Create an anonymous user in the database
 */
export async function createAnonymousUser(sessionId?: string): Promise<{
    id: string;
    isAnonymous: true;
    sessionId: string;
}> {
    const anonymousId = generateAnonymousId();
    const sid = sessionId || nanoid(32);

    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('users')
            .insert({
                id: anonymousId,
                is_anonymous: true,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            authLogger.error({ error }, 'Failed to create anonymous user');
            throw error;
        }

        authLogger.info({ userId: anonymousId }, 'Anonymous user created');

        return {
            id: data.id,
            isAnonymous: true,
            sessionId: sid,
        };
    } catch (error) {
        // If database is not available, return a client-side only anonymous user
        authLogger.warn('Database unavailable, using client-side anonymous ID');
        return {
            id: anonymousId,
            isAnonymous: true,
            sessionId: sid,
        };
    }
}

/**
 * Get or create an anonymous user from a session ID
 */
export async function getOrCreateAnonymousUser(sessionId?: string): Promise<{
    id: string;
    isAnonymous: boolean;
    sessionId: string;
}> {
    // If no session ID, create new anonymous user
    if (!sessionId) {
        return createAnonymousUser();
    }

    try {
        const supabase = getSupabase();

        // Try to find existing user by session
        // Note: In production, you'd want a sessions table
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, is_anonymous')
            .eq('id', sessionId)
            .single();

        if (existingUser) {
            return {
                id: existingUser.id,
                isAnonymous: existingUser.is_anonymous,
                sessionId,
            };
        }
    } catch {
        // User not found or DB error, create new
    }

    return createAnonymousUser(sessionId);
}

/**
 * Convert an anonymous user to a registered user
 */
export async function convertToRegisteredUser(
    anonymousId: string,
    email: string,
    username: string,
    displayName?: string
): Promise<{ success: boolean; userId: string }> {
    if (!isAnonymousId(anonymousId)) {
        throw new Error('User is already registered');
    }

    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('users')
            .update({
                is_anonymous: false,
                email,
                username,
                display_name: displayName || username,
                updated_at: new Date().toISOString(),
            })
            .eq('id', anonymousId)
            .select()
            .single();

        if (error) {
            authLogger.error({ error, anonymousId }, 'Failed to convert anonymous user');
            throw error;
        }

        authLogger.info({ userId: data.id, email }, 'Anonymous user converted to registered');

        return { success: true, userId: data.id };
    } catch (error) {
        throw error;
    }
}

/**
 * Session token helpers
 */
export function parseSessionToken(token: string | undefined): string | null {
    if (!token) return null;

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
        return token.slice(7);
    }

    return token;
}

export function createSessionToken(userId: string): string {
    // Simple token format for anonymous users
    // In production with auth, use proper JWT
    return `${userId}:${nanoid(16)}`;
}
