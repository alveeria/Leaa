import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fs = require('fs')
const path = require('path')
let handler = async (m, { usedPrefix, command, text }) => {
    if (!text) throw `where is the text?\n\nexempel: ${usedPrefix + command} menu`
    const filename = path.join(__dirname, `./${text}${!/\.js$/i.test(text) ? '.js' : ''}`)
    const listPlugins = fs.readdirSync(path.join(__dirname)).map(v => v.replace(/\.js/, ''))
    if (!fs.existsSync(filename)) return m.reply(`
'${filename}' not found!
${listPlugins.map(v => v).join('\n').trim()}
`.trim())
    m.reply(fs.readFileSync(filename, 'utf8'))
}
handler.help = ['getplugin'].map(v => v + ' [filename]')
handler.tags = ['owner']
handler.command = /^(getplugin|get ?plugin|gp)$/i

handler.rowner = true

module.exports = handler

export default module.exports;
