import { getActiveMembers, searchMember, formatMemberInfo, formatBirthDate } from '../lib/jkt48/members.js';

let handler = async function(m, { conn, text, usedPrefix, command }) {
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        if (!text) {
            const members = await getActiveMembers();
            if (!members || !members.length) {
                return conn.reply(m.chat, '❌ Gagal mengambil daftar member aktif JKT48.', m);
            }

            const groupedByTeam = {};
            for (const mem of members) {
                const team = mem.team || 'OTHER';
                if (!groupedByTeam[team]) groupedByTeam[team] = [];
                groupedByTeam[team].push(mem.nickname || mem.name);
            }

            let msg = `🌸 *DAFTAR MEMBER JKT48 AKTIF* (Total: ${members.length})\n\n`;
            for (const team of Object.keys(groupedByTeam).sort()) {
                msg += `🏷️ *TEAM ${team}*\n`;
                msg += `> ${groupedByTeam[team].sort().join(', ')}\n\n`;
            }
            msg += `💡 _Ketik \`${usedPrefix + command} <nama panggilan/member>\` untuk melihat profil lengkap._`;
            return conn.reply(m.chat, msg.trim(), m);
        }

        const query = text.trim();
        const member = await searchMember(query);

        if (!member) {
            return conn.reply(m.chat, `❌ Member dengan nama "${query}" tidak ditemukan. Coba ketik \`${usedPrefix + command}\` untuk melihat daftar nama.`, m);
        }

        const caption = formatMemberInfo(member);
        const photo = member.photo || member.photo_1 || member.photo_2;

        if (photo) {
            await conn.sendMessage(m.chat, {
                image: { url: photo },
                caption: caption
            }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }
    } catch (e) {
        console.error('Member Info Error:', e);
        await conn.reply(m.chat, `❌ Terjadi kesalahan: ${e.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48member <nama>', 'memberinfo <nama>'];
handler.tags = ['jkt48'];
handler.command = /^(memberinfo|jkt48member|infomember)$/i;
handler.limit = true;

export default handler;
