import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    if (!who) throw `tag orangnya!`
    if (!global.owner.includes(who.split`@`[0])) throw 'dia bukan owner !'
    let index = global.owner.indexOf(who.split`@`[0])
    global.owner.splice(index, 1)
    conn.reply(m.chat, `@${who.split`@`[0]} sekarang bukan owner lagi !`, m, {
        contextInfo: {
            mentionedJid: [who]
        }
    })
}
handler.help = ['delowner [@user]']
handler.tags = ['owner']
handler.command = /^(del|hapus|-)owner$/i
handler.owner = true
module.exports = handler

export default module.exports;
