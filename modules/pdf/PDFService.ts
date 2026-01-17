import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface PDFMetadata {
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
}

export interface ProcessResult {
    uri: string;
    size: number;
    sizeFormatted: string;
}

class PDFService {
    /**
     * Load a PDF from a file URI
     */
    async loadPDF(uri: string, options?: { ignoreEncryption?: boolean }): Promise<PDFDocument> {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return PDFDocument.load(base64, {
            ignoreEncryption: options?.ignoreEncryption ?? false,
        });
    }

    /**
     * Save a PDF document to cache and return the URI
     */
    async savePDF(pdf: PDFDocument, filename: string): Promise<ProcessResult> {
        const base64 = await pdf.saveAsBase64();
        const uri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileInfo = await FileSystem.getInfoAsync(uri);
        const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

        return {
            uri,
            size,
            sizeFormatted: this.formatSize(size),
        };
    }

    /**
     * Get metadata from a PDF
     */
    async getMetadata(uri: string): Promise<PDFMetadata> {
        const pdf = await this.loadPDF(uri, { ignoreEncryption: true });
        return {
            pageCount: pdf.getPageCount(),
            title: pdf.getTitle(),
            author: pdf.getAuthor(),
            subject: pdf.getSubject(),
            creator: pdf.getCreator(),
        };
    }

    /**
     * Merge multiple PDFs into one
     */
    async mergePDFs(uris: string[], outputFilename = 'merged.pdf'): Promise<ProcessResult> {
        const mergedPdf = await PDFDocument.create();

        for (const uri of uris) {
            const pdf = await this.loadPDF(uri);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        return this.savePDF(mergedPdf, outputFilename);
    }

    /**
     * Split a PDF by page ranges
     */
    async splitPDF(
        uri: string,
        pageRanges: { start: number; end: number }[],
        outputPrefix = 'split'
    ): Promise<ProcessResult[]> {
        const sourcePdf = await this.loadPDF(uri);
        const results: ProcessResult[] = [];

        for (let i = 0; i < pageRanges.length; i++) {
            const range = pageRanges[i];
            const newPdf = await PDFDocument.create();
            const pageIndices = [];

            for (let j = range.start; j <= range.end; j++) {
                pageIndices.push(j);
            }

            const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const result = await this.savePDF(newPdf, `${outputPrefix}_${i + 1}.pdf`);
            results.push(result);
        }

        return results;
    }

    /**
     * Compress/optimize a PDF
     */
    async compressPDF(uri: string, outputFilename = 'compressed.pdf'): Promise<ProcessResult> {
        const pdf = await this.loadPDF(uri, { ignoreEncryption: true });

        // Create new PDF and copy pages (removes unused objects)
        const compressedPdf = await PDFDocument.create();
        const pages = await compressedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => compressedPdf.addPage(page));

        // Save with object streams for better compression
        const base64 = await compressedPdf.saveAsBase64({
            useObjectStreams: true,
            addDefaultPage: false,
        });

        const resultUri = FileSystem.documentDirectory + outputFilename;
        await FileSystem.writeAsStringAsync(resultUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileInfo = await FileSystem.getInfoAsync(resultUri);
        const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

        return {
            uri: resultUri,
            size,
            sizeFormatted: this.formatSize(size),
        };
    }

    /**
     * Extract text from a PDF
     */
    async extractText(uri: string): Promise<string> {
        // pdf-lib doesn't support text extraction directly
        // This is a placeholder - actual text extraction would require additional libraries
        const pdf = await this.loadPDF(uri, { ignoreEncryption: true });
        const pageCount = pdf.getPageCount();
        return `PDF has ${pageCount} pages. Full text extraction requires additional libraries.`;
    }

    /**
     * Share a file using the system share dialog
     */
    async shareFile(uri: string): Promise<void> {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        } else {
            throw new Error('Sharing is not available on this device');
        }
    }

    /**
     * Format bytes to human-readable string
     */
    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    /**
     * Delete a file from the file system
     */
    async deleteFile(uri: string): Promise<void> {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    }

    /**
     * Clear cache directory
     */
    async clearCache(): Promise<void> {
        if (FileSystem.cacheDirectory) {
            await FileSystem.deleteAsync(FileSystem.cacheDirectory, { idempotent: true });
        }
    }
}

// Export singleton instance
export const pdfService = new PDFService();
export default pdfService;
