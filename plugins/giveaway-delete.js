import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;

let handler = async (m, { conn, participants, usedPrefix }) => {
    let id = m.chat
    conn.giveway = conn.giveway ? conn.giveway : {}
    if (!(id in conn.giveway)) throw `_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`
    delete conn.giveway[id]
    conn.sendMessage(m.chat, { text: '*GIVEAWAY* telah selesai', mentions: participants.map(a => a.id) })
}
handler.help = ['hapusgiveaway']
handler.tags = ['adminry', 'group']
handler.command = /^(delete|hapus)giveaway$/i
handler.group = true
handler.admin = true
module.exports = handler

export default module.exports;
