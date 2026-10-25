import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
var axios = require('axios');
var handler = async (m, { conn }) => {
  try {
    var response = await axios.get(`https://api.betabotz.eu.org/api/search/gempa?apikey=${lann}`);
    var dataGempa = response.data.result.result;
    var caption = `Waktu : ${dataGempa.waktu}\nLintang : ${dataGempa.Lintang}\nBujur : ${dataGempa.Bujur}\nMagnitude : ${dataGempa.Magnitudo}\nKedalaman : ${dataGempa.Kedalaman}\nWilayah : ${dataGempa.Wilayah}`;
    conn.sendFile(m.chat, dataGempa.image, 'map.png', caption, m);
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data gempa', m);
  }
};
handler.command = handler.help = ['infogempa', 'gempa'];
handler.tags = ['info'];
handler.premium = false;
handler.limit = true;
module.exports = handler;

export default module.exports;
