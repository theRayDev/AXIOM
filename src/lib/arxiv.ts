// ArXiv API utility functions
// ArXiv provides a free API that returns paper metadata in Atom/XML format

export interface ArxivPaper {
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    categories: string[];
    published: string;
    updated: string;
    pdfUrl: string;
    arxivUrl: string;
}

interface ArxivSearchParams {
    query: string;
    maxResults?: number;
    start?: number;
    sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
    sortOrder?: 'ascending' | 'descending';
}

/**
 * Search ArXiv for papers matching the query
 */
export async function searchArxiv(params: ArxivSearchParams): Promise<ArxivPaper[]> {
    const {
        query,
        maxResults = 10,
        start = 0,
        sortBy = 'relevance',
        sortOrder = 'descending',
    } = params;

    // Build the ArXiv API URL
    const baseUrl = 'https://export.arxiv.org/api/query';
    const searchUrl = new URL(baseUrl);

    // ArXiv uses 'all:' prefix for general search
    searchUrl.searchParams.set('search_query', `all:${encodeURIComponent(query)}`);
    searchUrl.searchParams.set('start', start.toString());
    searchUrl.searchParams.set('max_results', maxResults.toString());
    searchUrl.searchParams.set('sortBy', sortBy);
    searchUrl.searchParams.set('sortOrder', sortOrder);

    try {
        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
            throw new Error(`ArXiv API error: ${response.status}`);
        }

        const xmlText = await response.text();
        return parseArxivResponse(xmlText);
    } catch (error) {
        console.error('Error fetching from ArXiv:', error);
        throw error;
    }
}

/**
 * Get papers by category (e.g., 'cs.AI', 'cs.LG', 'physics.quant-ph')
 */
export async function getArxivByCategory(
    category: string,
    maxResults: number = 10
): Promise<ArxivPaper[]> {
    const baseUrl = 'https://export.arxiv.org/api/query';
    const searchUrl = new URL(baseUrl);

    searchUrl.searchParams.set('search_query', `cat:${category}`);
    searchUrl.searchParams.set('max_results', maxResults.toString());
    searchUrl.searchParams.set('sortBy', 'submittedDate');
    searchUrl.searchParams.set('sortOrder', 'descending');

    try {
        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
            throw new Error(`ArXiv API error: ${response.status}`);
        }

        const xmlText = await response.text();
        return parseArxivResponse(xmlText);
    } catch (error) {
        console.error('Error fetching from ArXiv:', error);
        throw error;
    }
}

/**
 * Get a specific paper by its ArXiv ID
 */
export async function getArxivPaper(arxivId: string): Promise<ArxivPaper | null> {
    const baseUrl = 'https://export.arxiv.org/api/query';
    const searchUrl = new URL(baseUrl);

    searchUrl.searchParams.set('id_list', arxivId);

    try {
        const response = await fetch(searchUrl.toString());

        if (!response.ok) {
            throw new Error(`ArXiv API error: ${response.status}`);
        }

        const xmlText = await response.text();
        const papers = parseArxivResponse(xmlText);
        return papers.length > 0 ? papers[0] : null;
    } catch (error) {
        console.error('Error fetching paper from ArXiv:', error);
        throw error;
    }
}

/**
 * Parse ArXiv XML response into structured paper objects
 */
function parseArxivResponse(xmlText: string): ArxivPaper[] {
    const papers: ArxivPaper[] = [];

    // Use regex to extract entries since we can't use DOMParser in all environments
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let entryMatch;

    while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
        const entryXml = entryMatch[1];

        // Extract ID
        const idMatch = entryXml.match(/<id>([^<]+)<\/id>/);
        const fullId = idMatch ? idMatch[1] : '';
        const arxivId = fullId.replace('http://arxiv.org/abs/', '');

        // Extract title (remove newlines and extra whitespace)
        const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch
            ? titleMatch[1].replace(/\s+/g, ' ').trim()
            : 'Untitled';

        // Extract abstract/summary
        const summaryMatch = entryXml.match(/<summary>([^<]+)<\/summary>/);
        const abstract = summaryMatch
            ? summaryMatch[1].replace(/\s+/g, ' ').trim()
            : '';

        // Extract authors
        const authorRegex = /<author>\s*<name>([^<]+)<\/name>/g;
        const authors: string[] = [];
        let authorMatch;
        while ((authorMatch = authorRegex.exec(entryXml)) !== null) {
            authors.push(authorMatch[1].trim());
        }

        // Extract categories
        const categoryRegex = /<category[^>]*term="([^"]+)"/g;
        const categories: string[] = [];
        let catMatch;
        while ((catMatch = categoryRegex.exec(entryXml)) !== null) {
            categories.push(catMatch[1]);
        }

        // Extract dates
        const publishedMatch = entryXml.match(/<published>([^<]+)<\/published>/);
        const published = publishedMatch ? publishedMatch[1] : '';

        const updatedMatch = entryXml.match(/<updated>([^<]+)<\/updated>/);
        const updated = updatedMatch ? updatedMatch[1] : '';

        // Extract PDF link
        const pdfMatch = entryXml.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
        const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${arxivId}.pdf`;

        papers.push({
            id: arxivId,
            title,
            authors,
            abstract,
            categories,
            published,
            updated,
            pdfUrl,
            arxivUrl: `https://arxiv.org/abs/${arxivId}`,
        });
    }

    return papers;
}

/**
 * Category mappings for user-friendly names
 */
export const ARXIV_CATEGORIES: Record<string, { name: string; description: string }> = {
    'cs.AI': { name: 'Artificial Intelligence', description: 'Covers all areas of AI except Vision, Robotics, and Machine Learning' },
    'cs.LG': { name: 'Machine Learning', description: 'Machine learning papers from Computer Science' },
    'cs.CL': { name: 'Computation and Language', description: 'Natural language processing and computational linguistics' },
    'cs.CV': { name: 'Computer Vision', description: 'Image processing, computer vision, pattern recognition' },
    'cs.NE': { name: 'Neural and Evolutionary Computing', description: 'Neural networks and evolutionary algorithms' },
    'stat.ML': { name: 'Machine Learning (Stats)', description: 'Machine learning papers from Statistics' },
    'physics.quant-ph': { name: 'Quantum Physics', description: 'Quantum information, quantum computation' },
    'math.CO': { name: 'Combinatorics', description: 'Discrete mathematics and combinatorial structures' },
    'q-bio': { name: 'Quantitative Biology', description: 'Computational and quantitative biology' },
    'econ': { name: 'Economics', description: 'Econometrics, theoretical economics' },
};

/**
 * Format date for display
 */
export function formatArxivDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}
