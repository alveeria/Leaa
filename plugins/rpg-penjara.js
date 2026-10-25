import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
 const JAIL_TIME = 60 * 60 * 1000
 let who = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0] : args[0] ? ((args.join('').replace(/[@ .+-]/g, '')).replace(/^\+/, '').replace(/-/g, '') + '@s.whatsapp.net') : '';
 const user = global.db.data.users[who]
 const usar = global.db.data.users[m.sender]
 if (usar.job == 'polisi') {
    if (!text) throw '*Siapa yang mau di penjara?*'
    if (!who) return m.reply('*Tag target atau ketik nomornya*')
    if (!user) return m.reply(`*Pengguna ${who} tidak ada dalam database*`)
    
    user.jail = true
    user.perkerjaandua = Date.now() + JAIL_TIME
    
    setTimeout(() => {
    conn.reply(who, `*Kamu telah di penjara oleh ${usar.name}*`, fverif)
    }, 5000)
    conn.reply(m.chat, `Berhasil penjara *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}*\n🧤 +1 Tingkat Kerja Keras\n\n_Jika polisi diketahui memenjarai seseorang tanpa alasan tertentu, maka akan langsung diban oleh pihak atasan._`, m, { mentions: [who] })
    return
   }
   await conn.reply(m.chat, '*Fitur ini hanya dikhususkan untuk orang yang bekerja sebagai polisi*', m)
}

handler.help = ['penjara']
handler.tags = ['rpg']
handler.command = /^penjara$/i
handler.group = true
handler.register = true
handler.rpg = true

module.exports = handler
export default module.exports;
