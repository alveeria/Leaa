import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = m => m

handler.before = async (m, { conn, isBotAdmin, isAdmin }) => {
    if(!m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (chat.antitagsw) {
    const isTaggingInStatus = (
        m.mtype === 'groupStatusMentionMessage' || 
        (m.quoted && m.quoted.mtype === 'groupStatusMentionMessage') ||
        (m.message && m.message.groupStatusMentionMessage) ||
        (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)
    )
    
    if (!isTaggingInStatus) return
    
    await conn.sendMessage(m.chat, { delete: m.key })
   
    if (isAdmin) { // nambahin jika admin maka ha di kick cuma hapus pesan aja
        let warningMessage = `Grup ini terdeteksi ditandai dalam Status WhatsApp\n\n` +
                            `@${m.sender.split("@")[0]}, mohon untuk tidak menandai grup dalam status WhatsApp` +
                            `\n\nHal tersebut tidak diperbolehkan dalam grup ini.`
        
        return conn.sendMessage(m.chat, { text: warningMessage, mentions: [m.sender] })
    }
    
    if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
        await conn.sendMessage(m.chat, { text: `@${m.sender.split("@")[0]} telah dikeluarkan dari grup karena menandai grup dalam status WhatsApp.`, mentions: [m.sender] })
    } else {
        let warningMessage = `Grup ini terdeteksi ditandai dalam Status WhatsApp\n\n` +
                            `@${m.sender.split("@")[0]}, mohon untuk tidak menandai grup dalam status WhatsApp` +
                            `\n\nHal tersebut tidak diperbolehkan dalam grup ini.`
        
        return conn.sendMessage(m.chat, { text: warningMessage, mentions: [m.sender] })
      }
   }
}

module.exports = handler
export default module.exports;
