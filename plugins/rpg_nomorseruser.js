import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const { createHash } = require('crypto')


let handler = async function (m, { text, usedPrefix }) { 

    let sn = createHash('md5').update(m.sender).digest('hex')
    m.reply(`
Serial Number kamu: 
${sn}`.trim())
}

handler.help = ['nomorseri']
handler.tags = ['xp', 'rpg']
handler.command = ['nomorseri'] 
handler.group = true
handler.rpg = true


module.exports = handler
export default module.exports;
