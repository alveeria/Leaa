import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
  const c = await conn.groupMetadata(m.chat);
  const online = Object.entries(conn.chats)
    .filter(
      ([k, v]) =>
        k.endsWith("@s.whatsapp.net") &&
        v.presences &&
        c.participants.some((p) => k.startsWith(p.id)),
    )
    .sort((a, b) => a[0].localeCompare(b[0], "id", { sensitivity: "base" }))
    .map(([k], i) => `*${i + 1}.* @${k.split("@")[0]}`)
    .join("\n");

  let text = `*👤 LIST ONLINE*\n<==================>\n`;
  text += online;

  conn.reply(m.chat, text, m);
};

handler.help = ["listonline"].map((a) => a + " *[get list online member]*");
handler.tags = ["group"];
handler.command = ["listonline"];
handler.group = true;
handler.admin = true;

module.exports = handler;
export default module.exports;
