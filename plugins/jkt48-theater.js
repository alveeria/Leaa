import { getTodaySchedules, getUpcomingSchedules, formatScheduleDate } from '../lib/jkt48/schedule.js';
import { getShowDetail, formatShowDetail } from '../lib/jkt48/show.js';

let handler = async function (m, { conn, usedPrefix, command }) {
    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        const todayShows = await getTodaySchedules();
        
        if (todayShows && todayShows.length > 0) {
            let msg = `🎭 *JADWAL TEATER HARI INI*\n\n`;
            for (const item of todayShows) {
                msg += `🏷️ *${item.title || item.show || 'Show JKT48'}*\n`;
                msg += `📅 ${formatScheduleDate(item.date || item.showDate)}\n`;
                if (item.members?.length) {
                    msg += `👥 Member: ${item.members.map(x => x.name || x).join(', ')}\n`;
                }
                if (item.url) msg += `🔗 ${item.url}\n`;
                msg += `\n`;
            }
            return conn.reply(m.chat, msg.trim(), m);
        }

        const upcoming = await getUpcomingSchedules(5);
        if (!upcoming || !upcoming.length) {
            return conn.reply(m.chat, '❌ Tidak ada jadwal teater hari ini maupun mendatang.', m);
        }

        let msg = `ℹ️ *Tidak ada show teater hari ini.*\n\n🎭 *JADWAL TEATER MENDATANG:*\n\n`;
        for (const item of upcoming) {
            msg += `• *${item.title || item.show || 'Show JKT48'}*\n`;
            msg += `  🗓️ ${formatScheduleDate(item.date || item.showDate)}\n`;
            if (item.url) msg += `  🔗 ${item.url}\n`;
            msg += `\n`;
        }

        await conn.reply(m.chat, msg.trim(), m);
    } catch (e) {
        console.error('Theater Schedule Error:', e);
        await conn.reply(m.chat, `❌ Terjadi kesalahan: ${e.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['theaterschedule', 'jadwalteater', 'theater'];
handler.tags = ['jkt48'];
handler.command = /^(theaterschedule|jadwalteater|theater|jkt48theater)$/i;

export default handler;
