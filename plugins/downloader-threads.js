import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    throw `Masukkan URL!\n\ncontoh:\n${usedPrefix + command} https://www.threads.net/@diiemofc/post/Cujx6ryoYx6?igshid=NTc4MTIwNjQ2YQ%3D%3D`;
  }
  if (!args[0].match(/threads/gi)) {
    throw `URL Tidak Ditemukan!`;
  }
  m.reply(wait);
  try {
    const api = await fetch(`https://api.betabotz.eu.org/api/download/threads?url=${args[0]}&apikey=${lann}`).then(results => results.json());
    const foto = api.result.image_urls[0] || null;
    const video = api.result.video_urls[0] || null;   
    if (video) {
      try { 
        conn.sendFile(m.chat, video.download_url, 'threads.mp4', '*THREADS DOWNLOADER*', m);
      } catch (e) {
        throw `Media video tidak ditemukan!`;
      }
    } else if (foto) {
      try {
        conn.sendFile(m.chat, foto, 'threads.jpeg', '*THREADS DOWNLOADER*', m);
      } catch (e) {
        throw `Media foto tidak ditemukan!`;
      }
    } else {
      throw `Konten tidak ditemukan!`;
    }
  } catch (e) {
    console.log(e);
    throw `✖️ *Server down*` 
  }
};
handler.command = /^(threads|threadsdl)$/i;
handler.help = ['threadsdl'].map(v => v + ' <url>')
handler.tags = ['downloader'];
handler.limit = false;
handler.group = false;
handler.premium = false;

module.exports = handler;
export default module.exports;
