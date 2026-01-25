'use client';
// Use client for framer motion interactions (or use separate component)
// For simple animations we can keep it strictly client or mix.
// Landing page usually has interactivity.

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Network, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 bg-cosmic">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Research at the speed of{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                thought
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              AXIOM is a curiosity engine that maps the relationships between papers, concepts, and questions. Stop searching, start traversing.
            </p>

            <div className="mt-10 flex justify-center gap-6">
              <Link
                href="/explore"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 font-medium text-white transition-all hover:bg-indigo-500 hover:scale-105"
              >
                <span>Start Exploring</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-medium text-white transition-colors hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <FeatureCard
              icon={Network}
              title="Knowledge Graph"
              description="Visualize connections between millions of papers. See how ideas evolve over time."
            />
            <FeatureCard
              icon={Brain}
              title="Concept Extraction"
              description="Automatically identifies key concepts and prerequisites so you can learn faster."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Prereqs"
              description="Understand the foundations of any paper with a single click."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-2xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900 transition-colors"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}
