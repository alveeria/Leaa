import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
exports.before = async function(m) {
    if (m.isBaileys && m.fromMe) return;
    let chat = db.data.chats[m.chat];
    if (chat.viewonce && m.isGroup && m.mtype === 'viewOnceMessageV2') {
        let val = { ...m };
        let msg = val.message?.viewOnceMessage?.message || val.message?.viewOnceMessageV2?.message;
        delete msg[Object.keys(msg)[0]].viewOnce;
        val.message = msg;
        await this.sendMessage(m.chat, { forward: val }, { quoted: m });
    }
    return;
};

export default module.exports;
