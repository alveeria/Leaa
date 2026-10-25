import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
  if (isOwner) {
    conn.sendFile(m.chat, './vn/claraaa.mp3', "lah.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  } else {
    conn.sendFile(m.chat, './vn/claraaaa.mp3', "lah.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  }
}
handler.customPrefix = /^(sayang|ayang|ay)$/i;
handler.command = new RegExp();

module.exports = handler;
export default module.exports;
