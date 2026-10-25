import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');
const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukkan Domain/Sub Domain!\n\n*Contoh:* botcahx.eu.org`;

  if (text.includes('https://') || text.includes('http://')) throw `Tolong masukkan domain/sub domain secara lengkap. Contoh: botcahx.eu.org`;

  try {
    // fetch pertama
    const api_key = 'E4/gdcfciJHSQdy4+9+Ryw==JHciNFemGqOVIbyv';
    const res1 = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${text}`, {
      headers: { 'X-Api-Key': api_key },
      contentType: 'application/json'
    })
    .then(response => response.text())
    .catch(error => {
      console.log(error);
      return fetch(`https://api.hackertarget.com/dnslookup/?q=${text}`)
      .then(response => response.text())
      .then(data => {
        m.reply(`*Ini Adalah Hasil Dns Lookup Untuk ${text}:*\n${data}`);
        console.log(data);
      })
      .catch(error => {
        console.error(error);
        m.reply('*Tidak dapat memproses permintaan DNS Lookup*');
      });
    });
    m.reply(`*Ini Adalah Hasil Dns Lookup Untuk ${text}:*\n${res1}`);
    console.log(res1);

  } catch (error) {
    console.log(error);
    m.reply('*Invalid data!*');
  }
};

handler.command = ['dnslookup', 'hackertarget', 'lookup','dns'];
handler.help = ['dnslookup', 'hackertarget', 'lookup','dns'];
handler.tags = ['tools'];
handler.premium = false;

module.exports = handler;

export default module.exports;
