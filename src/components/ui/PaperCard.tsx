import Link from 'next/link';
import { type NormalizedPaper } from '@/modules/paper/paper.types';
import { Badge } from 'lucide-react'; // Wait, lucide badge is icon. I usually want UI badge.
// I'll make a simple Badge UI

export function PaperCard({ paper }: { paper: NormalizedPaper }) {
    // Format authors
    const authors = paper.authors.slice(0, 3).map(a => a.name).join(', ') +
        (paper.authors.length > 3 ? ' et al.' : '');

    return (
        <Link href={`/paper/${paper.externalId}`}>
            <div className="group block h-full rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {paper.title}
                    </h3>
                    {/* Readiness Score or Metric */}
                    <div className="shrink-0 rounded-full bg-indigo-900/40 px-2 py-1 text-xs font-mono text-indigo-300">
                        {paper.publication?.substring(0, 10) || 'ArXiv'}
                    </div>
                </div>

                <p className="mt-2 text-sm text-gray-400">{authors}</p>

                <p className="mt-4 line-clamp-3 text-sm text-gray-500">
                    {paper.rawAbstract}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {paper.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-white/10">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
