"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-bold text-lg text-gradient">ResearchScroll</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/explore" className="text-white/70 hover:text-white transition-colors font-medium">
                        🔍 Explore
                    </Link>
                    <Link href="/saved" className="text-white font-semibold">
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

export default function SavedPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] bg-mesh">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                            className="text-8xl mb-6 block"
                        >
                            📌
                        </motion.span>

                        <h1 className="headline-large mb-4">
                            Your Saved Papers
                        </h1>

                        <p className="body-large max-w-md mx-auto mb-8">
                            Papers you save will appear here. Start exploring to find research that interests you!
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="neon-card p-8 max-w-md mx-auto mb-8"
                        >
                            <span className="text-4xl mb-4 block">🔐</span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Sign in to save papers
                            </h3>
                            <p className="text-white/60 mb-6 text-sm">
                                Create a free account to save papers and access them from anywhere.
                            </p>
                            <button className="btn-gradient w-full">
                                Sign Up Free 🚀
                            </button>
                        </motion.div>

                        <Link href="/explore">
                            <button className="btn-ghost">
                                ← Back to Explore
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
