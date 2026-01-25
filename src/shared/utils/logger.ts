import pino from 'pino';
import { env } from '@/config';

/**
 * Structured logger using Pino
 * - JSON output in production
 * - Pretty output in development
 */

export const logger = pino({
    level: env.isDev ? 'debug' : 'info',

    // Pretty print in development
    transport: env.isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,

    // Base context
    base: {
        env: env.NODE_ENV,
    },

    // Redact sensitive fields
    redact: ['password', 'token', 'apiKey', 'authorization'],
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: string) {
    return logger.child({ context });
}

// Pre-configured loggers for common contexts
export const dbLogger = createLogger('database');
export const graphqlLogger = createLogger('graphql');
export const cacheLogger = createLogger('cache');
export const apiLogger = createLogger('api');
