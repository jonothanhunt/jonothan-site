const fs = require('fs');

let content = fs.readFileSync('scripts/publish-atproto.mjs', 'utf8');

// Add sharp import
if (!content.includes('import sharp')) {
  content = content.replace("import * as dotenv from 'dotenv';", "import * as dotenv from 'dotenv';\nimport sharp from 'sharp';");
}

// Add blob upload
const blobUploadCode = `
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
`;

content = content.replace("// Publish publication record", blobUploadCode);

// Add icon field to record
const pubRecordCode = `
      record: {
        $type: 'site.standard.publication',
        ...(iconBlobRef ? { icon: iconBlobRef } : {}),
`;

content = content.replace("      record: {\n        $type: 'site.standard.publication',", pubRecordCode);

fs.writeFileSync('scripts/publish-atproto.mjs', content);
console.log('Script updated');
