import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');
const uploadImage = require('../legacy-lib/uploadImage.js');

exports.before = async function(m, { isAdmin, isBotAdmin }) {
  if (global.db.data.users[m.sender].limit > 0) {
    if (m.isBaileys && m.fromMe) return;
    let chat = global.db.data.chats[m.chat]
    let isFoto = m.mtype
    if (chat.autohd && isFoto ) {
      if (!isBotAdmin) {
      } else {
        if (global.db.data.users[m.sender].limit > 0) 
        global.db.data.users[m.sender].limit -= 1
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';
        if (/^image/.test(mime) && !/webp/.test(mime)) {
          const img = await q.download();
          const out = await uploadImage(img);
          const api = await fetch(`https://api.betabotz.eu.org/api/tools/remini?url=${out}&apikey=${lann}`);
          const image = await api.json();
          const { url } = image 
           conn.sendFile(m.chat, url, null, wm, m);
           
        }
      }
    }
    
    return true
  }
  }
export default module.exports;
