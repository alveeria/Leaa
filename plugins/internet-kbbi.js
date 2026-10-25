import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const { cari } = require('kbbi.js');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Harap masukkan kata yang ingin Anda cari.\n\n*Contoh Penggunaan:*\n${usedPrefix + command} cinta`;

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const result = await cari(text);

    if (!result || !result.lema) {
        throw new Error('Entri tidak ditemukan');
    }

    let replyText = `📖 *Hasil Pencarian untuk Kata: "${text}"*\n\n`;
    replyText += `*Lema:* ${result.lema}\n\n`;
    replyText += `*Arti:*\n`;

    result.arti.forEach((meaning, index) => {
      replyText += `${index + 1}. ${meaning}\n`;
    });

    await m.reply(replyText.trim());

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('KBBI Plugin Error:', error);

    if (error.message && error.message.toLowerCase().includes('tidak ditemukan')) {
        m.reply(`Maaf, kata *"${text}"* tidak ditemukan dalam KBBI.`);
    } else {
        m.reply('Terjadi kesalahan saat mencari kata di KBBI.');
    }
  }
};

handler.help = ['kbbi <kata>'];
handler.tags = ['internet', 'search'];
handler.command = /^(kbbi)$/i;

module.exports = handler;
export default module.exports;
