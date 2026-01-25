import { type PaperSourceAdapter } from './source.interface';
import { type NormalizedPaper, type Author } from '../paper.types';
import { logger, ExternalServiceError } from '@/shared/utils';
import { env } from '@/config';

const log = logger.child({ context: 'semantic-scholar-adapter' });

export class SemanticScholarAdapter implements PaperSourceAdapter {
    name = 'semantic_scholar';
    private baseUrl = 'https://api.semanticscholar.org/graph/v1';

    private get headers() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (env.SEMANTIC_SCHOLAR_API_KEY) {
            headers['x-api-key'] = env.SEMANTIC_SCHOLAR_API_KEY;
        }
        return headers;
    }

    /**
     * Fetch a single paper
     * Supports various ID types: S2PaperId, DOI, ArXivId, etc.
     * e.g. "arxiv:1705.10311"
     */
    async fetchPaper(id: string): Promise<any | null> {
        const fields = 'paperId,externalIds,title,abstract,authors,year,venue,publicationDate,openAccessPdf,fieldsOfStudy,s2FieldsOfStudy,citationCount,referenceCount';
        const url = `${this.baseUrl}/paper/${id}?fields=${fields}`;

        try {
            const response = await fetch(url, { headers: this.headers });

            if (response.status === 404) return null;
            if (!response.ok) {
                throw new ExternalServiceError('SemanticScholar', `Fetch failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            log.error({ error, id }, 'Fetch failed');
            return null;
        }
    }

    /**
     * Search papers
     */
    async searchPapers(query: string, limit: number = 10): Promise<any[]> {
        const fields = 'paperId,externalIds,title,abstract,authors,year,publicationDate,openAccessPdf,citationCount';
        const url = `${this.baseUrl}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;

        try {
            const response = await fetch(url, { headers: this.headers });
            if (!response.ok) {
                throw new ExternalServiceError('SemanticScholar', `Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            log.error({ error, query }, 'Search failed');
            return [];
        }
    }

    /**
     * Normalize S2 response to domain model
     */
    normalize(raw: any): NormalizedPaper {
        // Prefer ArXiv ID if available, otherwise S2 ID
        const arxivId = raw.externalIds?.ArXiv;
        const externalId = arxivId ? `arxiv:${arxivId}` : `s2:${raw.paperId}`;

        const authors: Author[] = (raw.authors || []).map((a: any) => ({
            name: a.name,
            externalId: a.paperId, // S2 author ID
            affiliation: a.affiliations?.[0],
        }));

        const categories = (raw.s2FieldsOfStudy || []).map((f: any) => f.category)
            .concat(raw.fieldsOfStudy || []);

        // Deduplicate categories
        const uniqueCategories = [...new Set(categories)] as string[];

        return {
            externalId,
            source: 'semantic_scholar',
            title: raw.title,
            authors,
            rawAbstract: raw.abstract || '',
            publication: raw.venue || '',
            publishedAt: raw.publicationDate ? new Date(raw.publicationDate) : new Date(raw.year, 0, 1),
            updatedAt: new Date(), // S2 doesn't give update time
            categories: uniqueCategories,
            pdfUrl: raw.openAccessPdf?.url,
            sourceUrl: raw.url || `https://www.semanticscholar.org/paper/${raw.paperId}`,
            metadata: {
                s2Id: raw.paperId,
                doi: raw.externalIds?.DOI,
                citationCount: raw.citationCount,
                referenceCount: raw.referenceCount,
            },
        };
    }
}
