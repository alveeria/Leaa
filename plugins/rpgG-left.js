import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    guild.members = guild.members.filter(member => member !== userId);
    user.guild = null;

    conn.reply(m.chat, 'Kamu telah keluar dari guild.', m);
};

handler.help = ['guildleave'];
handler.tags = ['rpgG'];
handler.command = /^(guildleave)$/i;
handler.group = true;
handler.rpg = true;
module.exports = handler;
export default module.exports;
