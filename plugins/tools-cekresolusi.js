import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const jimp = require("jimp")
const uploadImage = require("../legacy-lib/uploadImage.js")
const uploadFile = require("../legacy-lib/uploadFile.js")

let handler = async (m, { conn, usedPrefix }) => {
	
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw "where the media?"

let media = await q.download()
let isMedia = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
let link = await (isMedia ? uploadImage : uploadImage)(media)

let source = await jimp.read(await link)
let height = await source.getHeight()
let width = await source.getWidth()

m.reply(`*_RESOLUSI:_* ${width} x ${height}

*> Lebar :* ${width}
*> Tinggi :* ${height}

*> Link :* ${link}`)
}
handler.help = ['cekresolution *<foto>*', 'cekreso *<foto>*']
handler.tags = ['tools']
handler.command = /^(cekreso(lution)?)$/i

module.exports = handler
export default module.exports;
