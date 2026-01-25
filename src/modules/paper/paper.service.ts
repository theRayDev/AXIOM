import { PaperRepository } from './paper.repository';
import { ArxivAdapter } from './sources/arxiv.adapter';
import { cache, cacheKeys, CACHE_TTL } from '@/shared/cache';
import { logger } from '@/shared/utils';
import type { NormalizedPaper } from './paper.types';

const log = logger.child({ context: 'paper-service' });

export class PaperService {
    private repo: PaperRepository;
    private arxiv: ArxivAdapter;

    constructor() {
        this.repo = new PaperRepository();
        this.arxiv = new ArxivAdapter();
    }

    /**
     * Get paper by ID (Internal UUID or External ID)
     */
    async getPaper(id: string): Promise<NormalizedPaper | null> {
        // Check if it's an internal UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(id);

        if (isUuid) {
            const cached = await cache.get<NormalizedPaper>(cacheKeys.paper(id));
            if (cached) return cached;

            const dbPaper = await this.repo.findById(id);
            if (dbPaper) {
                // Transform DB to domain model
                const domainPaper = this.mapDbToDomain(dbPaper);
                await cache.set(cacheKeys.paper(id), domainPaper, CACHE_TTL.PAPER_DETAIL);
                return domainPaper;
            }
            return null;
        }

        // It's an external ID (e.g. arxiv:1234.5678)
        const externalId = id;

        // Try finding by external ID in DB first
        const dbPaper = await this.repo.findByExternalId(externalId);
        if (dbPaper) {
            return this.mapDbToDomain(dbPaper);
        }

        // Not in DB, fetch from source
        if (externalId.startsWith('arxiv:')) {
            const rawId = externalId.replace('arxiv:', '');
            const raw = await this.arxiv.fetchPaper(rawId);

            if (raw) {
                const normalized = this.arxiv.normalize(raw);
                // Persist to DB since user requested it
                const saved = await this.ingest(normalized);
                return saved;
            }
        }

        return null;
    }

    /**
     * Search papers (Live from ArXiv + Cache)
     */
    async searchPapers(query: string): Promise<NormalizedPaper[]> {
        const cacheKey = cacheKeys.paperSearch(Buffer.from(query).toString('base64'));

        const cached = await cache.get<NormalizedPaper[]>(cacheKey);
        if (cached) return cached;

        const results = await this.arxiv.searchPapers(query);
        const normalized = results.map(r => this.arxiv.normalize(r));

        await cache.set(cacheKey, normalized, CACHE_TTL.SEARCH_RESULTS);

        // Background ingest
        Promise.allSettled(normalized.map(p => this.ingest(p))).catch(err => {
            log.warn({ err }, 'Background ingest failed');
        });

        return normalized;
    }

    /**
     * Ingest a paper into the database
     */
    async ingest(paper: NormalizedPaper): Promise<NormalizedPaper> {
        try {
            const saved = await this.repo.upsert({
                externalId: paper.externalId,
                source: paper.source,
                title: paper.title,
                authors: paper.authors,
                rawAbstract: paper.rawAbstract,
                publishedAt: paper.publishedAt,
                categories: paper.categories,
                metadata: paper.metadata,
                pdfUrl: paper.pdfUrl,
                sourceUrl: paper.sourceUrl,
                difficultyLevel: 'intermediate',
            } as any);

            return this.mapDbToDomain(saved);
        } catch (error) {
            log.error({ error, paperId: paper.externalId }, 'Ingest failed');
            throw error;
        }
    }

    private mapDbToDomain(db: any): NormalizedPaper {
        return {
            ...db,
            // Ensure types match domain expectations if needed
        };
    }
}
