import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
  conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  });
	conn.sendImageAsSticker(m.chat, `https://api.betabotz.org/api/sticker/animegif?apikey=${global.lann}`, m, { packname: "sticker by", author: "Kemii" })
}
handler.help = ['animegif']
handler.tags = ['anime']

handler.command = /^(animegif)$/i
handler.premium = false
handler.register = true
handler.limit = 5
module.exports = handler
export default module.exports;
