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
if (!text) throw `Masukan Username Di Website Api!`
  try {
    let api = await fetch(`https://api.betabotz.eu.org/api/checkexp?username=${text}`)
    let body = await api.text()
    m.reply(body)  
  } catch (e) {
    console.log(e) 
    m.reply('Username tidak terdaftar!')
  }
}          
handler.command = handler.help = ['checkexp','cekexp', 'expapi'];
handler.tags = ['main'];
handler.private = true
module.exports = handler;

export default module.exports;
