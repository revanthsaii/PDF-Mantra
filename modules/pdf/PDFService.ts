import { PDFDocument, PDFName, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

function parseContentStream(stream: string): string {
    let result = '';
    let i = 0;
    while (i < stream.length) {
        if (stream[i] === '(') {
            let str = '';
            i++;
            let parenCount = 1;
            while (i < stream.length && parenCount > 0) {
                if (stream[i] === '\\') {
                    i++;
                    if (i < stream.length) {
                        const char = stream[i];
                        if (char === 'n') str += '\n';
                        else if (char === 'r') str += '\r';
                        else if (char === 't') str += '\t';
                        else if (char === 'b') str += '\b';
                        else if (char === 'f') str += '\f';
                        else if (/[0-7]/.test(char)) {
                            let octal = char;
                            if (i + 1 < stream.length && /[0-7]/.test(stream[i + 1])) {
                                i++;
                                octal += stream[i];
                                if (i + 1 < stream.length && /[0-7]/.test(stream[i + 1])) {
                                    i++;
                                    octal += stream[i];
                                }
                            }
                            str += String.fromCharCode(parseInt(octal, 8));
                        } else {
                            str += char;
                        }
                    }
                } else if (stream[i] === '(') {
                    parenCount++;
                    str += '(';
                } else if (stream[i] === ')') {
                    parenCount--;
                    if (parenCount > 0) str += ')';
                } else {
                    str += stream[i];
                }
                i++;
            }
            
            let j = i;
            while (j < stream.length && /\s/.test(stream[j])) j++;
            let nextChars = stream.substring(j, j + 5);
            if (nextChars.startsWith('Tj') || nextChars.startsWith('\'') || nextChars.startsWith('"')) {
                result += str;
                if (nextChars.startsWith('\'') || nextChars.startsWith('"')) {
                    result += '\n';
                }
            }
        } else if (stream[i] === '<') {
            let hex = '';
            i++;
            while (i < stream.length && stream[i] !== '>') {
                if (/[0-9a-fA-F]/.test(stream[i])) {
                    hex += stream[i];
                }
                i++;
            }
            let str = '';
            for (let k = 0; k < hex.length; k += 2) {
                const code = parseInt(hex.substring(k, k + 2), 16);
                if (!isNaN(code)) {
                    str += String.fromCharCode(code);
                }
            }
            i++; // move past '>'
            
            let j = i;
            while (j < stream.length && /\s/.test(stream[j])) j++;
            let nextChars = stream.substring(j, j + 5);
            if (nextChars.startsWith('Tj') || nextChars.startsWith('\'') || nextChars.startsWith('"')) {
                result += str;
                if (nextChars.startsWith('\'') || nextChars.startsWith('"')) {
                    result += '\n';
                }
            }
        } else if (stream[i] === '[') {
            i++;
            let tjText = '';
            while (i < stream.length && stream[i] !== ']') {
                if (stream[i] === '(') {
                    let str = '';
                    i++;
                    let parenCount = 1;
                    while (i < stream.length && parenCount > 0) {
                        if (stream[i] === '\\') {
                            i++;
                            if (i < stream.length) {
                                const char = stream[i];
                                if (char === 'n') str += '\n';
                                else if (char === 'r') str += '\r';
                                else if (char === 't') str += '\t';
                                else str += char;
                            }
                        } else if (stream[i] === '(') {
                            parenCount++;
                            str += '(';
                        } else if (stream[i] === ')') {
                            parenCount--;
                            if (parenCount > 0) str += ')';
                        } else {
                            str += stream[i];
                        }
                        i++;
                    }
                    tjText += str;
                } else if (stream[i] === '<') {
                    let hex = '';
                    i++;
                    while (i < stream.length && stream[i] !== '>') {
                        if (/[0-9a-fA-F]/.test(stream[i])) {
                            hex += stream[i];
                        }
                        i++;
                    }
                    let str = '';
                    for (let k = 0; k < hex.length; k += 2) {
                        const code = parseInt(hex.substring(k, k + 2), 16);
                        if (!isNaN(code)) {
                            str += String.fromCharCode(code);
                        }
                    }
                    tjText += str;
                    i++; // move past '>'
                } else {
                    let numStr = '';
                    while (i < stream.length && (/[0-9\.\-]/.test(stream[i]))) {
                        numStr += stream[i];
                        i++;
                    }
                    if (numStr) {
                        const offset = parseFloat(numStr);
                        if (offset <= -150) {
                            tjText += ' ';
                        }
                    }
                    i++;
                }
            }
            let j = i + 1;
            while (j < stream.length && /\s/.test(stream[j])) j++;
            let nextChars = stream.substring(j, j + 5);
            if (nextChars.startsWith('TJ')) {
                result += tjText;
            }
        } else if (stream[i] === 'T' && stream[i + 1] === '*') {
            result += '\n';
            i += 2;
        } else if (stream[i] === 'T' && (stream[i + 1] === 'd' || stream[i + 1] === 'D')) {
            result += '\n';
            i += 2;
        } else {
            i++;
        }
    }
    return result;
}

function uint8ArrayToBase64(arr: Uint8Array): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64 = '';
    const len = arr.length;
    for (let i = 0; i < len; i += 3) {
        const b1 = arr[i];
        const b2 = i + 1 < len ? arr[i + 1] : NaN;
        const b3 = i + 2 < len ? arr[i + 2] : NaN;
        
        const enc1 = b1 >> 2;
        const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : (b2 >> 4));
        const enc3 = isNaN(b2) ? 64 : (((b2 & 15) << 2) | (isNaN(b3) ? 0 : (b3 >> 6)));
        const enc4 = isNaN(b3) ? 64 : (b3 & 63);
        
        base64 += chars.charAt(enc1) + chars.charAt(enc2) + 
                  (enc3 === 64 ? '=' : chars.charAt(enc3)) + 
                  (enc4 === 64 ? '=' : chars.charAt(enc4));
    }
    return base64;
}

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
        try {
            const pdf = await this.loadPDF(uri, { ignoreEncryption: true });
            const pages = pdf.getPages();
            const context = pdf.context;
            let fullText = '';

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const contents = page.node.Contents();
                if (!contents) continue;

                let refs: any[] = [];
                if ((contents as any).array) {
                    refs = (contents as any).array;
                } else {
                    refs = [contents];
                }

                let pageText = '';
                for (const ref of refs) {
                    const streamObj = context.lookup(ref);
                    if (streamObj instanceof PDFRawStream) {
                        const decodedBytes = decodePDFRawStream(streamObj).decode();
                        
                        let streamStr = '';
                        for (let k = 0; k < decodedBytes.length; k++) {
                            streamStr += String.fromCharCode(decodedBytes[k]);
                        }
                        
                        pageText += parseContentStream(streamStr);
                    }
                }
                
                if (pageText.trim()) {
                    fullText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
                }
            }
            
            return fullText || 'No extractable text found in this PDF.';
        } catch (error) {
            console.error('Text extraction failed:', error);
            throw new Error('Failed to extract text from PDF.');
        }
    }

    /**
     * Extract JPEG images from a PDF
     */
    async extractImages(uri: string): Promise<string[]> {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const pdfDoc = await PDFDocument.load(base64, { ignoreEncryption: true });
            const enumeratedObjects = pdfDoc.context.enumerateIndirectObjects();
            const extractedUris: string[] = [];
            
            let imgIndex = 0;
            for (const [ref, pdfObject] of enumeratedObjects) {
                if (!(pdfObject instanceof PDFRawStream)) continue;
                
                const subtype = pdfObject.dict.get(PDFName.of('Subtype'));
                if (subtype === PDFName.of('Image')) {
                    const filter = pdfObject.dict.get(PDFName.of('Filter'));
                    
                    let isJpeg = false;
                    if (filter === PDFName.of('DCTDecode')) {
                        isJpeg = true;
                    } else if (filter instanceof PDFArray) {
                        isJpeg = (filter as any).asArray().some((f: any) => f === PDFName.of('DCTDecode'));
                    }
                    
                    if (isJpeg) {
                        const decodedBytes = decodePDFRawStream(pdfObject).decode();
                        const imgBase64 = uint8ArrayToBase64(decodedBytes);
                        const filename = `extracted_img_${Date.now()}_${imgIndex + 1}.jpg`;
                        const fileUri = FileSystem.documentDirectory + filename;
                        
                        await FileSystem.writeAsStringAsync(fileUri, imgBase64, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        extractedUris.push(fileUri);
                        imgIndex++;
                    }
                }
            }
            return extractedUris;
        } catch (error) {
            console.error('Image extraction failed:', error);
            throw new Error('Failed to extract images from PDF.');
        }
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
