import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const { MessageType } = __baileys;

let handler = async (m, { conn, text }) => {
  if (!text) {
    throw 'Masukkan jumlah money yang ingin ditambahkan pada pengguna. Contoh: .addmoney @user 10';
  }
    
 	conn.chatRead(m.chat)
	conn.sendMessage(m.chat, {
		react: {
			text: '🕒',
			key: m.key,
		}
	})

  let mentionedJid = m.mentionedJid[0];
  if (!mentionedJid) {
    throw 'Tag pengguna yang ingin ditambahkan moneynya Contoh: .addmoney @user 10';
  }

  let pointsToAdd = parseInt(text.split(' ')[1]);
  if (isNaN(pointsToAdd)) {
    throw 'Jumlah money yang dimasukkan harus berupa angka. Contoh: .addmoney @user 10';
  }

  let users = global.db.data.users;
  if (!users[mentionedJid]) {
    users[mentionedJid] = {
      money: 0,
      exp: 0,
      lastclaim: 0
    };
  }

  users[mentionedJid].money += pointsToAdd;

  conn.reply(m.chat, `Berhasil menambahkan ${pointsToAdd} money untuk @${mentionedJid.split('@')[0]}.`, m, {
    mentions: [mentionedJid]
  });
};

handler.help = ['addmoney @user <jumlah money>'];
handler.tags = ['owner'];
handler.command = /^addmoney$/i;
handler.owner = true;

module.exports = handler;
export default module.exports;
