import { NextRequest, NextResponse } from "next/server";
import { searchArxiv } from "@/lib/arxiv";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    try {
        const papers = await searchArxiv({
            query,
            maxResults: 15,
            sortBy: "relevance",
        });

        return NextResponse.json({ papers });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Failed to search papers" },
            { status: 500 }
        );
    }
}
