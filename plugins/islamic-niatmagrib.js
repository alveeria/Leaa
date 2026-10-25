import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    try {
        const niatMaghrib = {
            name: "Niat Shalat Maghrib",
            arabic: "اُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
            latin: "Ushalli fardhol maghribi tsalaata raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
            terjemahan: "Aku berniat shalat fardhu Maghrib tiga raka'at menghadap kiblat karena Allah Ta'ala."
        };

        let responseText = `*━━━ • Niat Shalat Maghrib • ━━━*\n\n`;
        responseText += `*Nama Niat:*\n${niatMaghrib.name}\n\n`;
        responseText += `*Arab:*\n${niatMaghrib.arabic}\n\n`;
        responseText += `*Latin:*\n${niatMaghrib.latin}\n\n`;
        responseText += `*Terjemahan:*\n${niatMaghrib.terjemahan}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['niatmaghrib'];
handler.tags = ['islamic'];
handler.command = /^(niatmaghrib)$/i;
handler.group = true;

module.exports = handler;
export default module.exports;
