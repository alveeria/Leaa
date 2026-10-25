import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    conn.tebakdrakor = conn.tebakdrakor ? conn.tebakdrakor : {}
    let id = m.chat
    if (!(id in conn.tebakdrakor)) throw false
    let json = conn.tebakdrakor[id][1]
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*')
}
handler.command = /^tdkt$/i

handler.limit = true

module.exports = handler
export default module.exports;
