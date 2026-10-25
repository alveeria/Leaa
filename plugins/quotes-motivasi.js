import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch')
let handler = async (m, { conn }) => {
try {
  let res = await fetch(`https://api.betabotz.eu.org/api/random/motivasi?&apikey=${lann}`);
  let json = await res.json()
  conn.reply(m.chat, `―MOTIVASI―\n\n"${json.result}"`,);
} catch (e) {
throw `Internal server eror!`
  }
}
handler.help = ['motivasi']
handler.tags = ['quotes']
handler.command = /^(motivasi)$/i

module.exports = handler

export default module.exports;
