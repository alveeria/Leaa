import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, {command, usedPrefix, args}) => {

	let user = global.db.data.users[m.sender]
	
    const list = `╭───────────────
│⬡ 🍖 *Ayambakar* : ${user.ayambakar}
│⬡ 🍖 *ikan bakar* : ${user.ikanbakar}
│⬡ 🍖 *lele bakar* : ${user.lelebakar}
│⬡ 🍖 *nila bakar* : ${user.nilabakar}
│⬡ 🍖 *bawal bakar* : ${user.bawalbakar}
│⬡ 🍖 *udang bakar* : ${user.udangbakar}
│⬡ 🍖 *paus bakar* : ${user.pausbakar}
│⬡ 🍖 *kepiting bakar* : ${user.kepitingbakar}
│⬡ 🍗 *Ayamgoreng* : ${user.ayamgoreng}
│⬡ 🥘 *Rendang* : ${user.rendang}
│⬡ 🥩 *Steak* : ${user.steak}
│⬡ 🥠 *Babipanggang* : ${user.babipanggang}
│⬡ 🍲 *Gulaiayam* : ${user.gulai}
│⬡ 🍜 *Oporayam* : ${user.oporayam}
│⬡  🍞 *Roti* : ${user.roti}
│⬡ 🍣 *Sushi* : ${user.sushi}
│⬡ 🍷 *Vodka* : ${user.vodka}
│⬡ 💉 *Bandage* : ${user.bandage}
│⬡ ☘️ *Ganja* : ${user.ganja}
│⬡ 🍺 *Soda* : ${user.soda}
╰───────────────`
m.reply(list) 

}
handler.help = handler.command = ['kulkas']
handler.tags = ['rpg']
handler.register = true
handler.group = true
handler.rpg = true
module.exports = handler
export default module.exports;
