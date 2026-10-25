import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukkan URL yang ingin diperiksa!\n\n*Contoh:* ${usedPrefix + command} https://tinyurl.com/bdtf7se9`;

  try {
    await m.reply(wait);
    let res = await (await fetch(`https://api.betabotz.eu.org/api/tools/cekredirect?url=${text}&apikey=${lann}`)).json();

    if (!res.status || !res.result) throw 'Gagal mendapatkan data!';

    let message = res.result.map((item, index) => 
      `🔗 *URL*: ${item.url}\n🚦 *Status*: ${item.status || 'Tidak ada status'}`
    ).join('\n\n');

    await m.reply(message);
  } catch (e) {
    console.error(e);
    throw 'Terjadi kesalahan saat memproses permintaan!';
  }
};

handler.command = handler.help = ['checkredirect', 'cekredirect'];
handler.tags = ['tools'];
handler.limit = true;

module.exports = handler;
export default module.exports;
