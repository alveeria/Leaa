import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const { MessageType } = __baileys.default;

let handler = async (m, { conn, text, usedPrefix }) => {
  function no(number){
    return number.replace(/\s/g, '').replace(/([@+-])/g, '');
  }
  
  if (!text) {
    return conn.reply(m.chat, `*『 G A G A L 』*\n\n${usedPrefix}unprem @tag/nomor|days\n\n*Example:* ${usedPrefix}unprem 6285764068784|99`, m);
  }

  text = no(text) + "@s.whatsapp.net";
  global.db.data.users[text].premium = false;
  global.db.data.users[text].premiumTime = 0;
  
  conn.reply(m.chat, `*Berhasil menghapus akses premium untuk @${text.split('@')[0]}.*`, m, { contextInfo: { mentionedJid: [text] } });
};

handler.help = ['unprem'];
handler.tags = ['owner'];
handler.command = /^(unprem|delprem)$/i;
handler.owner = true;
handler.fail = null;

module.exports = handler;

// hapis skibidi
export default module.exports;
