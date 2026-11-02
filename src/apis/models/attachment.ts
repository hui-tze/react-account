export type Attachment = {
    name: string,
    type: string,
    path: string,
    temp_url: string,
}

export function getFileExtension(fileName: string): string | null {
    if (!fileName) return null;
    return fileName.split('.').pop()?.toLowerCase() || null;
}