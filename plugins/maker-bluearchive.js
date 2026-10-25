import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            throw `Membuat logo Blue Archive.\n\n*Contoh Penggunaan:*\n${usedPrefix + command} Sensei|Schale`;
        }

        const parts = text.split('|');
        if (parts.length !== 2) {
            throw `Format salah. Gunakan pemisah '|' untuk memisahkan dua teks.\n\n*Contoh:*\n${usedPrefix + command} Aris|Tendou`;
        }

        const textL = parts[0].trim();
        const textR = parts[1].trim();

        if (!textL || !textR) {
            throw `Kedua teks tidak boleh kosong.\n\n*Contoh:*\n${usedPrefix + command} Lea|Lenathea`;
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key,
            }
        });

        const apiUrl = `https://api.nekorinn.my.id/maker/ba-logo?textL=${encodeURIComponent(textL)}&textR=${encodeURIComponent(textR)}`;
        
        await conn.sendFile(m.chat, apiUrl, 'bluearchive-logo.png', `Logo Blue Archive: *${textL}* | *${textR}*\n\n> © Leaa`, m);

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key,
            }
        });

    } catch (e) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key,
            }
        });
        
        console.error(e);
        const errorMessage = typeof e === 'string' ? e : 'Gagal membuat logo, coba lagi nanti.';
        m.reply(errorMessage);
    }
};

handler.help = ['bluearchivelogo <teks1>|<teks2>'];
handler.tags = ['maker'];
handler.command = /^(balogo|bluearchivelogo)$/i;
handler.limit = false;

module.exports = handler;
export default module.exports;
