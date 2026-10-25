import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { args, conn }) => {
    if (!args.length) return conn.reply(m.chat, "Masukkan sesuatu untuk dirate!\nContoh: *.rate seberapa cocok aku dan dia*", m);

    // Menghasilkan angka random antara 1 - 100
    let rating = Math.floor(Math.random() * 100) + 1;

    // Format pesan
    let text = `✨ *Pertanyaan:* ${args.join(" ")}\n📊 *Jawaban:* ${rating}%`;

    // Kirim balasan
    conn.reply(m.chat, text, m);
}

handler.help = ['rate']
handler.tags = ['fun']
handler.command = /^(rate|seberapa|cocok|kece)$/i
handler.group = true
handler.limit = true
handler.fail = null

module.exports = handler

export default module.exports;
