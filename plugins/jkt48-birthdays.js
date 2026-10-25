import { getActiveMembers, formatBirthDate } from '../lib/jkt48/members.js';

const processBirthdayData = (members) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return members
        .filter(m => m.birth_date || (m.birth_day && m.birth_month))
        .map(member => {
            let birthMonth, birthDay;
            if (member.birth_month && member.birth_day) {
                birthMonth = member.birth_month - 1;
                birthDay = member.birth_day;
            } else {
                const parts = String(member.birth_date).split('-');
                birthMonth = parseInt(parts[1], 10) - 1;
                birthDay = parseInt(parts[2], 10);
            }

            let nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
            if (nextBirthday < today) {
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }
            const diffTime = nextBirthday.getTime() - today.getTime();
            const remaining_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const formatted_birthday = formatBirthDate(member.birth_date) || `${birthDay}/${birthMonth + 1}`;

            return {
                name: member.name,
                nickname: member.nickname,
                team: member.team,
                photo: member.photo || member.photo_1,
                remaining_days,
                formatted_birthday
            };
        })
        .sort((a, b) => a.remaining_days - b.remaining_days);
};

let handler = async function(m, { conn }) {
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        const members = await getActiveMembers();
        if (!members || !members.length) {
            return conn.reply(m.chat, '❌ Data member belum tersedia saat ini.', m);
        }

        const upcoming = processBirthdayData(members).slice(0, 10);
        let message = '🎂 *DAFTAR ULANG TAHUN MEMBER BERIKUTNYA*\n\n';

        for (const mem of upcoming) {
            const countdown = mem.remaining_days === 0 ? '🎉 *(Hari Ini!)*' : `(${mem.remaining_days} hari lagi)`;
            message += `• *${mem.name}* (${mem.nickname || mem.team}): ${mem.formatted_birthday} ${countdown}\n`;
        }

        await conn.reply(m.chat, message.trim(), m);
    } catch (e) {
        console.error('JKT48 Birthday Error:', e);
        await conn.reply(m.chat, `❌ Gagal memuat ulang tahun member: ${e.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48birthdays', 'ultahjkt48'];
handler.tags = ['jkt48'];
handler.command = /^(jkt48birthdays|ultahjkt48|jkt48ultah)$/i;
handler.limit = true;

export default handler;
