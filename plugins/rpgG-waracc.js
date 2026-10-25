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
    
    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (!args[0]) return conn.reply(m.chat, 'Masukkan guild lawan yang ingin diwar.', m);

    let enemyGuildName = args.join(' ');
    let enemyGuild = Object.values(global.db.data.guilds).find(guild => guild.name === enemyGuildName);
    if (!enemyGuild) return conn.reply(m.chat, 'Guild lawan tidak ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild yang bisa memulai perang.', m);

    // Logika perang dapat ditambahkan di sini

    conn.reply(m.chat, `Pertempuran dengan guild ${enemyGuild.name} dalam pengembangan.`, m);
};

handler.help = ['guildwaracc <nama_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(guildwaracc)$/i;
handler.group = true;
handler.rpg = true;
module.exports = handler;
export default module.exports;
