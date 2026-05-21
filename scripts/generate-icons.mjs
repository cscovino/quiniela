import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0f"/>
  <rect x="64" y="64" width="384" height="384" fill="#12121a" stroke="#00bfff" stroke-width="16"/>
  <circle cx="256" cy="256" r="120" fill="#00bfff" stroke="#007399" stroke-width="8"/>
  <polygon points="256,136 280,200 256,220 232,200" fill="#0a0a0f"/>
  <polygon points="256,376 232,312 256,292 280,312" fill="#0a0a0f"/>
  <polygon points="136,256 200,232 220,256 200,280" fill="#0a0a0f"/>
  <polygon points="376,256 312,280 292,256 312,232" fill="#0a0a0f"/>
  <circle cx="256" cy="256" r="40" fill="#0a0a0f" stroke="#007399" stroke-width="4"/>
</svg>
`;

mkdirSync(iconsDir, { recursive: true });

for (const size of sizes) {
  const buffer = await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toBuffer();

  writeFileSync(join(iconsDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Created icon-${size}x${size}.png`);
}

console.log('All icons generated!');
