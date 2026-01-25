import { XMLParser } from 'fast-xml-parser';
import { type PaperSourceAdapter } from './source.interface';
import { type ArxivRaw, type Author } from '../paper.types';
import { logger, ExternalServiceError } from '@/shared/utils';
import { ARXIV_CATEGORIES } from '@/config';

const log = logger.child({ context: 'arxiv-adapter' });

export class ArxivAdapter implements PaperSourceAdapter {
    name = 'arxiv';
    private parser: XMLParser;
    private baseUrl = 'http://export.arxiv.org/api/query';

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        });
    }

    /**
     * Fetch a single paper by ID
     */
    async fetchPaper(id: string): Promise<ArxivRaw | null> {
        // Strip version number if present (e.g., v1) for search
        const cleanId = id.replace(/v\d+$/, '');

        try {
            const response = await fetch(`${this.baseUrl}?id_list=${cleanId}`);
            if (!response.ok) {
                throw new ExternalServiceError('ArXiv', `Fetch failed: ${response.statusText}`);
            }

            const xml = await response.text();
            const parsed = this.parser.parse(xml);

            const entry = parsed.feed?.entry;
            if (!entry) return null;

            // XMLParser handles single entry vs array automatically? 
            // Need to be careful. Usually entry is object if single, array if multiple.
            // id_list with 1 id returns single entry if found.

            return entry as ArxivRaw;
        } catch (error) {
            log.error({ error, id }, 'Failed to fetch paper from ArXiv');
            throw new ExternalServiceError('ArXiv', 'Failed to parse response');
        }
    }

    /**
     * Search papers
     */
    async searchPapers(query: string, limit: number = 10): Promise<ArxivRaw[]> {
        try {
            // Basic query construction
            // ArXiv supports prefix: ti, au, abs, cat, all
            // We'll use all:query
            const encQuery = encodeURIComponent(`all:${query}`);
            const url = `${this.baseUrl}?search_query=${encQuery}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new ExternalServiceError('ArXiv', `Search failed: ${response.statusText}`);
            }

            const xml = await response.text();
            const parsed = this.parser.parse(xml);

            const entries = parsed.feed?.entry;
            if (!entries) return [];

            return Array.isArray(entries) ? entries : [entries];
        } catch (error) {
            log.error({ error, query }, 'Search failed');
            return [];
        }
    }

    /**
     * Fetch by Category
     */
    async fetchByCategory(category: string, limit: number = 10): Promise<ArxivRaw[]> {
        const encCat = encodeURIComponent(`cat:${category}`);
        const url = `${this.baseUrl}?search_query=${encCat}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;

        try {
            const response = await fetch(url);
            const xml = await response.text();
            const parsed = this.parser.parse(xml);

            const entries = parsed.feed?.entry;
            if (!entries) return [];

            return Array.isArray(entries) ? entries : [entries];
        } catch (error) {
            log.error({ error, category }, 'Category fetch failed');
            return [];
        }
    }

    /**
     * Normalize ArXiv raw data to our domain model
     */
    normalize(raw: ArxivRaw) {
        // Extract ID (ArXiv returns full URL http://arxiv.org/abs/2101.00001)
        const id = raw.id.split('/abs/').pop() || raw.id;

        // Extract version
        const versionMatch = id.match(/v(\d+)$/);
        const version = versionMatch ? parseInt(versionMatch[1]) : 1;
        const cleanId = id.replace(/v\d+$/, '');

        // Normalize authors
        const authors = Array.isArray(raw.author)
            ? raw.author.map(a => ({ name: a.name }))
            : [{ name: raw.author.name }];

        // Normalize categories
        // raw.category can be array or single object
        const rawCats = Array.isArray(raw.category) ? raw.category : [raw.category];
        const categories = rawCats.map(c => c.term);

        // Find PDF link
        const pdfLink = raw.link.find(l => l.title === 'pdf')?.href || raw.link.find(l => l.type === 'application/pdf')?.href;

        // Clean abstract (remove newlines usually present in ArXiv XML)
        const abstract = raw.summary.replace(/[\r\n]+/g, ' ').trim();

        return {
            externalId: `arxiv:${cleanId}`,
            source: 'arxiv',
            title: raw.title.replace(/[\r\n]+/g, ' ').trim(),
            authors,
            rawAbstract: abstract,
            publication: raw['arxiv:journal_ref']?.['#text'],
            publishedAt: new Date(raw.published),
            updatedAt: new Date(raw.updated),
            categories,
            pdfUrl: pdfLink,
            sourceUrl: raw.id, // The ID field in atom feed is the URL
            metadata: {
                arxivVersion: version,
                doi: raw['arxiv:doi']?.['#text'],
                comment: raw['arxiv:comment']?.['#text'],
            },
        };
    }
}
