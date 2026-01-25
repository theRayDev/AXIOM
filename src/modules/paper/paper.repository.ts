import { eq, or, ilike, desc, sql, inArray } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/config';
import * as schema from '@/shared/database/schema';

// Singleton Drizzle source
type DrizzleDB = PostgresJsDatabase<typeof schema>;
let _drizzle: DrizzleDB | null = null;

export function getDb(): DrizzleDB {
    if (!env.DATABASE_URL) {
        throw new Error('DATABASE_URL not configured');
    }

    if (!_drizzle) {
        const client = postgres(env.DATABASE_URL);
        _drizzle = drizzle(client, { schema });
    }
    return _drizzle!;
}

// Repository implementation
import { type PaperDb, type NewPaper, papers } from '@/shared/database/schema';
import { logger } from '@/shared/utils';

const log = logger.child({ context: 'paper-repo' });

export class PaperRepository {
    private get db() {
        return getDb();
    }

    async findById(id: string): Promise<PaperDb | undefined> {
        return this.db.query.papers.findFirst({
            where: eq(papers.id, id),
        });
    }

    async findByExternalId(externalId: string): Promise<PaperDb | undefined> {
        return this.db.query.papers.findFirst({
            where: eq(papers.externalId, externalId),
        });
    }

    async create(paper: NewPaper): Promise<PaperDb> {
        const result = await this.db.insert(papers).values(paper).returning();
        return result[0];
    }

    async upsert(paper: NewPaper): Promise<PaperDb> {
        // Conflict on externalId
        const result = await this.db
            .insert(papers)
            .values(paper)
            .onConflictDoUpdate({
                target: papers.externalId,
                set: {
                    title: paper.title,
                    updatedAt: new Date(),
                    citationCount: paper.citationCount,
                    // Add other fields that should update
                },
            })
            .returning();
        return result[0];
    }

    async search(query: string, limit = 20): Promise<PaperDb[]> {
        // Simple search for now
        return this.db.query.papers.findMany({
            where: ilike(papers.title, `%${query}%`),
            limit,
            orderBy: [desc(papers.publishedAt)],
        });
    }

    async findByCategory(category: string, limit = 20, offset = 0): Promise<PaperDb[]> {
        return this.db.query.papers.findMany({
            where: sql`${category} = ANY(${papers.categories})`,
            limit,
            offset,
            orderBy: [desc(papers.publishedAt)],
        });
    }
}
