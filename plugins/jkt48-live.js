import { fetchNowLive } from '../lib/jkt48/live.js';

let handler = async (m, { conn, command, isOwner }) => {
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        const liveData = await fetchNowLive();
        const lives = [...(liveData.idn || []), ...(liveData.showroom || [])];

        if (!lives.length) {
            return conn.reply(m.chat, '📡 Saat ini belum ada member JKT48 yang sedang live di IDN App maupun Showroom.', m);
        }

        let msg = `🔴 *MEMBER JKT48 SEDANG LIVE!* (${lives.length})\n\n`;
        for (const item of lives) {
            const platform = item.platform || (item.room_url_key ? 'SHOWROOM' : 'IDN Live');
            const name = item.name || item.creator?.name || item.room_name || 'Member JKT48';
            const url = item.url || (item.slug ? `https://www.idn.app/${item.creator?.username || 'jkt48'}/live/${item.slug}` : `https://www.showroom-live.com/r/${item.room_url_key}`);
            msg += `✨ *${name}*\n`;
            msg += `📱 Platform: *${platform}*\n`;
            if (item.title) msg += `📌 Judul: ${item.title}\n`;
            msg += `🔗 Tonton: ${url}\n\n`;
        }

        await conn.reply(m.chat, msg.trim(), m);
    } catch (e) {
        console.error('JKT48 Live Error:', e);
        await conn.reply(m.chat, `❌ Gagal memeriksa status live: ${e.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48live', 'ceklive', 'livenow'];
handler.tags = ['jkt48'];
handler.command = /^(live|jkt48live|ceklive|livenow)$/i;

export default handler;
