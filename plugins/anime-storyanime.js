import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch');
let handler = async (m, { conn }) => {
  try {
    conn.reply(m.chat, wait, m)
    let res = await fetch(`https://api.betabotz.eu.org/api/download/storyanime?apikey=${lann}`);
    let json = await res.json();
      conn.sendFile(m.chat, json.result.url, 'anime_story.mp4', "*STORY ANIME*", m);
  } catch (e) {
    throw `*Error:* ${eror}`;
  }
};

handler.help = ['storyanime'];
handler.tags = ['downloader'];
handler.command = /^(storyanime)$/i;
handler.limir = true 
module.exports = handler;

export default module.exports;
