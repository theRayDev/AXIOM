"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// 🔥 Trending papers with fun, accessible summaries
const trendingPapers = [
  {
    id: "1706.03762",
    title: "Attention Is All You Need",
    emoji: "🧠",
    tldr: "The paper that started the AI revolution. Transformers ditched old-school neural networks and changed EVERYTHING.",
    vibe: "Mind-blowing",
    category: "AI/ML",
    categoryColor: "purple",
    reactions: { fire: 42000, mindblown: 38000, rocket: 25000 },
    readTime: "8 min",
  },
  {
    id: "1810.04805",
    title: "BERT: Teaching AI to Really Understand Language",
    emoji: "📖",
    tldr: "Google made AI that actually gets context. It reads both directions and understands words like humans do.",
    vibe: "Game-changer",
    category: "NLP",
    categoryColor: "pink",
    reactions: { fire: 35000, mindblown: 28000, rocket: 19000 },
    readTime: "10 min",
  },
  {
    id: "1406.2661",
    title: "GANs: AI That Creates Art & Fake Faces",
    emoji: "🎨",
    tldr: "Two neural networks fight each other to create hyper-realistic images. This is how deepfakes work.",
    vibe: "Wild",
    category: "Deep Learning",
    categoryColor: "cyan",
    reactions: { fire: 28000, mindblown: 32000, rocket: 15000 },
    readTime: "7 min",
  },
  {
    id: "2303.08774",
    title: "GPT-4: The AI That Can Do Almost Anything",
    emoji: "🤖",
    tldr: "OpenAI's most powerful AI yet. It writes code, passes exams, and has conversations like a human.",
    vibe: "Insane",
    category: "LLMs",
    categoryColor: "green",
    reactions: { fire: 55000, mindblown: 48000, rocket: 42000 },
    readTime: "15 min",
  },
];

const categories = [
  { id: "ai", label: "🤖 AI & ML", color: "purple" },
  { id: "space", label: "🚀 Space", color: "blue" },
  { id: "climate", label: "🌍 Climate", color: "green" },
  { id: "brain", label: "🧠 Neuroscience", color: "pink" },
  { id: "quantum", label: "⚛️ Quantum", color: "cyan" },
  { id: "bio", label: "🧬 Biology", color: "orange" },
];

function PaperCard({ paper, index }: { paper: typeof trendingPapers[0]; index: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const colorClasses: Record<string, string> = {
    purple: "chip-purple",
    pink: "chip-pink",
    blue: "chip-blue",
    cyan: "chip-cyan",
    green: "chip-green",
    orange: "chip-orange",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.3 }}
      className="neon-card p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{paper.emoji}</span>
          <div>
            <span className={`chip ${colorClasses[paper.categoryColor]}`}>
              {paper.category}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="stat-badge">⏱️ {paper.readTime}</span>
              <span className="stat-badge">✨ {paper.vibe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
        {paper.title}
      </h3>

      {/* TL;DR */}
      <div className="tldr-box mb-5">
        <p className="text-sm font-semibold text-purple-300 mb-1">⚡ TL;DR</p>
        <p className="text-white/90 leading-relaxed">
          {paper.tldr}
        </p>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setLiked(!liked)}
          className={`reaction-btn ${liked ? 'active' : ''}`}
        >
          🔥 {(paper.reactions.fire / 1000).toFixed(0)}k
        </button>
        <button className="reaction-btn">
          🤯 {(paper.reactions.mindblown / 1000).toFixed(0)}k
        </button>
        <button className="reaction-btn">
          🚀 {(paper.reactions.rocket / 1000).toFixed(0)}k
        </button>
        <button
          onClick={() => setSaved(!saved)}
          className={`reaction-btn ml-auto ${saved ? 'active' : ''}`}
        >
          {saved ? '📌 Saved' : '🔖 Save'}
        </button>
      </div>

      {/* Read Button */}
      <Link href={`/paper/${paper.id}`} className="block mt-5">
        <button className="w-full btn-gradient">
          Read Full Breakdown →
        </button>
      </Link>
    </motion.article>
  );
}

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-lg text-gradient">ResearchScroll</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/explore" className="text-white/70 hover:text-white transition-colors font-medium">
            🔍 Explore
          </Link>
          <Link href="/saved" className="text-white/70 hover:text-white transition-colors font-medium">
            📌 Saved
          </Link>
          <Link href="/trending" className="text-white/70 hover:text-white transition-colors font-medium">
            🔥 Trending
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-ghost text-sm py-2 px-4 hidden sm:flex">Sign In</button>
          <button className="btn-gradient text-sm py-2 px-5">Join Free</button>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-12 px-4 md:px-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Fun badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-2 chip chip-purple mb-6"
          >
            <span className="animate-pulse">🔥</span>
            <span>Join 50K+ curious minds</span>
          </motion.div>

          <h1 className="headline-hero mb-6">
            Research papers,
            <br />
            <span className="text-gradient text-glow">but make it fun.</span>
          </h1>

          <p className="body-large max-w-2xl mx-auto mb-10">
            Discover groundbreaking science explained in a way that actually makes sense.
            No PhD required. Just curiosity. 🧪✨
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="What are you curious about? 🤔"
              className="input-search"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`chip chip-${cat.color}`}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrendingSection() {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="headline-large mb-2">
              🔥 Trending Now
            </h2>
            <p className="text-white/60">
              The research everyone&apos;s talking about
            </p>
          </div>
          <Link href="/explore">
            <button className="btn-ghost">See All →</button>
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {trendingPapers.map((paper, index) => (
            <PaperCard key={paper.id} paper={paper} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const reasons = [
    {
      emoji: "🎯",
      title: "Zero Jargon",
      desc: "We break down complex research into bite-sized, understandable pieces.",
    },
    {
      emoji: "⚡",
      title: "5-Min Reads",
      desc: "Get the key insights without reading 50-page papers.",
    },
    {
      emoji: "🌍",
      title: "Real Impact",
      desc: "Understand how research affects your life and the world.",
    },
    {
      emoji: "🎮",
      title: "Actually Fun",
      desc: "Learning about science shouldn't feel like homework.",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-mesh">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="headline-large mb-4">
            Why you&apos;ll actually <span className="text-gradient">love this</span>
          </h2>
          <p className="body-large max-w-xl mx-auto">
            We&apos;re making science accessible to everyone, not just people in lab coats.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <span className="text-5xl mb-4 block animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                {reason.emoji}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{reason.title}</h3>
              <p className="text-white/60 text-sm">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="neon-card p-10 md:p-14 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-4xl opacity-20 rotate-12">🚀</div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-20 -rotate-12">✨</div>

          <span className="text-6xl mb-6 block">🧪</span>
          <h2 className="headline-large mb-4">
            Ready to get <span className="text-gradient">smarter</span>?
          </h2>
          <p className="body-large mb-8 max-w-lg mx-auto">
            Join thousands of curious teens exploring the cutting edge of science. It&apos;s free, forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gradient text-lg px-10 py-4">
              Start Exploring 🚀
            </button>
            <button className="btn-ghost text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span className="font-bold text-gradient">ResearchScroll</span>
        </div>
        <p className="text-sm text-white/40">
          Made with 💜 for curious minds everywhere
        </p>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-white/40 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/discord" className="text-sm text-white/40 hover:text-white transition-colors">
            Discord
          </Link>
          <Link href="/tiktok" className="text-sm text-white/40 hover:text-white transition-colors">
            TikTok
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main>
        <Hero />
        <TrendingSection />
        <WhySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
