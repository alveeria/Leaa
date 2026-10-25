import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const moneymins = 1
let handler = async (m, { conn, command, args }) => {
  let count = command.replace(/^pull/i, '')
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].bank / moneymins) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].bank >= moneymins * count) {
    global.db.data.users[m.sender].bank -= moneymins * count
    global.db.data.users[m.sender].money += count
    conn.reply(m.chat, `🚩 -${moneymins * count} ATM\n+ ${count} Money`, m)
  } else conn.reply(m.chat, `🚩 ATM you are left ${count} !!`, m)
}
handler.help = ['pull *<amount>*', 'pullall']
handler.tags = ['rpg']
handler.command = /^pull([0-9]+)|pull|pullall$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false
handler.limit = true
handler.admin = false
handler.botAdmin = false
handler.rpg = true

handler.fail = null
handler.exp = 0

module.exports = handler
export default module.exports;
