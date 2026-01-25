export interface Prerequisite {
    type: 'paper' | 'concept';
    id: string; // UUID of paper or concept
    name: string;
    reason?: string;
    score: number; // 0-1 confidence
}

export interface PrereqAnalysis {
    paperId: string;
    prerequisites: Prerequisite[];
    corequisites: Prerequisite[];
}
