import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch')
let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `contoh:\n${usedPrefix + command} betabotz`
    
    try {
        let json = await fetch(`https://api.betabotz.eu.org/api/tools/styletext?text=${text}&apikey=${lann}`)
        let data = await json.json()
        let caption = ""
        for (let x of data.result) {
            caption += `
${x.result}\n`
        }
        return m.reply(caption)
    } catch (e) {
        console.log(e)
        throw `${eror}`
    }
}

handler.help = ['font','styletext'].map(v => v + ' <text>')
handler.tags = ['tools']
handler.command = /^(font|styletext)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.limit = true

module.exports = handler

export default module.exports;
