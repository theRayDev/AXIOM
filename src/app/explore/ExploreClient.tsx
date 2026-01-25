"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { type ArxivPaper, formatArxivDate, ARXIV_CATEGORIES } from "@/lib/arxiv";

interface ExploreClientProps {
    initialPapers: ArxivPaper[];
}

// Category colors mapping
const categoryColors: Record<string, string> = {
    "cs.LG": "purple",
    "cs.AI": "pink",
    "cs.CL": "blue",
    "cs.CV": "cyan",
    "cs.NE": "green",
    "stat.ML": "orange",
    "physics.quant-ph": "yellow",
};

// Generate a fun vibe based on abstract length/keywords
function getVibe(abstract: string): string {
    const vibes = ["🔥 Hot Take", "🧠 Big Brain", "💡 Innovative", "🚀 Cutting Edge", "✨ Fresh", "🎯 Important"];
    return vibes[Math.floor(abstract.length % vibes.length)];
}

// Generate TL;DR from abstract
function getTldr(abstract: string): string {
    // Take first 150 chars and clean up
    const cleaned = abstract.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= 150) return cleaned;
    return cleaned.slice(0, 150).trim() + "...";
}

function PaperCard({ paper, index }: { paper: ArxivPaper; index: number }) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const primaryCategory = paper.categories[0] || "cs.AI";
    const categoryInfo = ARXIV_CATEGORIES[primaryCategory];
    const colorClass = `chip-${categoryColors[primaryCategory] || "purple"}`;

    // Generate fake engagement numbers based on paper ID
    const engagementBase = parseInt(paper.id.replace(/\D/g, '').slice(-4) || "1000");
    const fireCount = Math.floor((engagementBase % 50) + 10);
    const mindblownCount = Math.floor((engagementBase % 30) + 5);

    return (
        <Link href={`/paper/${encodeURIComponent(paper.id)}`}>
            <motion.article
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.25 }}
                className="neon-card p-5 md:p-6 h-full cursor-pointer"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📄</span>
                        <div>
                            <span className={`chip ${colorClass} text-xs`}>
                                {categoryInfo?.name || primaryCategory}
                            </span>
                        </div>
                    </div>
                    <span className="stat-badge text-xs">
                        {formatArxivDate(paper.published)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {paper.title}
                </h3>

                {/* Authors */}
                <p className="text-sm text-white/50 mb-3 truncate">
                    by {paper.authors.slice(0, 2).join(", ")}
                    {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
                </p>

                {/* TL;DR */}
                <div className="tldr-box mb-4">
                    <p className="text-xs font-semibold text-purple-300 mb-1">⚡ Quick Summary</p>
                    <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                        {getTldr(paper.abstract)}
                    </p>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLiked(!liked);
                        }}
                        className={`reaction-btn ${liked ? 'active' : ''}`}
                    >
                        🔥 {fireCount + (liked ? 1 : 0)}
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className="reaction-btn"
                    >
                        🤯 {mindblownCount}
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className={`reaction-btn ml-auto ${saved ? 'active' : ''}`}
                    >
                        {saved ? '📌' : '🔖'}
                    </button>
                </div>
            </motion.article>
        </Link>
    );
}

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-bold text-lg text-gradient">ResearchScroll</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/explore" className="text-white font-semibold">
                        🔍 Explore
                    </Link>
                    <Link href="/saved" className="text-white/70 hover:text-white transition-colors font-medium">
                        📌 Saved
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn-gradient text-sm py-2 px-5">Join Free</button>
                </div>
            </div>
        </nav>
    );
}

const CATEGORY_OPTIONS = [
    { id: "cs.LG", label: "🤖 Machine Learning", color: "purple" },
    { id: "cs.AI", label: "🧠 AI", color: "pink" },
    { id: "cs.CL", label: "📝 Language AI", color: "blue" },
    { id: "cs.CV", label: "👁️ Vision", color: "cyan" },
    { id: "cs.NE", label: "🔮 Neural Nets", color: "green" },
    { id: "physics.quant-ph", label: "⚛️ Quantum", color: "orange" },
];

export default function ExploreClient({ initialPapers }: ExploreClientProps) {
    const [papers, setPapers] = useState<ArxivPaper[]>(initialPapers);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("cs.LG");
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setPapers(data.papers || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = async (categoryId: string) => {
        setActiveCategory(categoryId);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/category?cat=${encodeURIComponent(categoryId)}`);
            const data = await response.json();
            setPapers(data.papers || []);
        } catch (error) {
            console.error("Category fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] bg-mesh">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center md:text-left"
                    >
                        <h1 className="headline-large mb-2">
                            🔍 Explore Research
                        </h1>
                        <p className="body-large">
                            Find the latest breakthroughs explained simply
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSearch}
                        className="mb-8"
                    >
                        <div className="relative max-w-2xl mx-auto md:mx-0">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="What are you curious about? 🤔"
                                className="input-search"
                            />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn-gradient py-2 px-5 text-sm"
                            >
                                {isLoading ? "🔄" : "Search"}
                            </button>
                        </div>
                    </motion.form>

                    {/* Category Filters */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start"
                    >
                        {CATEGORY_OPTIONS.map((cat) => (
                            <motion.button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`chip transition-all ${activeCategory === cat.id
                                        ? `chip-${cat.color} ring-2 ring-white/30`
                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                    }`}
                            >
                                {cat.label}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="text-5xl mb-4"
                            >
                                🔄
                            </motion.div>
                            <p className="text-white/60">Finding cool papers...</p>
                        </div>
                    )}

                    {/* Papers Grid */}
                    {!isLoading && (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {papers.map((paper, index) => (
                                    <PaperCard key={paper.id} paper={paper} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && papers.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <span className="text-6xl mb-4 block">🤷</span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                No papers found
                            </h3>
                            <p className="text-white/60">
                                Try a different search or category!
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
