import { PaperRepository } from '@/modules/paper/paper.repository';
import { ConceptRepository } from '@/modules/concept/concept.repository';
import { SemanticScholarAdapter } from '@/modules/paper/sources/semantic-scholar.adapter';
import { logger } from '@/shared/utils';
import type { Prerequisite } from './prereq.types';

const log = logger.child({ context: 'prereq-engine' });

export class PrereqEngine {
    private paperRepo: PaperRepository;
    private conceptRepo: ConceptRepository;
    private s2: SemanticScholarAdapter;

    constructor() {
        this.paperRepo = new PaperRepository();
        this.conceptRepo = new ConceptRepository();
        this.s2 = new SemanticScholarAdapter();
    }

    /**
     * Analyze a paper to find its prerequisites
     */
    async analyze(paperId: string, externalId: string): Promise<Prerequisite[]> {
        const prerequisites: Prerequisite[] = [];

        // 1. Fetch deep data from Semantic Scholar
        // We need S2 ID. If externalId is arxiv:xxx, normalize it.
        let s2Id = externalId;
        if (externalId.startsWith('arxiv:')) {
            s2Id = `arXiv:${externalId.replace('arxiv:', '')}`;
        }

        const s2Data = await this.s2.fetchPaper(s2Id);

        if (!s2Data || !s2Data.references) {
            log.warn({ paperId }, 'No reference data found for analysis');
            return [];
        }

        // 2. Identify Paper Prerequisites (Highly cited references)
        // Filter references that have high citation count (proxy for foundational)
        // For MVP rule: Top 3 cited references
        const references = s2Data.references as any[];

        const foundational = references
            .filter(ref => ref.citationCount && ref.citationCount > 100) // Threshold
            .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
            .slice(0, 3);

        // For each foundational paper, we need to ensure it exists in our DB to link it
        // But we avoid fetching full content for all of them now to save time
        // We just return them as candidates

        for (const ref of foundational) {
            prerequisites.push({
                type: 'paper',
                id: ref.paperId, // S2 ID or we need to resolve to our DB ID
                name: ref.title,
                reason: `Foundational paper with ${ref.citationCount} citations`,
                score: 0.8,
            });
        }

        // 3. Identify Concept Prerequisites
        // From S2 s2FieldsOfStudy
        // e.g. "Deep Learning", "Transformers"
        // We assume these are prerequisites if they are broad fields

        const fields = s2Data.s2FieldsOfStudy || [];
        for (const field of fields) {
            prerequisites.push({
                type: 'concept',
                id: field.category, // Using name as ID for now
                name: field.category,
                reason: 'Core field of study',
                score: 0.9,
            });
        }

        return prerequisites;
    }
}
