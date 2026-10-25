import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch')

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `uhm.. cari apa?\n\ncontoh:\n${usedPrefix + command} mabar`    
    try {
    await m.reply(wait)
        const response = await fetch(`https://api.betabotz.eu.org/api/search/linkgroupwa?text1=${encodeURIComponent(text)}&apikey=${lann}`)
        const data = await response.json()    
        if (!data.result || data.result.length === 0) throw 'Group tidak ditemukan ¯\\_(ツ)_/¯'       
        const teks = data.result.map(group => group.title + '\n' + group.link).join('\n\n')
        m.reply(teks)      
    } catch (error) {
        console.error(error)
        throw eror
    }
}

handler.help = ['carigrup <pencarian>']
handler.tags = ['tools']
handler.command = /^carig(ro?up|c)/i
handler.limit = true

module.exports = handler

export default module.exports;
