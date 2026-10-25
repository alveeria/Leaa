import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const uploadImage = require('../legacy-lib/uploadImage.js');
const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image/g.test(mime)) {
            throw 'Perintah ini digunakan dengan cara mengirim atau me-reply sebuah gambar.';
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key,
            }
        });
        
        const media = await q.download();
        const imageUrl = await uploadImage(media);
        if (!imageUrl) {
            throw new Error('Gagal mengunggah gambar ke server. Coba lagi nanti.');
        }

        const { data } = await axios.get(`https://api.nekorinn.my.id/tools/capcut-imgupscaler?imageUrl=${encodeURIComponent(imageUrl)}`);

        if (!data.status || !data.result) {
            throw new Error(data.message || 'Gagal melakukan upscale gambar.');
        }

        const resultUrl = data.result;
        const caption = `✅ Gambar berhasil di-upscale!\n\n> © Leaa`;


        await conn.sendFile(m.chat, resultUrl, 'upscaled.jpg', caption, m);

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key,
            }
        });

    } catch (e) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key,
            }
        });
        
        console.error(e);
        const errorMessage = typeof e === 'string' ? e : e.message;
        m.reply(`Terjadi kesalahan: ${errorMessage}`);
    }
};

handler.help = ['upscale'];
handler.tags = ['tools'];
handler.command = /^(upscale|capcutupscale)$/i;

handler.limit = false;
handler.premium = false;

module.exports = handler;
export default module.exports;
