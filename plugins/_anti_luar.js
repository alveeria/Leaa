import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = m => m

handler.before = async function (m) {
   if (m.sender.startsWith('212' || '212')) {
   	global.db.data.users[m.sender].banned = true
conn.reply('see u next time')
conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
   }
   
   if (m.sender.startsWith('265' || '265')) {
   	global.db.data.users[m.sender].banned = true
conn.reply('see u next time')
conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
   }
   if (m.sender.startsWith('92' || '92')) {
   	global.db.data.users[m.sender].banned = true
conn.reply('see u next time')
conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
   }
    }

module.exports = handler
export default module.exports;
