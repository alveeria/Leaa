import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async m => {

let krtu = `web`
m.reply(`
> https://api.betabotz.eu.org
> https://tools.betabotz.eu.org

`.trim()) 
}
handler.command = /^(web)$/i

module.exports = handler

export default module.exports;
