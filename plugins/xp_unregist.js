import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const { createHash } = require('crypto');

let handler = async function (m, { conn, args, command, usedPrefix }) {
  // Cek jika ada argumen yang diberikan
  if (!args[0]) throw `✳️ *Masukkan nomor seri Anda untuk konfirmasi.*\nContoh: ${usedPrefix + command} nomorseri\n\nCek nomor seri Anda dengan perintah:\n*${usedPrefix}ceksn*`;

  // 1. Mengambil data pengguna berdasarkan PENGIRIM PESAN (m.sender).
  //    Ini memastikan target unreg selalu orang yang mengetik perintah.
  let user = global.db.data.users[m.sender];

  // 2. Membuat nomor seri pembanding berdasarkan nomor PENGIRIM PESAN.
  //    Setiap pengguna hanya punya satu nomor seri yang terikat pada nomor WhatsApp-nya.
  let sn = createHash('md5').update(m.sender).digest('hex');

  // 3. Membandingkan nomor seri yang dimasukkan (args[0]) dengan nomor seri milik PENGIRIM PESAN (sn).
  //    Jika tidak cocok, perintah gagal. Orang lain tidak akan bisa karena SN mereka berbeda.
  if (args[0] !== sn) throw '⚠️ *Nomor seri salah.*\nPastikan Anda memasukkan nomor seri milik Anda sendiri.';

  // 4. Jika semua pengecekan berhasil, status registrasi PENGIRIM PESAN diubah menjadi false.
  user.registered = false;
  m.reply(`✅ Berhasil membatalkan registrasi. Anda tidak lagi terdaftar.`);
};

handler.help = ['unreg <Nomor Seri>'];
handler.tags = ['xp']; // Mungkin lebih cocok di tag 'xp' atau 'main' daripada 'rg'
handler.command = ['unreg'];
handler.register = true; // Hanya user yang sudah terdaftar yang bisa unreg

module.exports = handler;
export default module.exports;
