import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let war = global.maxwarn
let handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {      
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
        else who = m.chat
        if (!who) throw `✳️ Memberi label atau menyebut seseorang\n\n📌 Contoh : ${usedPrefix + command} @user`
        if (!(who in global.db.data.users)) throw `✳️ Pengguna hilang dari database saya`
        let name = conn.getName(m.sender)
        let warn = global.db.data.users[who].warn
        if (warn < war) {
            global.db.data.users[who].warn += 1
            m.reply(`
⚠️ *Pengguna yang Diperingatkan* ⚠️

▢ *Admin:* ${name}
▢ *Pengguna:* @${who.split`@`[0]}
▢ *Memperingatkan:* ${warn + 1}/${war}
▢ *Alasan:* ${text}`, null, { mentions: [who] }) 
            m.reply(`
⚠️ *PERINGATAN* ⚠️
Anda menerima peringatan dari admin

▢ *Memperingatkan:* ${warn + 1}/${war} 
Jika Anda menerima *${war}* Peringatan bahwa Anda akan dihapus secara otomatis dari grup`, who)
        } else if (warn == war) {
            global.db.data.users[who].warn = 0
            m.reply(`⛔ Pengguna melebihi peringatan *${war}* karena itu akan dihapus`)
            await time(3000)
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
            m.reply(`♻️ Anda tersingkir dari grup *${groupMetadata.subject}* karena Anda telah diperingatkan *${war}* kali`, who)
        }
}
handler.help = ['warn @user']
handler.tags = ['group']
handler.command = ['warn'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler

const time = async (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
export default module.exports;
