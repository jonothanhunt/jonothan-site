import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { AtpAgent } from '@atproto/api';
import { TID } from '@atproto/common-web';

dotenv.config({ path: '.env.local' });

import { toString } from 'mdast-util-to-string';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');
const SITE_URL = 'https://jonothan.dev';
const ATPROTO_DID = process.env.ATPROTO_DID || 'did:plc:3su63qgei4gylhflvwqj54lw';

// The standard.site lexicons declare `key: tid`, so every record key (rkey) MUST be a
// valid Timestamp Identifier — NOT a slug or a literal like "main". We keep a persistent
// slug -> TID map so each document/publication keeps a stable record key across runs (and
// so the site's <link> tags and the published records always agree).
const TIDS_PATH = path.join(process.cwd(), 'src/data/atproto-tids.json');
const PUBLICATION_KEY = '__publication__';

function loadTids() {
  try {
    return JSON.parse(fs.readFileSync(TIDS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveTids(tids) {
  fs.mkdirSync(path.dirname(TIDS_PATH), { recursive: true });
  fs.writeFileSync(TIDS_PATH, JSON.stringify(tids, null, 2) + '\n');
}

const tids = loadTids();

// Returns the stable TID for a key, generating and persisting a new one on first sight.
function getTid(key) {
  if (!tids[key]) {
    tids[key] = TID.nextStr();
    saveTids(tids);
    console.log(`Generated new TID for "${key}": ${tids[key]}`);
  }
  return tids[key];
}

async function processMdxFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.mdx');
  
  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  // Frontmatter's `date:` is unquoted (content.config.ts: `z.coerce.date()`) and the
  // excerpt field is actually named `excerpt`, not `description` — matching the wrong
  // shape here meant both silently fell through to their fallback on every post: every
  // publishedAt was "now" (script run time) instead of the real date, and every
  // description was the auto-truncated plaintext extract below instead of the curated
  // excerpt the site itself uses for og:description.
  const dateMatch = content.match(/^date:\s*"?([^"\n]+?)"?\s*$/m);
  const descMatch = content.match(/excerpt:\s*"([^"]+)"/);
  const imageMatch = content.match(/^image:\s*"([^"]+)"/m);

  const title = titleMatch ? titleMatch[1] : slug;
  const date = dateMatch ? dateMatch[1] : new Date().toISOString();
  const desc = descMatch ? descMatch[1] : '';

  let bodyContent = content.replace(/^---[\s\S]+?---\n*/, '');

  // Process the Markdown AST into plain text. The lexicon defines `textContent` as
  // "plaintext without markup" (not Markdown), so images/JSX/HTML and the MDX export
  // block are all stripped before flattening to text.
  let plainTextFull = '';
  const processor = remark().use(remarkMdx).use(() => (tree) => {
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      parent.children.splice(index, 1);
      return [visit.SKIP, index];
    });
    visit(tree, ['image', 'mdxJsxFlowElement', 'mdxJsxTextElement', 'html'], (node, index, parent) => {
      if (parent) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
    // toString() concatenates text nodes with no separator, so without this, adjacent
    // blocks run together ("usage.What it is") and understate the word count the
    // reading-time estimate is built from. Flattening block-by-block keeps a space
    // between them.
    plainTextFull = tree.children
      .map((node) => toString(node))
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  });

  await processor.process(bodyContent);
  const plainTextDesc = plainTextFull.length > 200
    ? plainTextFull.slice(0, 200) + '...'
    : plainTextFull;

  // Resolve the frontmatter cover image to an absolute path, for main() to upload as
  // the document's `coverImage` blob (drives the link-card thumbnail).
  const coverImagePath = imageMatch
    ? path.resolve(path.dirname(filePath), imageMatch[1])
    : null;

  // Construct the Standard.site Document payload
  // NOTE: Do NOT add a `content` field. The standard.site `content` union has no
  // published block lexicons (e.g. `site.standard.block.markdown` does not exist), so
  // including it makes Bluesky's card service (cardyb) reject the record and fall back to
  // a plain OpenGraph preview. The known-working publishers (standard.site, atproto.com)
  // publish metadata only; `textContent` is enough for the reading-time estimate.
  const standardSitePayload = {
    $type: 'site.standard.document',
    title,
    publishedAt: new Date(date).toISOString(),
    textContent: plainTextFull,
    description: desc || plainTextDesc,
    site: `at://${ATPROTO_DID}/site.standard.publication/${getTid(PUBLICATION_KEY)}`,
    // Relative to the publication's own `url` (main(): SITE_URL + '/blog'), not SITE_URL —
    // cardyb reconstructs each document's page URL as `publication.url + path` to confirm
    // the record actually belongs to the page being carded, and silently drops the
    // correlation if it doesn't match. `/blog/${slug}` here used to double up with the
    // publication's own `/blog` into `.../blog/blog/${slug}`, so no document ever validated.
    path: `/${slug}`
  };

  return { payload: standardSitePayload, coverImagePath };
}

async function main() {
  console.log("Starting AT Protocol publisher...\n");

  if (!process.env.ATPROTO_HANDLE || !process.env.ATPROTO_PASSWORD) {
    console.warn("Skipping AT Protocol publish: Missing ATPROTO_HANDLE or ATPROTO_PASSWORD in .env.local");
    return;
  }

  const agent = new AtpAgent({ service: 'https://bsky.social' });
  try {
    await agent.login({
      identifier: process.env.ATPROTO_HANDLE,
      password: process.env.ATPROTO_PASSWORD
    });
    console.log(`Successfully logged in as ${agent.session.handle}`);
  } catch (e) {
    console.error("Failed to login to AT Protocol:", e.message);
    return;
  }

  
  let iconBlobRef = null;
  const iconPath = path.join(process.cwd(), 'public/icon.svg');
  if (fs.existsSync(iconPath)) {
    console.log("Found site icon, converting to PNG and uploading to AT Protocol...");
    try {
      const pngBuffer = await sharp(iconPath)
        .resize(512, 512)
        .png()
        .toBuffer();
      
      const uploadRes = await agent.com.atproto.repo.uploadBlob(pngBuffer, {
        encoding: 'image/png'
      });
      
      iconBlobRef = uploadRes.data.blob;
      console.log("✅ Successfully uploaded site icon blob");
    } catch (e) {
      console.error("❌ Failed to upload site icon:", e.message);
    }
  }

  // Publish publication record

  try {
    console.log(`Publishing standard.site publication record...`);
    await agent.com.atproto.repo.putRecord({
      repo: agent.session.did,
      collection: 'site.standard.publication',
      rkey: getTid(PUBLICATION_KEY),

      record: {
        $type: 'site.standard.publication',
        ...(iconBlobRef ? { icon: iconBlobRef } : {}),

        url: `${SITE_URL}/blog`,
        // Changed to /blog so 'View Publication' links to the blog index instead of the root homepage
        name: 'Jonothan Hunt',
        description: 'Jonothan Hunt\'s Blog',
        preferences: {
          showInDiscover: true
        },
        basicTheme: {
          $type: 'site.standard.theme.basic',
          accent: {
            b: 255,
            g: 255,
            r: 255,
            $type: 'site.standard.theme.color#rgb'
          },
          background: {
            b: 0,
            g: 0,
            r: 0,
            $type: 'site.standard.theme.color#rgb'
          },
          foreground: {
            b: 255,
            g: 255,
            r: 255,
            $type: 'site.standard.theme.color#rgb'
          },
          accentForeground: {
            b: 0,
            g: 0,
            r: 0,
            $type: 'site.standard.theme.color#rgb'
          }
        }
      }
    });
    console.log(`✅ Successfully published publication record`);
  } catch (e) {
    console.error(`❌ Error publishing publication record:`, e.message || e);
  }

  // Clean up stale publication records (e.g. the old "main" rkey from before TIDs).
  try {
    const pubRes = await agent.com.atproto.repo.listRecords({
      repo: agent.session.did,
      collection: 'site.standard.publication',
      limit: 100
    });
    for (const record of pubRes.data.records) {
      const rkey = record.uri.split('/').pop();
      if (rkey !== getTid(PUBLICATION_KEY)) {
        console.log(`Deleting stale publication record: ${rkey}...`);
        await agent.com.atproto.repo.deleteRecord({
          repo: agent.session.did,
          collection: 'site.standard.publication',
          rkey
        });
        console.log(`✅ Deleted stale publication record: ${rkey}`);
      }
    }
  } catch (e) {
    console.error(`❌ Error cleaning up stale publication records:`, e.message || e);
  }

  // Get all existing records from PDS
  let existingRecords = [];
  try {
    let cursor;
    do {
      const res = await agent.com.atproto.repo.listRecords({
        repo: agent.session.did,
        collection: 'site.standard.document',
        limit: 100,
        cursor
      });
      existingRecords.push(...res.data.records);
      cursor = res.data.cursor;
    } while (cursor);
    console.log(`Found ${existingRecords.length} existing documents on the AT Protocol.`);
  } catch (e) {
    console.error("Failed to list existing records. Aborting sync to be safe.", e.message);
    return;
  }

  const files = [];
  
  // Recursively find .mdx files
  function findMdx(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        findMdx(fullPath);
      } else if (fullPath.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  findMdx(CONTENT_DIR);

  if (files.length === 0) {
    console.error("No local .mdx files found! Aborting to prevent accidental deletion of all PDS records.");
    return;
  }

  // TID rkeys of documents we publish this run; anything else on the PDS is an orphan
  // (this includes the old slug-keyed records, which get cleaned up below).
  const publishedTids = new Set();

  for (const file of files) {
    const slug = path.basename(file, '.mdx');
    const rkey = getTid(slug);
    publishedTids.add(rkey);
    try {
      const { payload, coverImagePath } = await processMdxFile(file);

      if (coverImagePath && fs.existsSync(coverImagePath)) {
        const mimeType = coverImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        try {
          const uploadRes = await agent.com.atproto.repo.uploadBlob(
            fs.readFileSync(coverImagePath),
            { encoding: mimeType }
          );
          payload.coverImage = uploadRes.data.blob;
        } catch (e) {
          console.error(`⚠️  Failed to upload cover image for ${slug}:`, e.message || e);
        }
      }

      console.log(`Publishing standard.site document for: ${slug} (${rkey})...`);
      await agent.com.atproto.repo.putRecord({
        repo: agent.session.did,
        collection: 'site.standard.document',
        rkey,
        record: payload
      });
      console.log(`✅ Successfully published: ${slug}`);
    } catch (e) {
      console.error(`❌ Error publishing ${slug}:`, e.message || e);
    }
  }

  // Delete orphaned records (old slug-keyed records and removed posts)
  let deletedCount = 0;
  for (const record of existingRecords) {
    const rkey = record.uri.split('/').pop();
    if (!publishedTids.has(rkey)) {
      console.log(`Deleting orphaned document from AT Protocol: ${rkey}...`);
      try {
        await agent.com.atproto.repo.deleteRecord({
          repo: agent.session.did,
          collection: 'site.standard.document',
          rkey: rkey
        });
        console.log(`✅ Successfully deleted: ${rkey}`);
        deletedCount++;
      } catch (e) {
        console.error(`❌ Error deleting ${rkey}:`, e.message || e);
      }
    }
  }

  console.log(`\nSync complete! Published ${publishedTids.size} records, Deleted ${deletedCount} orphaned records.`);
}

main().catch(console.error);
