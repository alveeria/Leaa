import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix, command }) => {
try {
  let res = await fetch(`https://api.betabotz.eu.org/api/muslim/kisahnabi2?&apikey=${lann}`);
  let json = await res.json()
  global.anu = [
       `―-KISAH NABI 2-―\n\n${json.result[0].name}\n\nTahun kelahiran: ${json.result[0].thn_kelahiran}\n\nUsia: ${json.result[0].usia}\n\n\nStory: ${json.result[0].description}`, 
    ]
conn.reply(m.chat,`${(global.anu)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
    handler.help = ['kisahnabi2']
    handler.tags = ['islamic']
    handler.command = /^(kisahnabi2)$/i
    handler.group = true
    
    module.exports = handler
    



//danaputra133


export default module.exports;
