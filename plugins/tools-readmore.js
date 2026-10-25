import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text }) => {
  let [ l, r ] = text.split`|`
  if (!l) l = ''
  if (!r) r = ''
  conn.reply(m.chat, l + readMore + r, m)
}
handler.help = ['readmore'].map(v => v + ' <teks>|<teks>')
handler.tags = ['tools']
handler.command = /^(spoiler|hidetext|readmore|selengkapnya)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

export default module.exports;
