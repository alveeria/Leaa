import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
    let vn = "./vn/lopyou.mp3"
	if (global.db.data.users[m.sender].nama == 'pacar marsha') return conn.sendFile(m.chat, vn, "lah.mp3", null, m, true, {
		type: "audioMessage",
		ptt: true,
	})
	conn.sendFile(m.chat, './vn/claraa.mp3', "lah.mp3", null, m, true, {
		type: "audioMessage",
		ptt: true,
	})
	
}
handler.customPrefix = /^(lopyou|lopyu|lopeyu|lopeyou|loveyu|loveyou|love you|love yu|i love you)$/i;
handler.command = new RegExp();

module.exports = handler;
export default module.exports;
