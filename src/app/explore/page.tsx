import { PaperService } from '@/modules/paper';
import ExploreClient from './ExploreClient';

const paperService = new PaperService();

// Force dynamic because we use search params
export const dynamic = 'force-dynamic';

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Await searchParams before accessing properties
    const params = await searchParams;
    const q = typeof params.q === 'string' ? params.q : '';

    let papers = [];

    if (q) {
        try {
            papers = await paperService.searchPapers(q);
        } catch (e) {
            console.error("Search error:", e);
        }
    } else {
        // Optionally fetch trending or random
        // papers = await paperService.getTrending();
    }

    return <ExploreClient initialPapers={papers} />;
}
