'use client';
import { type NormalizedPaper } from '@/modules/paper/paper.types';
import { CuriosityGraph } from '@/components/graph/CuriosityGraph';
import { Badge, Calendar, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';

export function PaperDetailClient({ paper, graphData }: { paper: NormalizedPaper, graphData: any }) {
    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-white/10 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        {paper.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
                        </div>
                        {paper.publication && (
                            <div className="flex items-center gap-2">
                                <Badge className="h-4 w-4" />
                                <span>{paper.publication}</span>
                            </div>
                        )}
                        {paper.pdfUrl && (
                            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                                <FileText className="h-4 w-4" />
                                <span>PDF</span>
                            </a>
                        )}
                        <a href={paper.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                            <LinkIcon className="h-4 w-4" />
                            <span>Source</span>
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {paper.categories.map(cat => (
                            <span key={cat} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Col: Abstract & Authors */}
                    <div className="lg:col-span-1 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">Abstract</h2>
                            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                                {paper.rawAbstract}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">Authors</h2>
                            <ul className="space-y-3">
                                {paper.authors.map((author, i) => (
                                    <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5">
                                        <span className="font-medium text-gray-200">{author.name}</span>
                                        {author.affiliation && (
                                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{author.affiliation}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Right Col: Graph */}
                    <div className="lg:col-span-2">
                        <section>
                            <div className="flex items-end justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Prerequisite Graph</h2>
                                <span className="text-sm text-gray-400">Visualizing foundations</span>
                            </div>
                            <CuriosityGraph data={graphData} />
                        </section>

                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-white mb-4">Prerequisites</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {graphData.nodes.filter((n: any) => n.id !== paper.externalId).map((node: any) => (
                                    <div key={node.id} className="p-4 rounded-lg bg-zinc-900/30 border border-white/5 flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${node.type === 'concept' ? 'bg-green-400' : 'bg-indigo-400'}`} />
                                        <span className="font-medium text-gray-300">{node.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
