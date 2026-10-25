import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    conn.tbkata = conn.tbkata ? conn.tbkata : {}
    let id = m.chat
    if (!(id in conn.tbkata)) throw false
    let json = conn.tbkata[id][1]
    let ans = json.jawaban
    // kalau ini error clue nya ak mau ada tanda (_) nya ganti string dalam function di bawah ini jadi huruf kecil
    let clue = ans.replace(/[BCDFGHJKLMNPQRSTFWXYZ]/g, '_')
    m.reply('```' + clue + '```')
}
handler.command = /^tkaa/i
handler.limit = true
module.exports = handler

//gh: dana_putra13
export default module.exports;
