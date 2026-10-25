import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');
const uploader = require('../legacy-lib/uploadImage');

let handler = async (m, { conn, command, usedPrefix }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || '' 
  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    let buffer = await q.download()
    await m.reply(wait)    
    try {
      let media = await uploader(buffer)
      let api = await fetch(`https://api.betabotz.eu.org/api/tools/nsfw-detect?url=${media}&apikey=${lann}`)
      let response = await api.json()  
      if (response.status) {
        let { labelName, labelId, confidence } = response.result;
        let capt;
            capt = `乂 *N S F W D E T E C T O R*\n\n`;
            capt += `◦ *Label Name* : ${labelName}\n`;
            capt += `◦ *Label Id* : ${labelId}\n`;
            capt += `◦ *Confidence* : ${confidence}\n`;
            m.reply(capt);
      }
      
    } catch (err) {
      throw `${eror}`
    }
  } else {
    throw `Reply image with command ${usedPrefix + command}`
  }
}

handler.help = ['nsfwdetector']
handler.tags = ['tools']
handler.command = /^(nsfwdetector|nsfwdetecd)$/i
handler.limit = 1
handler.group = true

module.exports = handler
export default module.exports;
