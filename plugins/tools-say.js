import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Harap masukkan text!\n\ncontoh:\n${usedPrefix + command} Haruno`
    conn.reply(m.chat, text, null)
}
handler.help = ['say <teks>']
handler.tags = ['tools']
handler.command = /^(say)$/i

module.exports = handler
export default module.exports;
