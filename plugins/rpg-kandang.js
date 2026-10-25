import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn, usedPrefix }) => {
	let user = global.db.data.users[m.sender]
	let cap = `*━━━ ❨ Kandang Buruan ❩ ━━┄┈*

=> *Berikut Kandang :*  @${m.sender.split`@`[0]}

*🐂 = [ ${user.banteng} ] banteng*
*🐅 = [ ${user.harimau} ] harimau*
*🐘 = [ ${user.gajah} ] gajah*
*🐐 = [ ${user.kambing} ] kambing*
*🐼 = [ ${user.panda} ] panda*
*🐊 = [ ${user.buaya} ] buaya*
*🐃 = [ ${user.kerbau} ] kerbau*
*🐮 = [ ${user.sapi} ] sapi*
*🐒 = [ ${user.monyet} ] monyet*
*🐗 = [ ${user.babihutan} ] babihutan*
*🐖 = [ ${user.babi} ] babi*
*🐓 = [ ${user.ayam} ] ayam*

Gunakan *${usedPrefix}pasar* untuk dijual atau *${usedPrefix}cook* untuk dijadikan bahan masakan.`

	conn.reply(m.chat, cap, m, { mentions: await conn.parseMention(cap) } )
}

handler.help = ['kandang']
handler.tags = ['rpg']
handler.command = /^(kandang)$/i
handler.group = true
handler.rpg = true

module.exports = handler
export default module.exports;
