import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    conn.tebaktempat = conn.tebaktempat ? conn.tebaktempat : {}
    let id = m.chat
    if (!(id in conn.tebaktempat)) throw false
    let json = conn.tebaktempat[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz123456789]/gi, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^tpc/i
handler.limit = true
module.exports = handler

export default module.exports;
