// AxiomOS — EMBEDDING_UTILS.ts
// Chunking + embedding utilities for all memory write paths
// Deps: openai (for embeddings), tiktoken (token counting)

import OpenAI from "https://esm.sh/openai@4";

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMS = 1536
export const CHUNK_SIZE_TOKENS = 400
export const CHUNK_OVERLAP_TOKENS = 80

// ============================================================
// TOKEN ESTIMATION
// Rough estimate — avoids tiktoken dependency for edge runtime
// ============================================================

export function estimateTokens(text: string): number {
  // ~4 chars per token for English text
  return Math.ceil(text.length / 4)
}

// ============================================================
// CHUNKING
// ============================================================

export interface Chunk {
  content: string
  chunkIndex: number
  chunkTotal: number
  tokenEstimate: number
}

/**
 * Split text into overlapping chunks for embedding.
 * Uses paragraph boundaries when possible, falls back to word boundaries.
 */
export function chunkText(
  text: string,
  maxTokens: number = CHUNK_SIZE_TOKENS,
  overlapTokens: number = CHUNK_OVERLAP_TOKENS
): Chunk[] {
  const cleanText = text.replace(/\r\n/g, '\n').trim()
  if (!cleanText) return []

  // Split into paragraphs first
  const paragraphs = cleanText.split(/\n\n+/).filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    const combined = current ? `${current}\n\n${para}` : para
    const tokens = estimateTokens(combined)

    if (tokens <= maxTokens) {
      current = combined
    } else {
      if (current) chunks.push(current)

      // Para itself too large — split by sentences
      if (estimateTokens(para) > maxTokens) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para]
        let sentChunk = ''
        for (const s of sentences) {
          const combined = sentChunk ? `${sentChunk} ${s}` : s
          if (estimateTokens(combined) <= maxTokens) {
            sentChunk = combined
          } else {
            if (sentChunk) chunks.push(sentChunk)
            sentChunk = s
          }
        }
        if (sentChunk) current = sentChunk
      } else {
        current = para
      }
    }
  }

  if (current) chunks.push(current)

  // Add overlap: prepend tail of previous chunk to current
  const overlapped: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    if (i === 0 || overlapTokens === 0) {
      overlapped.push(chunks[i])
    } else {
      const prev = chunks[i - 1]
      const words = prev.split(' ')
      // Approx overlap: grab last N tokens worth of words
      const overlapWordCount = Math.ceil(overlapTokens / 1.3)
      const tail = words.slice(-overlapWordCount).join(' ')
      overlapped.push(`${tail}\n\n${chunks[i]}`)
    }
  }

  return overlapped.map((content, i) => ({
    content,
    chunkIndex: i,
    chunkTotal: overlapped.length,
    tokenEstimate: estimateTokens(content),
  }))
}

/**
 * Chunk short event logs — smaller window, no overlap needed
 */
export function chunkEventLog(text: string): Chunk[] {
  return chunkText(text, 200, 40)
}

// ============================================================
// EMBEDDING
// ============================================================

/**
 * Embed a single string. Returns float array.
 */
export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, ' '),
  })
  return res.data[0].embedding
}

/**
 * Batch embed up to 2048 inputs. Respects OpenAI batch limits.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 100
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map(t => t.replace(/\n/g, ' '))
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })
    results.push(...res.data.map(d => d.embedding))
  }

  return results
}

/**
 * Embed all chunks in a document. Returns chunks with embeddings attached.
 */
export async function embedChunks(
  chunks: Chunk[]
): Promise<(Chunk & { embedding: number[] })[]> {
  const texts = chunks.map(c => c.content)
  const embeddings = await embedBatch(texts)
  return chunks.map((chunk, i) => ({ ...chunk, embedding: embeddings[i] }))
}

/**
 * Full pipeline: text → chunks → embeddings
 */
export async function chunkAndEmbed(
  text: string,
  options?: { maxTokens?: number; overlapTokens?: number; isEventLog?: boolean }
): Promise<(Chunk & { embedding: number[] })[]> {
  const chunks = options?.isEventLog
    ? chunkEventLog(text)
    : chunkText(text, options?.maxTokens, options?.overlapTokens)

  return embedChunks(chunks)
}

// ============================================================
// FORMATTING
// ============================================================

/**
 * Format embedding as Postgres vector literal for raw SQL inserts
 */
export function formatEmbedding(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}
