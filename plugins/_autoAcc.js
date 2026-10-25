import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
module.exports = {
    before: async function (m, {conn, groupMetadata}) {
    if (!m.isGroup) return
    let chat = db.data.chats[m.chat]
    if (chat.autoacc) return
        let mode = await conn.groupMetadata(m.chat)
        if (mode.joinApprovalMode) {
            conn.groupRequestParticipantsList(m.chat).then(async (data) => {
                if (data.length === 0) {
                    false
                } else {
                    for (let i of data) {
                        await conn.groupRequestParticipantsUpdate(m.chat, [i.jid], 'approve')
                        await conn.delay(20000)
                    }
                }
            })
        }
    }
}

export default module.exports;
