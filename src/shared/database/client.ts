import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config';
import { dbLogger } from '@/shared/utils';

/**
 * Supabase client singleton
 * Used for database operations, auth, and real-time subscriptions
 */

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get the public Supabase client (uses anon key)
 * Safe to use in client-side code
 */
export function getSupabase(): SupabaseClient {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        dbLogger.warn('Supabase credentials not configured');
        throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    if (!supabaseClient) {
        supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
            },
        });
        dbLogger.info('Supabase client initialized');
    }

    return supabaseClient;
}

/**
 * Get the admin Supabase client (uses service role key)
 * Only use in server-side code - bypasses RLS
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        dbLogger.warn('Supabase admin credentials not configured');
        throw new Error('Supabase admin not configured. Please set SUPABASE_SERVICE_ROLE_KEY');
    }

    if (!supabaseAdminClient) {
        supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        dbLogger.info('Supabase admin client initialized');
    }

    return supabaseAdminClient;
}

/**
 * Database helper to handle common query patterns
 */
export async function dbQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
    const client = getSupabase();
    const { data, error } = await queryFn(client);

    if (error) {
        dbLogger.error({ error }, 'Database query failed');
        throw error;
    }

    if (data === null) {
        throw new Error('Query returned null');
    }

    return data;
}

/**
 * Admin database helper (bypasses RLS)
 */
export async function dbAdminQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
    const client = getSupabaseAdmin();
    const { data, error } = await queryFn(client);

    if (error) {
        dbLogger.error({ error }, 'Admin database query failed');
        throw error;
    }

    if (data === null) {
        throw new Error('Query returned null');
    }

    return data;
}

// Export types
export type { SupabaseClient };
