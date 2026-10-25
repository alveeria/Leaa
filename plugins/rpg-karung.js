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
	let cap = `*━ ❨ Karung Hasil Mulung ❩ ━*

=> *Berikut Karung :*  @${m.sender.split`@`[0]}

*Kaleng = [ ${user.kaleng} ]*
*Botol = [ ${user.botol} ]*
*Kardus = [ ${user.kardus} ]*
*Sampah = [ ${user.sampah} ]*

Gunakan *${usedPrefix}sell* untuk dijual`

	conn.reply(m.chat, cap, m, { mentions: await conn.parseMention(cap) } )
}

handler.help = ['karung']
handler.tags = ['rpg']
handler.command = /^(karung)$/i
handler.group = true
handler.rpg = true

module.exports = handler
export default module.exports;
