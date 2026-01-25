import { GraphQLScalarType, Kind } from 'graphql';

/**
 * Custom GraphQL scalar types
 */

// DateTime scalar for timestamp handling
export const DateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'A date-time string in ISO 8601 format',

    serialize(value: unknown): string {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            return new Date(value).toISOString();
        }
        throw new Error('DateTime must be a Date instance or ISO string');
    },

    parseValue(value: unknown): Date {
        if (typeof value === 'string') {
            return new Date(value);
        }
        throw new Error('DateTime must be a string');
    },

    parseLiteral(ast): Date {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        throw new Error('DateTime must be a string');
    },
});

// JSON scalar for flexible object storage
export const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'A JSON object',

    serialize(value: unknown): unknown {
        return value;
    },

    parseValue(value: unknown): unknown {
        return value;
    },

    parseLiteral(ast): unknown {
        if (ast.kind === Kind.STRING) {
            try {
                return JSON.parse(ast.value);
            } catch {
                return ast.value;
            }
        }
        if (ast.kind === Kind.OBJECT) {
            // Handle inline objects
            return ast.fields.reduce((acc, field) => {
                acc[field.name.value] = parseLiteralValue(field.value);
                return acc;
            }, {} as Record<string, unknown>);
        }
        return null;
    },
});

// Helper for parsing literal values
function parseLiteralValue(ast: any): unknown {
    switch (ast.kind) {
        case Kind.STRING:
            return ast.value;
        case Kind.INT:
            return parseInt(ast.value, 10);
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.NULL:
            return null;
        case Kind.LIST:
            return ast.values.map(parseLiteralValue);
        case Kind.OBJECT:
            return ast.fields.reduce((acc: Record<string, unknown>, field: any) => {
                acc[field.name.value] = parseLiteralValue(field.value);
                return acc;
            }, {});
        default:
            return null;
    }
}

export const scalarResolvers = {
    DateTime: DateTimeScalar,
    JSON: JSONScalar,
};
