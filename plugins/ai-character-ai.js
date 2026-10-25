import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
 const fetch = require('node-fetch')

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw(`Input Text Dan Karakter!\nExample: ${usedPrefix + command} hai Kirito|Kirito`)    
  try {
    let [ prompt, logic ] = text.split('|')
    m.reply(`Tunggu sebentar...`)
    let res = await fetch(`https://api.betabotz.eu.org/api/search/c-ai?prompt=${prompt}?&char=${logic}&apikey=${lann}`)
    let json = await res.json()
    m.reply(json.message)
  } catch (error) {
    console.error(error)
    m.reply('Terjadi kesalahan saat menjalankan perintah.')
  }
}

handler.command = handler.help = ['c-ai','character-ai']
handler.tags = ['ai']
handler.owner = false
handler.limit = false
handler.group = false
handler.private = false

module.exports = handler

export default module.exports;
