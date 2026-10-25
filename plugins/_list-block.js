import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
var fetch = require("node-fetch");
var handler = async (m, {
 conn 
 }) => {
var block = await conn.fetchBlocklist()                    
conn.reply(m.chat, 'List Block:\n\n' + `Total: ${block == undefined ? '*0* Diblokir' : '*' + block.length + '* Diblokir'}\n` + block.map(v => '乂 @' + v.replace(/@.+/, '')).join`\n`, m, { mentions: block })
};
handler.help = ['blocklist'];
handler.tags = ['info'];
handler.command = /^listbloc?k|bloc?klist|daftarbloc?k|blocks$/i
handler.owner = false;
module.exports = handler;

export default module.exports;
