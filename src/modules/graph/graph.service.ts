import { PaperRepository } from '@/modules/paper/paper.repository';
import { ConceptRepository } from '@/modules/concept/concept.repository';
import { logger } from '@/shared/utils';
import { cache, cacheKeys, CACHE_TTL } from '@/shared/cache';

const log = logger.child({ context: 'graph-service' });

export class GraphService {
    private paperRepo: PaperRepository;
    private conceptRepo: ConceptRepository;

    constructor() {
        this.paperRepo = new PaperRepository();
        this.conceptRepo = new ConceptRepository();
    }

    /**
     * Build the Curiosity Graph
     * - Starts from user's explored nodes or a center node
     * - Expands outward
     */
    async getCuriosityGraph(userId?: string, centerNodeId?: string, depth = 2) {
        const cacheKey = centerNodeId ? cacheKeys.nodeExpand(centerNodeId) : `graph:user:${userId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        // If centerNodeId is provided, traverse from there
        if (centerNodeId) {
            // Assuming center is a paper for now
            // Check if it's a paper UUID
            const isPaper = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(centerNodeId); // Not quite accurate mix

            // For MVP, we use the recursive SQL function for papers
            try {
                const rawEdges = await this.paperRepo.getRelatedPapersRecursive(centerNodeId, depth);

                // Transform to Graph structure
                // rawEdges returns { paper_id, depth, path }
                // We need to fetch details for these papers

                const paperIds = rawEdges.map((e: any) => e.paper_id);

                // Fetch full paper details (simplified)
                // We need a bulk fetch method in repo
                // For now, fetch individually (parallel) or add findManyByIds

                const papers: any[] = []; // TODO: Bulk fetch

                const graph = {
                    papers,
                    concepts: [],
                    edges: [], // We need to reconstruct edges from path?
                    // recursive CTE returns nodes, not edges explicitly unless selecting them
                    // We might need to query paper_edges for all pairs in the node set
                };

                // Return structured graph
                return graph;
            } catch (err) {
                log.error({ err }, 'Graph traversal failed');
                return { papers: [], concepts: [], edges: [] };
            }
        }

        return { papers: [], concepts: [], edges: [] };
    }
}
