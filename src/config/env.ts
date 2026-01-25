import { z } from 'zod';

/**
 * Environment configuration with validation
 * All environment variables are validated at startup
 */

const envSchema = z.object({
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Database (direct connection for Drizzle)
    DATABASE_URL: z.string().optional(),

    // Redis (Upstash)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // App
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

    // External APIs
    SEMANTIC_SCHOLAR_API_KEY: z.string().optional(),
});

// Parse and validate environment
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    // Don't throw in development if optional vars are missing
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables');
    }
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Supabase
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // Redis
    REDIS_URL: process.env.UPSTASH_REDIS_REST_URL || '',
    REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',

    // App
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // External APIs
    SEMANTIC_SCHOLAR_API_KEY: process.env.SEMANTIC_SCHOLAR_API_KEY || '',

    // Helpers
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
};

export type Env = typeof env;
