/**
 * Custom error classes for AXIOM
 * Provides consistent error handling across the application
 */

// Base error class
export class AxiomError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'INTERNAL_ERROR',
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
        };
    }
}

// ==============================================
// AUTHENTICATION ERRORS
// ==============================================

export class AuthenticationError extends AxiomError {
    constructor(message: string = 'Authentication required') {
        super(message, 'UNAUTHENTICATED', 401);
    }
}

export class AuthorizationError extends AxiomError {
    constructor(message: string = 'Not authorized') {
        super(message, 'FORBIDDEN', 403);
    }
}

// ==============================================
// RESOURCE ERRORS
// ==============================================

export class NotFoundError extends AxiomError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(message, 'NOT_FOUND', 404);
    }
}

export class ConflictError extends AxiomError {
    constructor(message: string) {
        super(message, 'CONFLICT', 409);
    }
}

// ==============================================
// VALIDATION ERRORS
// ==============================================

export class ValidationError extends AxiomError {
    public readonly details: Record<string, string[]>;

    constructor(message: string, details: Record<string, string[]> = {}) {
        super(message, 'VALIDATION_ERROR', 400);
        this.details = details;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

export class InvalidInputError extends AxiomError {
    constructor(message: string) {
        super(message, 'INVALID_INPUT', 400);
    }
}

// ==============================================
// EXTERNAL SERVICE ERRORS
// ==============================================

export class ExternalServiceError extends AxiomError {
    public readonly service: string;

    constructor(service: string, message: string) {
        super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
        this.service = service;
    }
}

export class RateLimitError extends AxiomError {
    public readonly retryAfter: number;

    constructor(retryAfter: number = 60) {
        super('Rate limit exceeded', 'RATE_LIMIT', 429);
        this.retryAfter = retryAfter;
    }
}

// ==============================================
// DATABASE ERRORS
// ==============================================

export class DatabaseError extends AxiomError {
    constructor(message: string) {
        super(message, 'DATABASE_ERROR', 500);
    }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export function isAxiomError(error: unknown): error is AxiomError {
    return error instanceof AxiomError;
}

export function formatError(error: unknown): { message: string; code: string } {
    if (isAxiomError(error)) {
        return { message: error.message, code: error.code };
    }

    if (error instanceof Error) {
        return { message: error.message, code: 'INTERNAL_ERROR' };
    }

    return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}
