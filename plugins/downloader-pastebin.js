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
    if (!text) throw `Masukkan URL Pastebin!\n\n*Contoh:* ${usedPrefix + command} https://pastebin.com/eQLV4GfE`;

    try {
        await m.reply(wait);
        let res = await fetch(`https://api.betabotz.eu.org/api/download/pastebin?url=${text}&apikey=${lann}`);
        let json = await res.json();

        if (!json.status) throw "❌ Gagal mengambil data dari Pastebin!";

        await m.reply(`📄 *Hasil Pastebin:*\n\n${json.result}`);
    } catch (e) {
        console.error(e);
        throw "❌ Terjadi kesalahan saat mengambil data dari Pastebin!";
    }
};

handler.command = ['pastebindl', 'pastebin'];
handler.tags = ['downloader'];
handler.help = ['pastebindl', 'pastebin'].map(a => a + ' <url>');
handler.limit = true;

module.exports = handler;
export default module.exports;
