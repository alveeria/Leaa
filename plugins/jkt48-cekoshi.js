import { getActiveMembers } from '../lib/jkt48/members.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendPresenceUpdate('composing', m.chat);
    
    if (!text) {
        return conn.reply(m.chat, `Ayo tulis nama kamu dong! Contoh: \`${usedPrefix + command} Budi\` biar aku bisa cari jodoh oshi kamu! 🔮`, m);
    }

    const userName = text.trim();

    const descriptions = [ 
        'Dia baik banget, bikin hati adem!', 
        'Wajahnya manis seperti permen!', 
        'Pintar dan selalu memberikan inspirasi!', 
        'Senyumnya bisa bikin dunia jadi lebih cerah!', 
        'Dia ceria banget, selalu bikin suasana jadi hidup!', 
        'Punya aura tenang yang bikin nyaman!', 
        'Humoris dan selalu bikin ketawa!', 
        'Dia perhatian dan penuh pengertian!', 
        'Lemah lembut tapi punya tekad baja!', 
        'Selalu penuh semangat pantang menyerah!', 
        'Punya pesona unik yang bikin terpesona!', 
        'Multitalenta dan pekerja keras!' 
    ];

    try {
        const members = await getActiveMembers();
        if (!members || !members.length) {
            throw new Error('Data member JKT48 sedang tidak tersedia.');
        }

        const randomIndex = Math.floor(Math.random() * members.length);
        const member = members[randomIndex];

        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        const matchLevel = Math.floor(Math.random() * 41) + 60; // 60% - 100%

        let caption = `💞 *JODOH OSHI JKT48: ${userName.toUpperCase()}* 💞\n\n`;
        caption += `✨ *Oshi Pilihan:* ${member.name} (${member.nickname || member.team})\n`;
        caption += `🏷️ *Team:* ${member.team || 'JKT48'}\n`;
        caption += `🔮 *Tingkat Kecocokan:* ${matchLevel}%\n`;
        caption += `📝 *Sifat:* ${randomDescription}\n`;
        if (member.jikoshoukai) {
            caption += `\n💬 _"${member.jikoshoukai}"_\n`;
        }
        caption += `\nTetap dukung oshi kamu sepenuh hati ya! ✨`;

        const photo = member.photo || member.photo_1 || member.photo_2;
        if (photo) {
            await conn.sendMessage(m.chat, {
                image: { url: photo },
                caption: caption
            }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }
    } catch (error) {
        console.error('Cek Oshi Error:', error);
        await conn.reply(m.chat, `⚠️ Terjadi kesalahan: ${error.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['cekoshi [nama]'];
handler.tags = ['jkt48'];
handler.command = /^(cekoshi|oshimatch|jodohoshi)$/i;

export default handler;
