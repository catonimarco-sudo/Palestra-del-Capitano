import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal pure-Node PNG generator without external dependencies
function createPng(width, height, getRgbaPixel) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // 3. IDAT Chunk (Raw scanlines with filter type 0)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getRgbaPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // 4. IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) | 0;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Pixel shader for FitSquad & HOF Fitness Icon
function gymIconShader(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Rich dark slate (#090d16 to #020617) with lime-emerald glow
  const tY = y / h;
  let r = Math.round(10 * (1 - tY) + 2 * tY);
  let g = Math.round(18 * (1 - tY) + 6 * tY);
  let b = Math.round(30 * (1 - tY) + 12 * tY);

  // Radial green glow in center
  const glow = Math.max(0, 1 - dist / (w * 0.45));
  r = Math.min(255, Math.round(r + glow * 35));
  g = Math.min(255, Math.round(g + glow * 105));
  b = Math.min(255, Math.round(b + glow * 40));

  // Subtle border
  const cornerR = w * 0.22;
  // Inside icon drawing: dumbbell symbol
  // Bar: y around cy, x between w*0.35 and w*0.65
  const barHalfThick = h * 0.035;
  const isBar = Math.abs(dy) <= barHalfThick && Math.abs(dx) <= w * 0.25;

  // Weight plates
  // Inner plates at x = +- w*0.2
  const innerPlateW = w * 0.045;
  const innerPlateH = h * 0.16;
  const isInnerPlate =
    (Math.abs(dx - w * 0.2) <= innerPlateW || Math.abs(dx + w * 0.2) <= innerPlateW) &&
    Math.abs(dy) <= innerPlateH;

  // Outer plates at x = +- w*0.28
  const outerPlateW = w * 0.04;
  const outerPlateH = h * 0.23;
  const isOuterPlate =
    (Math.abs(dx - w * 0.28) <= outerPlateW || Math.abs(dx + w * 0.28) <= outerPlateW) &&
    Math.abs(dy) <= outerPlateH;

  // Center plate collar
  const collarW = w * 0.035;
  const collarH = h * 0.06;
  const isCollar =
    (Math.abs(dx - w * 0.12) <= collarW || Math.abs(dx + w * 0.12) <= collarW) &&
    Math.abs(dy) <= collarH;

  if (isOuterPlate || isInnerPlate || isBar || isCollar) {
    // #7cb342 lime green with gradient
    return [124, 179, 66, 255];
  }

  return [r, g, b, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Apple Touch Icon (180x180)
const appleIcon = createPng(180, 180, gymIconShader);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Created public/apple-touch-icon.png (180x180)');

// 2. Icon 192x192
const icon192 = createPng(192, 192, gymIconShader);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('✓ Created public/icon-192.png (192x192)');

// 3. Icon 512x512
const icon512 = createPng(512, 512, gymIconShader);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('✓ Created public/icon-512.png (512x512)');
