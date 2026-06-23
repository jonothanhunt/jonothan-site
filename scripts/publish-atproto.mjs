import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { AtpAgent } from '@atproto/api';

dotenv.config({ path: '.env.local' });

import { toString } from 'mdast-util-to-string';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const SITE_URL = 'https://jonothan.dev';

async function processMdxFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath, '.mdx');
  
  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  const dateMatch = content.match(/date:\s*"([^"]+)"/);
  const descMatch = content.match(/description:\s*"([^"]+)"/);
  
  const title = titleMatch ? titleMatch[1] : slug;
  const date = dateMatch ? dateMatch[1] : new Date().toISOString();
  const desc = descMatch ? descMatch[1] : '';

  const fileUrl = `${SITE_URL}/blog/${slug}`;

  let plainTextDesc = '';

  // Process the Markdown AST
  const processor = remark().use(remarkMdx).use(() => (tree) => {
    // Remove the export metadata block from the output text
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      parent.children.splice(index, 1);
      return [visit.SKIP, index];
    });

    // Create a plain text description from the tree by ignoring images and jsx
    const descTree = JSON.parse(JSON.stringify(tree));
    visit(descTree, ['image', 'mdxJsxFlowElement', 'mdxJsxTextElement', 'html'], (node, index, parent) => {
      if (parent) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
    plainTextDesc = toString(descTree).trim().replace(/\s+/g, ' ');
    if (plainTextDesc.length > 200) {
      plainTextDesc = plainTextDesc.slice(0, 200) + '...';
    }

    // Handle SandpackEmbed fallbacks
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (node.name === 'SandpackEmbed') {
        const fallbackNode = {
          type: 'paragraph',
          children: [
            {
              type: 'emphasis',
              children: [
                {
                  type: 'link',
                  url: fileUrl,
                  children: [{ type: 'text', value: 'View interactive code demo on jonothan.dev' }],
                },
              ],
            },
          ],
        };
        parent.children.splice(index, 1, fallbackNode);
        return [visit.SKIP, index];
      }
    });

    visit(tree, 'image', (node) => {
      let url = node.url;
      // Convert relative to absolute for external reading
      if (url.startsWith('/')) {
        url = `${SITE_URL}${url}`;
        node.url = url; 
      }
    });
  });

  const result = await processor.process(content);
  const markdownBody = String(result).trim();

  // Construct the Standard.site Document payload
  const standardSitePayload = {
    $type: 'site.standard.document',
    title,
    publishedAt: new Date(date).toISOString(),
    content: [
      {
        $type: 'site.standard.block.markdown',
        value: markdownBody
      }
    ],
    textContent: markdownBody,
    description: desc || plainTextDesc,
    site: `at://${process.env.ATPROTO_DID || 'did:plc:3su63qgei4gylhflvwqj54lw'}/site.standard.publication/main`,
    path: `/blog/${slug}`
  };

  return standardSitePayload;
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
  const iconPath = path.join(process.cwd(), 'src/app/icon.svg');
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
      rkey: 'main',

      record: {
        $type: 'site.standard.publication',
        ...(iconBlobRef ? { icon: iconBlobRef } : {}),

        url: SITE_URL,
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

  const localSlugs = new Set();

  for (const file of files) {
    const slug = path.basename(file, '.mdx');
    localSlugs.add(slug);
    try {
      const payload = await processMdxFile(file);
      
      console.log(`Publishing standard.site document for: ${slug}...`);
      await agent.com.atproto.repo.putRecord({
        repo: agent.session.did,
        collection: 'site.standard.document',
        rkey: slug,
        record: payload
      });
      console.log(`✅ Successfully published: ${slug}`);
    } catch (e) {
      console.error(`❌ Error publishing ${slug}:`, e.message || e);
    }
  }

  // Delete orphaned records
  let deletedCount = 0;
  for (const record of existingRecords) {
    const rkey = record.uri.split('/').pop();
    if (!localSlugs.has(rkey)) {
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

  console.log(`\nSync complete! Published ${localSlugs.size} records, Deleted ${deletedCount} orphaned records.`);
}

main().catch(console.error);
