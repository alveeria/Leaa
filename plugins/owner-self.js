import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async(m, { conn, command }) => {
  let isPublic = command === "public";
  let self = global.opts["self"]

  if(self === !isPublic) return m.reply(`Dah ${!isPublic ? "Self" : "Public"} dari tadi ${m.sender.split("@")[0] === global.owner[1] ? "Mbak" : "Bang"} :v`)

  global.opts["self"] = !isPublic

  m.reply(`Berhasil ${!isPublic ? "Self" : "Public"} bot!`)
}

handler.help = ["self", "public"]
handler.tags = ["owner"]

handler.owner = true

handler.command = /^(self|public)/i

module.exports = handler

export default module.exports;
