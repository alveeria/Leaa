import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, usedPrefix }) => {

    let user = global.db.data.users[m.sender]
    if (user.job !== 'polisi') throw 'Anda harus menjadi polisi untuk melakukan tindakan ini.'
    
    let penjaraList = Object.entries(global.db.data.users).filter(user => user[1].jail)

    conn.reply(m.chat, `
乂 • *P E N J A R A*\n
- Total : _${penjaraList.length} User_
 ${penjaraList ? '\n' + penjaraList.map(([jid], i) => `
 ${i + 1}. @${jid.split`@`[0]}
`.trim()).join('\n') : ''}
`, m)
}
handler.help = ['listpenjara']
handler.tags = ['rpg']
handler.command = /^penjaralist|listpenjara$/i
handler.group = true
handler.rpg = true
module.exports = handler
export default module.exports;
