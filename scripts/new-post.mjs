import fs from 'fs';
import path from 'path';

// Get the title from the command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Please provide a title for the new post.');
  console.log('Usage: npm run new-post "My Awesome Post Title"');
  process.exit(1);
}

const title = args[0];

// Generate a slug from the title
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
  .replace(/(^-|-$)+/g, '');   // Remove leading or trailing hyphens

// Get the current date in YYYY-MM-DD format
const date = new Date().toISOString().split('T')[0];

// Define paths
const mdxPath = path.join(process.cwd(), `src/content/blog/${slug}.mdx`);
const imagesDir = path.join(process.cwd(), `public/blog-content/${slug}/images`);

// Ensure we don't overwrite an existing post
if (fs.existsSync(mdxPath)) {
  console.error('\x1b[31m%s\x1b[0m', `Error: A post with the slug "${slug}" already exists.`);
  process.exit(1);
}

// Create the MDX content with frontmatter
const mdxContent = `---
title: "${title}"
description: ""
date: "${date}"
---

Write your post content here...

## Images
You can add images by putting them in the \`public/blog-content/${slug}/images\` folder, and referencing them like this:

![Alt text](/blog-content/${slug}/images/your-image.png)
`;

// Write the MDX file
fs.writeFileSync(mdxPath, mdxContent, 'utf8');

// Create the images directory
fs.mkdirSync(imagesDir, { recursive: true });

console.log('\x1b[32m%s\x1b[0m', `✅ Successfully created new post: "${title}"`);
console.log(`\n📄 File: ${mdxPath}`);
console.log(`📁 Images folder: ${imagesDir}`);
console.log('\nHappy writing!');
