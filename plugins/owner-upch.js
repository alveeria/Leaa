import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const { proto } = __baileys; 

let handler = async (m, { conn, text }) => {
    try {

        let teks = text 
            ? text 
            : m.quoted && m.quoted.text 
            ? m.quoted.text 
            : m.quoted && m.quoted.caption 
            ? m.quoted.caption 
            : m.quoted && m.quoted.description 
            ? m.quoted.description 
            : '';
        if (!teks) {
            return m.reply('Harap masukkan teks untuk dikirim ke channel!');
        }

        await sendMessage(conn, teks);
        m.reply('Sukses mengirim pesan ke channel');
    } catch (e) {
        console.error(e);
        m.reply('Gagal mengirim pesan');
    }
};


handler.command = /^(ch)$/i; 
handler.owner = true; 
module.exports = handler; 


function sendMessage(conn, teks) {
    const msg = {
        conversation: teks,
    };
    const plaintext = proto.Message.encode(msg).finish();
    const plaintextNode = {
        tag: 'plaintext',
        attrs: {},
        content: plaintext,
    };
    const node = {
        tag: 'message',
        attrs: {
            to: '', //isi dengan id kalian! untuk cara mendapatkan id nya bisa lihat di https://youtu.be/L3hDISOjO7k
            type: 'text',
        },
        content: [plaintextNode],
    };

    return conn.query(node); 
}

export default module.exports;
