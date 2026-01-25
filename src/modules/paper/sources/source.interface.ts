export interface PaperSourceAdapter {
    name: string;
    fetchPaper(id: string): Promise<any>;
    searchPapers(query: string, limit?: number): Promise<any[]>;
    normalize(raw: any): any;
}
