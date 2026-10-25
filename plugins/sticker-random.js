import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
var { 
sticker5 
} = require('../legacy-lib/sticker')
var handler = async (m, {
 conn, 
 command
 }) => {
    var error = (`https://telegra.ph/file/12141dd462ecabeed1347.png`)
    try {
        if (command == 'dinokuning' || command == 'sdino') {
        const res = `https://api.betabotz.eu.org/api/sticker/dinokuning?apikey=${lann}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'patrick' || command == 'spatrick') {
        const res = `https://api.betabotz.eu.org/api/sticker/patrick?apikey=${lann}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'spongebob' || command == 'sspongebob') {
        const res = `https://api.betabotz.eu.org/api/sticker/spongebob?apikey=${lann}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'doge' || command == 'sdoge') {
        const res = `https://api.betabotz.eu.org/api/sticker/doge?apikey=${lann}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'manusialidi' || command == 'smanusialidi') {
        const res = `https://api.betabotz.eu.org/api/sticker/manusialidi?apikey=${lann}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
    } catch (e) {
        console.log(e)
        await conn.sendFile(m.chat, error, 'error.webp', '', m)
    }
}

handler.command = handler.help = ['dinokuning', 'patrick', 'spongebob', 'doge', 'manusialidi', 'sdino', 'spatrick', 'sspongebob', 'sdoge', 'smanusialidi']
handler.tags = ['sticker']
handler.limit = true
module.exports = handler

export default module.exports;
