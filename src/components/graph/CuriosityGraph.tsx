'use client';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';

// Dynamic import for No-SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export function CuriosityGraph({ data }: { data: { nodes: any[], links: any[] } }) {
    const handleNodeClick = useCallback((node: any) => {
        // Navigate or expand
        console.log("Clicked node", node);
    }, []);

    if (!data || data.nodes.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <p className="text-gray-500">No graph data available</p>
            </div>
        );
    }

    return (
        <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            <ForceGraph2D
                graphData={data}
                nodeLabel="name"
                nodeColor={(node: any) => node.type === 'paper' ? '#818cf8' : '#34d399'}
                nodeVal={(node: any) => node.val || 3}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                backgroundColor="#000000"
                onNodeClick={handleNodeClick}
            />
            <div className="absolute top-4 left-4 rounded-md bg-black/50 px-3 py-1 text-xs text-gray-400 backdrop-blur-md">
                Interactive Graph
            </div>
        </div>
    );
}
