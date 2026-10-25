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
    if (!text) throw `*Example:* ${usedPrefix + command} https://drive.google.com/file/d/1thDYWcS5p5FFhzTpTev7RUv0VFnNQyZ4/view?usp=drivesdk`;
    m.reply(wait);
    try {     
        let json = await fetch(`https://api.tioo.eu.org/download/gdrive?url=${encodeURIComponent(text)}`)
            .then(res => res.json());

        if (json.status) {
            conn.sendMessage(m.chat, { document: { url: json.result.data }, fileName: json.result.fileName, mimetype: json.result.mimetype }, { quoted: m });
        } else {
            throw 'Link tidak valid atau terjadi kesalahan pada sistem!';
        }
    } catch (e) {     
        throw `Error: Terjadi kesalahan saat memproses permintaan.`;
    }
};

handler.help = ['gdrivedl <url>']
handler.command = /^(gdrive|gdrivedl)$/i;;
handler.tags = ['downloader'];
handler.limit = false;
handler.group = true;
module.exports = handler;
export default module.exports;
