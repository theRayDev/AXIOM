import { NextRequest, NextResponse } from "next/server";
import { getArxivByCategory } from "@/lib/arxiv";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("cat");

    if (!category) {
        return NextResponse.json(
            { error: "Query parameter 'cat' is required" },
            { status: 400 }
        );
    }

    try {
        const papers = await getArxivByCategory(category, 12);

        return NextResponse.json({ papers });
    } catch (error) {
        console.error("Category API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch papers by category" },
            { status: 500 }
        );
    }
}
