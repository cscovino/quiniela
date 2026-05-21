import sharp from 'sharp';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Read Gamepad SVG from pixelarticons and wrap it with background
const gamepadSvg = readFileSync(
  join(__dirname, '..', 'node_modules', 'pixelarticons', 'svg', 'gamepad.svg'),
  'utf-8',
);

// Create icon SVG with dark background and accent-colored gamepad
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0f" rx="64"/>
  <rect x="32" y="32" width="448" height="448" fill="#12121a" stroke="#1D3557" stroke-width="16" rx="48"/>
  <g transform="translate(128, 128) scale(10.67)">
    ${gamepadSvg.replace('fill="currentColor"', 'fill="#1D3557"')}
  </g>
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

console.log('All icons generated with Gamepad icon!');
