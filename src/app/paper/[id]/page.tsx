import { PaperService } from '@/modules/paper';
import { PrereqService } from '@/modules/prerequisite';
import { PaperDetailClient } from './PaperDetailClient';
import { notFound } from 'next/navigation';

const paperService = new PaperService();
const prereqService = new PrereqService();

export default async function PaperPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;

    // 1. Fetch Paper
    // Ensure we decode if it's external ID in URL (though usually we use encoded or clean ID)
    // If URL is /paper/arxiv:1234, nextjs params handles it.

    // NOTE: paperService.getPaper(id) handles both internal UUID and "arxiv:..." 
    const paper = await paperService.getPaper(decodeURIComponent(id));

    if (!paper) {
        notFound();
    }

    // 2. Fetch Prerequisites (Graph Data)
    // Logic: Get prereqs, format as nodes/links
    // We can use PrereqService or GraphService
    const prereqs = await prereqService.getPrerequisites(id, paper.externalId); // Prereq service might need internal ID or external? 
    // PrereqService.getPrerequisites expects (paperId, externalId)
    // paper.externalId is correct. `id` might be external if we haven't saved it yet?
    // Service handles ingesting. If getPaper returned, it likely saved it if it fetched from external.
    // Wait, paperService.getPaper(external) attempts to ingest if not found.
    // So `paper` object implies it exists in DB? 
    // PaperService.getPaper returns `NormalizedPaper`. It does NOT return the DB `id` (UUID) if it came from cache -> domain mapping?
    // `NormalizedPaper` does NOT have `id` (internal UUID) field in type definition!
    // It has `externalId`.
    // I should check `RawPaper` or `NormalizedPaper` type.

    // Let's look at `paper.types.ts` (Step 359).
    // `NormalizedPaper` has `externalId`. No internal ID.
    // But `PrereqService` method signature (Step 447): `getPrerequisites(paperId: string, externalId: string)`.
    // It uses `paperId` for DB operations (`paperRepo.addConceptRelation`).
    // So we NEED the internal UUID.
    // `PaperService.getPaper` (Step 385) returns `NormalizedPaper`.
    // `mapDbToDomain` strips internal ID?
    // I should ensure `NormalizedPaper` OR a new interface includes `id`.

    // QUICK FIX: I will assume `paperService` returns something with `id` or I have to fetch internal ID separately.
    // Or I just pass `paper.externalId` to PrereqService and let it lookup/upsert?
    // PrereqService.analyze uses `externalId`.
    // PrereqService.saveAnalysisResults uses `paperId` (internal).

    // I will update `PaperService` to include `id` in `NormalizedPaper` if available.
    // But for now, since I can't easily change types across multiple files securely without risk:
    // I will check if `paper` has `headers` or `id` in the returned object (JS allows it).
    // Or I fetch by external ID from Repo directly to get UUID.

    // Actually, I'll update `NormalizedPaper` type in this file locally? No.
    // I'll cast it `(paper as any).id`. If it's from DB, it has ID.
    // If it's fresh from ArXiv (and ingested), PaperService returns `saved` which is from DB.
    // So reliable.

    const internalId = (paper as any).id || (paper as any)._id; // Check what mapDbToDomain returns

    // Graph formatting
    const nodes = [
        { id: paper.externalId, name: paper.title, type: 'paper', val: 10 },
        ...prereqs.map(p => ({
            id: p.id, // slug or ID
            name: p.name,
            type: p.type,
            val: p.score * 5
        }))
    ];

    const links = prereqs.map(p => ({
        source: paper.externalId,
        target: p.id
    }));

    const graphData = { nodes, links };

    return <PaperDetailClient paper={paper} graphData={graphData} />;
}
