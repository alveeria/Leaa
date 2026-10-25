import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, args }) => {
  let chats = global.db.data.chats;

  // Filter grup yang sedang di-mute
  let mutedChats = Object.entries(chats).filter(([_, chat]) => chat.isBanned);

  // Jika ingin meng-unmute berdasarkan nomor yang diberikan
  if (args[0]) {
    let index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= mutedChats.length) {
      return m.reply('Nomor yang kamu masukkan tidak valid.');
    }

    let [chatId] = mutedChats[index];
    chats[chatId].isBanned = false;
    m.reply(`Berhasil meng-unmute grup dengan ID: ${chatId}`);
  } else {
    // Tampilkan daftar grup yang di-mute
    if (mutedChats.length === 0) {
      m.reply('Tidak ada grup yang sedang di-mute.');
    } else {
      let list = mutedChats.map(([id], i) => `${i + 1}. ${id}`).join('\n');
      m.reply(`Daftar grup yang di-mute:\n\n${list}\n\nKetik *listmute [nomor]* untuk meng-unmute.`);
    }
  }
};

handler.help = ['listmute'];
handler.tags = ['owner'];
handler.command = ['listmute'];
handler.owner = true;

module.exports = handler;

export default module.exports;
