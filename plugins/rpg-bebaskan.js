import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text }) => {
    if (!text) throw '• *Contoh :* .bebaskan 62×××'
    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) throw 'Tag orang yang ingin dibebaskan dari penjara'
    
    let users = global.db.data.users
    
    // Mengecek apakah pengguna adalah polisi, admin, atau owner
    if (users[m.sender].job !== 'polisi' && !m.isAdmin && !m.isOwner) 
        throw 'Anda harus menjadi polisi, admin, atau owner untuk melakukan tindakan ini.'
    
    users[who].jail = false
    conn.sendMessage(m.chat, { react: { text: '☑️', key: m.key }})
}
handler.help = ['bebaskan']
handler.tags = ['rpg']
handler.command = /^bebaskan$/i
handler.owner = false
handler.admin = false
handler.group = true
handler.rpg = true

module.exports = handler
export default module.exports;
