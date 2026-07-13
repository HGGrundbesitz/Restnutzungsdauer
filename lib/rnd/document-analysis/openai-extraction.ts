import 'server-only';
import OpenAI from 'openai';
import {PDFDocument} from 'pdf-lib';
import {DOCUMENT_EXTRACTION_JSON_SCHEMA, parseDocumentExtractionOutput} from './schema.ts';
import {DOCUMENT_EXTRACTION_PROMPT} from './prompt.ts';
import type {DocumentExtractionResult} from './types.ts';

export const DEFAULT_DOCUMENT_ANALYSIS_MODEL = 'gpt-5.4-mini';

type ExtractDocumentFactsOptions = {
  buffer: Buffer;
  documentPath: string;
  fileName: string;
  apiKey: string;
  model?: string;
};

export type DocumentExtractionExecution = {
  model: string;
  pageCount: number;
  result: DocumentExtractionResult;
};

export async function extractDocumentFacts({
  buffer,
  documentPath,
  fileName,
  apiKey,
  model = DEFAULT_DOCUMENT_ANALYSIS_MODEL,
}: ExtractDocumentFactsOptions): Promise<DocumentExtractionExecution> {
  const pdf = await PDFDocument.load(buffer, {ignoreEncryption: true});
  const pageCount = pdf.getPageCount();
  if (pageCount < 1) {
    throw new Error('Das PDF enthält keine lesbare Seite.');
  }

  const client = new OpenAI({apiKey, timeout: 75_000, maxRetries: 1});
  const response = await client.responses.create({
    model,
    store: false,
    max_output_tokens: 6_000,
    instructions: DOCUMENT_EXTRACTION_PROMPT,
    text: {
      format: {
        type: 'json_schema',
        name: 'rnd_document_facts',
        description: 'Belegte Immobilienangaben mit PDF-Seite und Textstelle zur manuellen Prüfung.',
        strict: true,
        schema: DOCUMENT_EXTRACTION_JSON_SCHEMA,
      },
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_file',
            filename: fileName,
            file_data: `data:application/pdf;base64,${buffer.toString('base64')}`,
            detail: 'high',
          },
          {
            type: 'input_text',
            text: `Prüfe dieses PDF. Verwende für documentPath exakt "${documentPath}" und für fileName exakt "${fileName}".`,
          },
        ],
      },
    ],
  });

  const output = response.output_text?.trim();
  if (!output) {
    throw new Error('Für dieses Dokument wurden keine strukturierten Angaben zurückgegeben.');
  }

  return {
    model,
    pageCount,
    result: parseDocumentExtractionOutput(output, {documentPath, fileName, pageCount}),
  };
}

