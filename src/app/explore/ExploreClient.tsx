'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';
import { PaperCard } from '@/components/ui/PaperCard';
import type { NormalizedPaper } from '@/modules/paper/paper.types';

export default function ExploreClient({ initialPapers }: { initialPapers: NormalizedPaper[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            router.push(`/explore?q=${encodeURIComponent(query)}`);
        });
    };

    return (
        <div className="min-h-screen pt-12 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-6">Explore Research</h1>

                    <form onSubmit={handleSearch} className="relative max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search papers, concepts, or questions..."
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none ring-1 ring-transparent focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </form>
                </div>

                {initialPapers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {initialPapers.map(paper => (
                            <PaperCard key={paper.externalId} paper={paper} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {query ? 'No results found.' : 'Try searching for "Attention Mechanisms" or "Graph Neural Networks".'}
                    </div>
                )}
            </div>
        </div>
    );
}
