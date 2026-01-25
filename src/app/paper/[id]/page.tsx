import { getArxivPaper } from "@/lib/arxiv";
import PaperDetailClient from "./PaperDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PaperPage({ params }: PageProps) {
    const { id } = await params;

    // Handle URL-encoded ArXiv IDs (e.g., "2301.00001" or "cs/0601001")
    const decodedId = decodeURIComponent(id);

    try {
        const paper = await getArxivPaper(decodedId);

        if (!paper) {
            notFound();
        }

        return <PaperDetailClient paper={paper} />;
    } catch (error) {
        console.error("Failed to fetch paper:", error);
        notFound();
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    try {
        const paper = await getArxivPaper(decodedId);

        if (!paper) {
            return { title: "Paper Not Found" };
        }

        return {
            title: `${paper.title} — ResearchScroll`,
            description: paper.abstract.slice(0, 160) + "...",
        };
    } catch {
        return { title: "Paper Not Found" };
    }
}
