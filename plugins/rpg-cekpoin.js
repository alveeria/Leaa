import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m) => {
  let poin = global.db.data.users[m.sender].poin || 0
  m.reply(`Poin kamu: ${poin}`)
}

handler.help = ['cekpoin']
handler.tags = ['rpg']
handler.command = /^cekpoin$/i
handler.group = true
handler.register = true
handler.rpg = true

module.exports = handler
export default module.exports;
