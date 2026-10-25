import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const { areJidsSameUser } = __baileys;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, args, isOwner, participants }) => {
  let user;
  let users;

  if (m.quoted) {
    if (m.quoted.sender === conn.user.jid)
      return m.reply(`Jangan saya min *-_-*`);
    user = m.quoted.sender;
  } else if (text) {
    users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id));
    if (users.length === 0) return m.reply(`*@tag* yang ingin di demote!`);
    user = users[0];
  } else {
    return m.reply(`Tag atau balas pesan user yang ingin diturunkan jabatannya`);
  }

  const isAdmin = participants.find(v => areJidsSameUser(v.id, user))?.admin;
  if (!isAdmin) return m.reply(`User tersebut bukan admin.`);

  // Get group metadata to check owner
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupOwner = groupMetadata.owner;

  // Check if target is group owner
  if (user === groupOwner) {
    return m.reply(`Mana bisa gue demote Owner *-_-*`);
  }

  try {
    await delay(1000);
    await conn.groupParticipantsUpdate(m.chat, [user], "demote");
    m.reply(
      `@${user.split`@`[0]} sekarang bukan admin.`,
      null,
      { mentions: [user] }
    );
  } catch (e) {
    console.error(e);
    m.reply(
      `*!* Gagal menurunkan jabatan @${user.split`@`[0]}`,
      null,
      { mentions: [user] }
    );
  }
};

handler.help = ["demote @user"];
handler.tags = ["group"];
handler.command = /^(demote)$/i;

handler.admin = true;
handler.botAdmin = true;
handler.group = true;

module.exports = handler;
export default module.exports;
