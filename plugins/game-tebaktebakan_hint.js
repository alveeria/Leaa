import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    conn.tebaktebakan = conn.tebaktebakan ? conn.tebaktebakan : {}
    let id = m.chat
    if (!(id in conn.tebaktebakan)) throw false
    let json = conn.tebaktebakan[id][1]
    let ans = json.jawaban
    // kalau ini error clue nya ak mau ada tanda (_) nya ganti string dalam function di bawah ini jadi huruf kecil
    let clue = ans.replace(/[BCDFGHJKLMNPQRSTFWXYZbcdfghjklmnpqrstvwxyz]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^tika/i
handler.limit = true
module.exports = handler

//gh: dana_putra13
export default module.exports;
