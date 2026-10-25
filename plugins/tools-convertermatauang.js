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
  if (!text) throw `*Contoh:* ${usedPrefix + command} cny|to|idr|10000`;

  let parts = text.split('|').map(v => v.trim().toLowerCase());
  if (parts.length !== 4 || parts[1] !== 'to') {
    throw `*Format salah!*\nGunakan: ${usedPrefix + command} cny|to|idr|10000`;
  }

  let from = parts[0];
  let to = parts[2];
  let jumlah = parts[3];

  m.reply(wait);
  try {
    let res = await fetch(`https://api.betabotz.eu.org/api/tools/cvuang?from=${from.toUpperCase()}&to=${to.toUpperCase()}&jumlah=${jumlah}&apikey=${btc}`);
    let json = await res.json();

    if (!json.status || json.result.status !== 'SUCCESS') throw 'Gagal melakukan konversi.';

    let r = json.result.data;
    let msg = `*KONVERSI MATA UANG*\n\n`;
    msg += `  ◦ *Dari:* ${r.originalValues.fromCurrencyName} (${r.originalValues.fromCurrency})\n`;
    msg += `  ◦ *Ke:* ${r.originalValues.toCurrencyName} (${r.originalValues.toCurrency})\n`;
    msg += `  ◦ *Jumlah:* ${r.originalValues.fromAmount}\n\n`;
    msg += `*Hasil Konversi:*\n`;
    msg += `  ◦ *Tanpa Biaya Tambahan:* ${r.originalValues.toAmountWithVisaRate}\n`;
    msg += `  ◦ *Dengan Biaya Tambahan:* ${r.originalValues.toAmountWithAdditionalFee}\n`;
    msg += `  ◦ *Rate (Visa):* ${r.originalValues.fxRateVisa}\n`;
    msg += `  ◦ *Rate + Fee:* ${r.originalValues.fxRateWithAdditionalFee}\n\n`;
    msg += `*Reverse Rate:* ${r.reverseAmount} ${r.originalValues.fromCurrency}`;

    m.reply(msg);
  } catch (e) {
    console.log(e);
    throw 'Terjadi kesalahan saat mengonversi.';
  }
};

handler.command = handler.help = ['matauang', 'convertuang', 'konversiuang'];
handler.tags = ['tools'];
handler.limit = true;

module.exports = handler;
export default module.exports;
