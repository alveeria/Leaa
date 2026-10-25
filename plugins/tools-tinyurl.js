import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch')
let handler = async (m, { text }) => {
  if (!text) throw 'Masukan url/link nya mana?\n> .tinyurl https://google.com'
  let res = await fetch(`https://api.betabotz.eu.org/api/tools/tinyurl?link=${text}&apikey=${lann}`)
  let json = await res.json()
  if (json.status) m.reply(json.result)
  else throw 'Link Invalid!\nPeriksa url anda'
}
handler.help = ['tinyurl'].map(v => v + ' <link>')
handler.tags = ['shortlink']
handler.command = /^tinyurl$/i

module.exports = handler

export default module.exports;
