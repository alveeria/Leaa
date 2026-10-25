import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    let target = m.mentionedJid[0] || args[0];

    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (!args[0]) return conn.reply(m.chat, `Tag user yang ingin kamu undang ke guild ${guild.name}.`, m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild yang bisa mengundang.', m);

    if (global.db.data.users[target].guild === guildId) return conn.reply(m.chat, 'User sudah tergabung dalam guild.', m);

    guild.waitingRoom.push(target);
    
    conn.reply(m.chat, `@${target.split('@')[0]} kamu telah diundang ke guild ${guild.name}. Silakan tunggu konfirmasi dari pemilik guild.`, m, { mentions: [target] });
};

handler.help = ['guildinvite <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildinvite)$/i;
handler.group = true;
handler.rpg = true;
module.exports = handler;
export default module.exports;
