import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { args, usedPrefix, command }) => {

if (!args[0]) throw 'usernamenya mana om'
if (!args[1]) throw 'repo nya mana?'
if (!args[2]) throw 'masukkan nama branch'
let url = `https://github.com/${args[0]}/${args[1]}/archive/refs/heads/${args[2]}.zip`
//F
m.reply(`compressing data to file zip*`)
conn.sendFile( m.chat, url, `${args[1]} ${args[2]}.zip`, null, m)

}
handler.help = ['githubdl'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /githubdl/i

handler.limit = false;
handler.group = false;

module.exports = handler
export default module.exports;
