"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { type ArxivPaper, formatArxivDate, ARXIV_CATEGORIES } from "@/lib/arxiv";

interface PaperDetailClientProps {
    paper: ArxivPaper;
}

// Generate fake stats for engagement
function generateStats(paperId: string) {
    const base = parseInt(paperId.replace(/\D/g, '').slice(-5) || "10000");
    return {
        views: Math.floor((base % 50000) + 5000),
        fire: Math.floor((base % 500) + 50),
        mindblown: Math.floor((base % 300) + 30),
        saves: Math.floor((base % 200) + 20),
    };
}

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
            <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-bold text-lg text-gradient">ResearchScroll</span>
                </Link>

                <Link
                    href="/explore"
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                    <span>←</span>
                    Back to Explore
                </Link>
            </div>
        </nav>
    );
}

export default function PaperDetailClient({ paper }: PaperDetailClientProps) {
    const [liked, setLiked] = useState(false);
    const [mindblown, setMindblown] = useState(false);
    const [saved, setSaved] = useState(false);

    const primaryCategory = paper.categories[0] || "research";
    const categoryInfo = ARXIV_CATEGORIES[primaryCategory];
    const stats = generateStats(paper.id);

    // Split abstract into paragraphs for better reading
    const abstractParagraphs = paper.abstract.split(/\.\s+/).filter(p => p.trim());

    return (
        <div className="min-h-screen bg-[var(--background)] bg-mesh">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-6">
                <article className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <motion.header
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        {/* Category & Stats Bar */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="chip chip-purple">
                                {categoryInfo?.name || primaryCategory}
                            </span>
                            <span className="stat-badge">
                                👁️ {stats.views.toLocaleString()} views
                            </span>
                            <span className="stat-badge">
                                📅 {formatArxivDate(paper.published)}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                            {paper.title}
                        </h1>

                        {/* Authors */}
                        <div className="mb-6">
                            <p className="text-sm text-white/50 mb-3">Written by</p>
                            <div className="flex flex-wrap gap-2">
                                {paper.authors.map((author, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white hover:bg-white/10 cursor-pointer transition-colors"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                            {author.charAt(0)}
                                        </span>
                                        {author}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        {/* Reaction Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <button
                                onClick={() => setLiked(!liked)}
                                className={`reaction-btn text-base ${liked ? 'active !bg-orange-500/20' : ''}`}
                            >
                                🔥 {stats.fire + (liked ? 1 : 0)}
                            </button>
                            <button
                                onClick={() => setMindblown(!mindblown)}
                                className={`reaction-btn text-base ${mindblown ? 'active !bg-purple-500/20' : ''}`}
                            >
                                🤯 {stats.mindblown + (mindblown ? 1 : 0)}
                            </button>
                            <button
                                onClick={() => setSaved(!saved)}
                                className={`reaction-btn text-base ${saved ? 'active !bg-blue-500/20' : ''}`}
                            >
                                {saved ? '📌 Saved!' : '🔖 Save'}
                            </button>
                            <button className="reaction-btn text-base ml-auto">
                                📤 Share
                            </button>
                        </motion.div>
                    </motion.header>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-3 mb-10"
                    >
                        <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gradient flex-1 sm:flex-none"
                        >
                            📄 Read Full Paper
                        </a>
                        <a
                            href={paper.arxivUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost flex-1 sm:flex-none"
                        >
                            🔗 View on ArXiv
                        </a>
                    </motion.div>

                    {/* TL;DR Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-10"
                    >
                        <div className="neon-card p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">⚡</span>
                                <h2 className="text-xl font-bold text-white">TL;DR</h2>
                            </div>
                            <p className="text-lg text-white/90 leading-relaxed">
                                {abstractParagraphs.slice(0, 2).join('. ')}.
                            </p>
                        </div>
                    </motion.section>

                    {/* Full Abstract */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-10"
                    >
                        <div className="glass-card p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                📖 Full Abstract
                            </h2>
                            <div className="space-y-4">
                                {abstractParagraphs.map((paragraph, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="text-white/80 leading-relaxed"
                                    >
                                        {paragraph.trim()}.
                                    </motion.p>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* Topics */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-10"
                    >
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            🏷️ Related Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {paper.categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/explore?cat=${encodeURIComponent(cat)}`}
                                    className="chip chip-purple hover:scale-105 transition-transform"
                                >
                                    {ARXIV_CATEGORIES[cat]?.name || cat}
                                </Link>
                            ))}
                        </div>
                    </motion.section>

                    {/* CTA */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                    >
                        <div className="neon-card p-8">
                            <span className="text-4xl mb-4 block">🧪</span>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Want more like this?
                            </h3>
                            <p className="text-white/60 mb-6">
                                Explore thousands of papers explained simply.
                            </p>
                            <Link href="/explore">
                                <button className="btn-gradient">
                                    Explore More Papers 🚀
                                </button>
                            </Link>
                        </div>
                    </motion.section>
                </article>
            </main>
        </div>
    );
}
