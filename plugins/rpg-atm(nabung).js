import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const moneyplus = 1
let handler = async (m, { conn, command, args }) => {
  let count = command.replace(/^atm/i, '')
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].money / moneyplus) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
  count = Math.max(1, count)
  if (global.db.data.users[m.sender].money >= moneyplus * count) {
    global.db.data.users[m.sender].money -= moneyplus * count
    global.db.data.users[m.sender].bank += count
    conn.reply(m.chat, `🚩 -${moneyplus * count} Money\n+ ${count} ATM`, m)
  } else conn.reply(m.chat, `🚩 Money not enough to save ${count} ATM`, m)
}
handler.help = ['atm *<amount>*', 'atmall']
handler.tags = ['rpg']
handler.command = /^(atm([0-9]+)|atm|atmall)$/i
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
