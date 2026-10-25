import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const { translate } = require('@vitalets/google-translate-api');
const defaultLang = 'id'
let handler = async (m, { args, usedPrefix, command }) => {
    if (!args[0] && !m.quoted) {
        throw `*• Example* :  ${usedPrefix}${command} id how are you`
    }
    let lang = args[0]
    let text = args.slice(1).join(' ')
    if ((args[0] || '').length !== 2) {
        lang = defaultLang
        text = args.join(' ')
    }
    if (!text && m.quoted && m.quoted.text) text = m.quoted.text
    let result = await translate(text, { to: lang, autoCorrect: true }).catch(_ => null)     
    if (!result) throw 'Terjemahan gagal.'
    m.reply(result.text.toString())
}
handler.help = ['tr <leng> <text>']
handler.tags = ['tools']
handler.command = ['translate', 'tl', 'trid', 'tr']
module.exports = handler

export default module.exports;
