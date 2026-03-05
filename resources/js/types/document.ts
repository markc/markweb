export interface UserDocument {
    filename: string;
    mime_type: string;
    file_size: number;
    status: 'processing' | 'ready' | 'failed';
    chunk_count: number;
    uploaded_at: string;
}

export interface DocumentProcessedEvent {
    filename: string;
    chunk_count: number;
    status: 'ready' | 'failed';
    error: string | null;
}
