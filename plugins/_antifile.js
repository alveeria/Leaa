import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys || !(m.mtype === "documentMessage") || !global.db.data.chats[m.chat]?.antifile) return;
    if (isAdmin || !isBotAdmin) {
        // Jika pengirim adalah admin atau bot bukan admin, tidak melakukan apa-apa
      } else {

    const user = global.db.data.users[m.sender];
    user.banned = false;
    const warningMessage = '⚠️ *File Terdeteksi!* ⚠️\nKamu telah mengirim file. Waspada dalam mendownload file, bisa saja mengandung virus atau phising.';
    await m.reply(warningMessage);

    const deleteMessage = {
        delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
        }
    };
    await this.sendMessage(m.chat, deleteMessage);
      }
}

module.exports = { before };
export default module.exports;
