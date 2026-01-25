import { searchArxiv, getArxivByCategory, type ArxivPaper } from "@/lib/arxiv";
import ExploreClient from "./ExploreClient";

// Popular categories to show by default
const DEFAULT_CATEGORIES = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"];

async function getInitialPapers(): Promise<ArxivPaper[]> {
    try {
        // Fetch latest papers from Machine Learning category
        const papers = await getArxivByCategory("cs.LG", 12);
        return papers;
    } catch (error) {
        console.error("Failed to fetch initial papers:", error);
        return [];
    }
}

export default async function ExplorePage() {
    const initialPapers = await getInitialPapers();

    return <ExploreClient initialPapers={initialPapers} />;
}
