import { getNewsPage, getNewsDetail } from '../lib/jkt48/news.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        if (!text) {
            const newsList = await getNewsPage(1);
            if (!newsList || !newsList.length) {
                return conn.reply(m.chat, '❌ Gagal memuat daftar berita JKT48 saat ini.', m);
            }

            let msg = `📢 *BERITA TERBARU JKT48*\n\n`;
            newsList.slice(0, 10).forEach((item, index) => {
                msg += `*${index + 1}.* ${item.title}\n`;
                msg += `📅 ${item.date || '-'}\n`;
                msg += `🔗 ${item.url || 'https://jkt48.com'}\n\n`;
            });
            msg += `💡 _Ketik \`${usedPrefix + command} <nomor>\` untuk membaca detail berita._`;
            return conn.reply(m.chat, msg.trim(), m);
        }

        const num = parseInt(text.trim());
        if (isNaN(num) || num < 1 || num > 10) {
            return conn.reply(m.chat, `⚠️ Masukkan nomor berita antara 1 sampai 10!\nContoh: \`${usedPrefix + command} 1\``, m);
        }

        const newsList = await getNewsPage(1);
        const selected = newsList[num - 1];
        if (!selected) {
            return conn.reply(m.chat, '❌ Berita tidak ditemukan.', m);
        }

        const detail = await getNewsDetail(selected.id || selected.url);
        let detailMsg = `📰 *${detail?.title || selected.title}*\n`;
        detailMsg += `📅 ${detail?.date || selected.date || '-'}\n\n`;
        detailMsg += `${detail?.content || 'Detail konten tidak tersedia.'}\n\n`;
        detailMsg += `🔗 ${selected.url || 'https://jkt48.com'}`;

        if (detail?.cover || detail?.image) {
            await conn.sendMessage(m.chat, {
                image: { url: detail.cover || detail.image },
                caption: detailMsg
            }, { quoted: m });
        } else {
            await conn.reply(m.chat, detailMsg, m);
        }
    } catch (e) {
        console.error('JKT48 News Error:', e);
        await conn.reply(m.chat, `❌ Terjadi kesalahan: ${e.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48news', 'news [nomor]'];
handler.tags = ['jkt48'];
handler.command = /^(news|jkt48news)$/i;

export default handler;
