"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[var(--background)] bg-mesh flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
            >
                <motion.span
                    initial={{ y: -20 }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-9xl mb-6 block"
                >
                    🤔
                </motion.span>

                <h1 className="headline-large mb-4">
                    Page not found
                </h1>

                <p className="body-large mb-8">
                    Looks like this page got lost in the research archives. Let&apos;s get you back on track!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <button className="btn-gradient w-full sm:w-auto">
                            Go Home 🏠
                        </button>
                    </Link>
                    <Link href="/explore">
                        <button className="btn-ghost w-full sm:w-auto">
                            Explore Papers 🔍
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
