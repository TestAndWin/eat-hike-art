import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Entry, RestaurantEntry, ArtEntry, TourEntry } from '@/lib/types';

const DATA_DIR = import.meta.env.DATA_DIR || process.env.DATA_DIR || '/var/www/data';

// Directory names for each entry type
const TYPE_DIRS: Record<Entry['type'], string> = {
  restaurant: 'restaurants',
  art: 'art',
  tour: 'tours',
};

/**
 * Get the directory path for a specific entry type
 */
function getTypeDir(type: Entry['type']): string {
  return path.join(DATA_DIR, 'entries', TYPE_DIRS[type]);
}

/**
 * Ensure the directory for a type exists
 */
async function ensureTypeDir(type: Entry['type']): Promise<void> {
  const dir = getTypeDir(type);
  await mkdir(dir, { recursive: true });
}

/**
 * Generate a slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a filename from date and slug
 */
function generateFilename(date: string, slug: string): string {
  return `${date}-${slug}.md`;
}

/**
 * Parse a markdown file to an Entry object
 */
function parseEntry(content: string, filename: string): Entry {
  const { data: frontmatter, content: body } = matter(content);

  // Extract slug from filename (remove date prefix and .md suffix)
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

  // Convert markdown body to HTML
  const htmlContent = marked.parse(body.trim()) as string;

  return {
    ...frontmatter,
    slug,
    content: htmlContent,
    images: frontmatter.images || [],
  } as Entry;
}

/**
 * Serialize an Entry object to markdown
 */
function serializeEntry(entry: Entry): string {
  const { content, slug, ...frontmatter } = entry;

  // Remove undefined values
  const cleanFrontmatter = Object.fromEntries(
    Object.entries(frontmatter).filter(([, v]) => v !== undefined)
  );

  return matter.stringify(content, cleanFrontmatter);
}

/**
 * Get all entries of a specific type
 */
export async function getAllEntries(type: Entry['type']): Promise<Entry[]> {
  const dir = getTypeDir(type);

  try {
    const files = await readdir(dir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    const entries = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(dir, filename);
        const content = await readFile(filePath, 'utf-8');
        return parseEntry(content, filename);
      })
    );

    // Sort by date descending
    return entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    // Directory doesn't exist yet
    return [];
  }
}

/**
 * Get active entries of a specific type (for public pages)
 */
export async function getActiveEntries(type: Entry['type']): Promise<Entry[]> {
  const entries = await getAllEntries(type);
  return entries.filter((e) => e.status === 'active');
}

/**
 * Get a single entry by type and slug
 */
export async function getEntry(
  type: Entry['type'],
  slug: string
): Promise<Entry | null> {
  const entries = await getAllEntries(type);
  return entries.find((e) => e.slug === slug) || null;
}

/**
 * Get latest entries across all types (for homepage)
 */
export async function getLatestEntries(limit: number = 3): Promise<Entry[]> {
  const allTypes: Entry['type'][] = ['restaurant', 'art', 'tour'];

  const allEntries = await Promise.all(
    allTypes.map((type) => getActiveEntries(type))
  );

  return allEntries
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get leaderboard (top-rated entries)
 */
export async function getLeaderboard(
  type: Entry['type'],
  cuisine?: string
): Promise<Entry[]> {
  let entries = await getActiveEntries(type);

  // Filter by cuisine for restaurants
  if (type === 'restaurant' && cuisine) {
    entries = (entries as RestaurantEntry[]).filter(
      (e) => e.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  return entries.sort((a, b) => b.rating - a.rating);
}

/**
 * Get all unique cuisines from restaurant entries
 */
export async function getCuisines(): Promise<string[]> {
  const entries = (await getActiveEntries('restaurant')) as RestaurantEntry[];
  const cuisines = [...new Set(entries.map((e) => e.cuisine))];
  return cuisines.sort();
}

/**
 * Create a new entry
 */
export async function createEntry(
  entry: Omit<Entry, 'slug'>
): Promise<Entry> {
  await ensureTypeDir(entry.type);

  const slug = generateSlug(entry.name);
  const filename = generateFilename(entry.date, slug);
  const filePath = path.join(getTypeDir(entry.type), filename);

  const fullEntry = { ...entry, slug } as Entry;
  const markdown = serializeEntry(fullEntry);

  await writeFile(filePath, markdown, 'utf-8');

  return fullEntry;
}

/**
 * Update an existing entry
 */
export async function updateEntry(
  type: Entry['type'],
  slug: string,
  updates: Partial<Entry>
): Promise<Entry | null> {
  const existing = await getEntry(type, slug);
  if (!existing) return null;

  const dir = getTypeDir(type);

  // Find the existing file
  const files = await readdir(dir);
  const existingFile = files.find((f) => f.includes(slug) && f.endsWith('.md'));
  if (!existingFile) return null;

  const oldFilePath = path.join(dir, existingFile);

  // Merge updates
  const updated = { ...existing, ...updates } as Entry;

  // Check if date or name changed (requires new filename)
  const newSlug = updates.name ? generateSlug(updates.name) : slug;
  const newDate = updates.date || existing.date;
  const newFilename = generateFilename(newDate, newSlug);
  const newFilePath = path.join(dir, newFilename);

  // Update the slug if name changed
  if (newSlug !== slug) {
    updated.slug = newSlug;
  }

  const markdown = serializeEntry(updated);

  // If filename changed, delete old file
  if (newFilename !== existingFile) {
    await unlink(oldFilePath);
  }

  await writeFile(newFilePath, markdown, 'utf-8');

  return updated;
}

/**
 * Soft delete an entry (set status to inactive)
 */
export async function softDeleteEntry(
  type: Entry['type'],
  slug: string
): Promise<boolean> {
  const result = await updateEntry(type, slug, { status: 'inactive' });
  return result !== null;
}

/**
 * Hard delete an entry (remove file)
 */
export async function deleteEntry(
  type: Entry['type'],
  slug: string
): Promise<boolean> {
  const dir = getTypeDir(type);

  try {
    const files = await readdir(dir);
    const file = files.find((f) => f.includes(slug) && f.endsWith('.md'));
    if (!file) return false;

    await unlink(path.join(dir, file));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image URL for an entry
 */
export function getImageUrl(entry: Entry, filename: string): string {
  return `/images/${TYPE_DIRS[entry.type]}/${entry.slug}/${filename}`;
}
