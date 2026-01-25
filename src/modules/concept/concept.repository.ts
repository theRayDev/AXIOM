import { eq, ilike, desc, sql } from 'drizzle-orm';
import { getDb } from '@/modules/paper/paper.repository'; // Reuse db connection
import { concepts, type ConceptDb, type NewConcept } from '@/shared/database/schema';

export class ConceptRepository {
    private get db() {
        return getDb();
    }

    async findById(id: string): Promise<ConceptDb | undefined> {
        return this.db.query.concepts.findFirst({
            where: eq(concepts.id, id),
        });
    }

    async findBySlug(slug: string): Promise<ConceptDb | undefined> {
        return this.db.query.concepts.findFirst({
            where: eq(concepts.slug, slug),
        });
    }

    async findByField(field: string, limit = 50): Promise<ConceptDb[]> {
        return this.db.query.concepts.findMany({
            where: eq(concepts.field, field),
            limit,
        });
    }

    async create(concept: NewConcept): Promise<ConceptDb> {
        const result = await this.db.insert(concepts).values(concept).returning();
        return result[0];
    }

    async upsert(concept: NewConcept): Promise<ConceptDb> {
        const result = await this.db.insert(concepts)
            .values(concept)
            .onConflictDoUpdate({
                target: concepts.slug,
                set: {
                    name: concept.name,
                    description: concept.description,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return result[0];
    }

    async search(query: string, limit = 20): Promise<ConceptDb[]> {
        return this.db.query.concepts.findMany({
            where: ilike(concepts.name, `%${query}%`),
            limit,
        });
    }
}
