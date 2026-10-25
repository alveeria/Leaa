import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args.length) {
        return m.reply(`Mana nama grub nya? Contoh: *${usedPrefix + command}* grub himpunan ngawi`);
    }

    try {
        await conn.groupUpdateSubject(m.chat, args.join(" "));
        m.reply('Sukses mengubah nama grup!');
    } catch (err) {
        m.reply('Gagal mengubah nama grup. Pastikan bot memiliki izin Admin.');
        console.error(err);
    }
};

handler.help = ['setnamagc'];
handler.tags = ['group'];
handler.command = /^setnamagc$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = true; 
handler.private = false;
handler.register = false;
handler.admin = true; 
handler.botAdmin = true; 

module.exports = handler;

export default module.exports;
