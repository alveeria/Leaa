import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
var fetch = require("node-fetch")
var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
if (!text) throw 'Masukkan Query Link!'
 try {
let anu = await fetch(`https://api.betabotz.eu.org/api/download/xvideosdl?url=${text}&apikey=${lann}`)
let hasil = await anu.json() 

conn.sendMessage(m.chat, { video: { url: hasil.result.url }, fileName: 'xnxx.mp4', mimetype: 'video/mp4' }, { quoted: m })
} catch (e) {
throw `*Server Error!*`
}
  }                            
handler.help = ['xvideosdl']
handler.command = ['xvideosdown','xdown','xvideosdl','xviddl'];
handler.tags = ['downloader'];
handler.premium = true;
module.exports = handler;
export default module.exports;
