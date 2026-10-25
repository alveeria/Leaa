import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = __baileys;

const qrisUrl = 'https://files.catbox.moe/spv9di.jpg'; 

const handler = async (message, { conn }) => {
    const replyMessage = `Metode Pembayaran:\n\nDana: 081289694906\n\nSilakan lakukan pembayaran dan kirim bukti pembayaran dengan caption ID Transaksi.`;
    await message.reply(replyMessage);

    const { imageMessage } = await generateWAMessageContent({
        image: { url: qrisUrl }
    }, {
        upload: conn.waUploadToServer
    });

    const msg = generateWAMessageFromContent(message.chat, {
        imageMessage: {
            ...imageMessage,
            caption: 'Scan QRIS untuk pembayaran'
        }
    }, { quoted: message });

    await conn.relayMessage(message.chat, msg.message, {
        messageId: msg.key.id
    });
};

handler.customPrefix = /^bayar$/i;
handler.command = new RegExp;
module.exports = handler;

// no copas code dari luar, logic pakai kepala
// bebas ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/P7K5ycatYJA
export default module.exports;
