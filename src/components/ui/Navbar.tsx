import Link from 'next/link';
import { Search, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-xl font-bold text-transparent">
                        AXIOM
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-8 md:flex">
                    <NavLink href="/explore">Explore</NavLink>
                    <NavLink href="/saved">Saved</NavLink>
                    <NavLink href="/circles">Circles</NavLink>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Sign In
                        </button>
                        <Link
                            href="/join"
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white md:hidden"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
                    >
                        <div className="space-y-4 px-4 py-6">
                            <MobileNavLink href="/explore">Explore</MobileNavLink>
                            <MobileNavLink href="/saved">Saved</MobileNavLink>
                            <MobileNavLink href="/circles">Circles</MobileNavLink>
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                                <button className="text-left text-sm font-medium text-gray-400 hover:text-white">
                                    Sign In
                                </button>
                                <Link
                                    href="/join"
                                    className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-black"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block text-base font-medium text-gray-400 hover:text-white"
        >
            {children}
        </Link>
    );
}
