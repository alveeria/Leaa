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

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/^image/.test(mime) && !/webp/.test(mime)) {
      const img = await q.download();
      const out = await uploadImage(img);
      const api = await fetch(`https://api.betabotz.eu.org/api/tools/img2prompt?url=${out}&apikey=${lann}`);
      const res = await api.json();
      await conn.sendMessage(m.chat, {
    text: res.result,
    contextInfo: {
        externalAdReply: {
            title: 'Img2Prompt',
            body: '',
            thumbnailUrl: 'https://telegra.ph/file/dbb8cc0a157e3aa856877.jpg',
            sourceUrl: "https://api.betabotz.eu.org",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
}, {
    quoted: m
})
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`);
    }
  } catch (e) {
    console.error(e);
    m.reply(`Identifikasi gagal. Silakan coba lagi.`);
  }
}

handler.help = ['img2prompt'];
handler.tags = ['tools'];
handler.command = ['img2prompt'];
handler.premium = false;
handler.limit = false;
handler.group = true;

module.exports = handler;


export default module.exports;
