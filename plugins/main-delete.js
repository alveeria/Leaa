import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, command }) => {
    if (!m.quoted) throw 'Reply pesan yang ingin dihapus';
    try {
        let res = m.message.extendedTextMessage.contextInfo;
        let deleteMsg = { delete: { remoteJid: m.chat, fromMe: false } };
        if (res.participant) {
            deleteMsg.delete.id = res.stanzaId;
            deleteMsg.delete.participant = res.participant;
        } else {
            deleteMsg.delete.id = res.stanzaId;
        }
        return conn.sendMessage(m.chat, deleteMsg);
    } catch {
        return conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
    }
};
handler.help = ['del', 'delete'];
handler.tags = ['tools'];
handler.botaadmin = true;
handler.command = ['del', 'delete', 'unsend'];

module.exports = handler;

export default module.exports;
