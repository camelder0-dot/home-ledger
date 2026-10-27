// Draws build/icon.png (512x512) with no image libraries: `npm run icon`.
// A ledger page on a blue tile: header bar, ruled lines, and a green column of amounts.
const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');

const SIZE = 512;
const BLUE = [37, 99, 235], PAGE = [255, 255, 255], HEAD = [31, 42, 55], LINE = [203, 213, 225], GREEN = [30, 132, 73];

// Shapes on a 64-unit grid, drawn in order; r = corner radius.
const shapes = [
  { x: 0, y: 0, w: 64, h: 64, r: 13, c: BLUE },
  { x: 13, y: 10, w: 38, h: 44, r: 3, c: PAGE },
  { x: 13, y: 10, w: 38, h: 9, r: 3, c: HEAD },
  { x: 13, y: 15, w: 38, h: 4, r: 0, c: HEAD },
  ...[25, 32, 39, 46].flatMap((y) => [
    { x: 18, y, w: 18, h: 2.4, r: 1, c: LINE },
    { x: 39, y, w: 8, h: 2.4, r: 1, c: GREEN },
  ]),
];

function inside(u, v, s) {
  if (u < s.x || u >= s.x + s.w || v < s.y || v >= s.y + s.h) return false;
  const cx = Math.min(Math.max(u, s.x + s.r), s.x + s.w - s.r);
  const cy = Math.min(Math.max(v, s.y + s.r), s.y + s.h - s.r);
  return (u - cx) ** 2 + (v - cy) ** 2 <= s.r ** 2;
}

const px = Buffer.alloc(SIZE * SIZE * 4);
const SS = 4; // supersampling for smooth edges
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const u = ((x + (sx + 0.5) / SS) / SIZE) * 64, v = ((y + (sy + 0.5) / SS) / SIZE) * 64;
      let c = null;
      for (const s of shapes) if (inside(u, v, s)) c = s.c;
      if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
    }
    const n = SS * SS, i = (y * SIZE + x) * 4;
    if (a) { px[i] = r / a; px[i + 1] = g / a; px[i + 2] = b / a; }
    px[i + 3] = Math.round((a / n) * 255);
  }
}

const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) px.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]);
const out = path.join(__dirname, '..', 'build', 'icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log('wrote', out);
