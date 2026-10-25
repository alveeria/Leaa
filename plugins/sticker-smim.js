import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const uploadImage = require('../legacy-lib/uploadImage')
const { MessageType } = __baileys
const { sticker } = require('../legacy-lib/sticker')
let handler = async (m, { conn, text, usedPrefix, command }) => {

    let [atas, bawah] = text.split`|`
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw `balas gambar dengan perintah\n\n${usedPrefix + command} <${atas ? atas : 'teks atas'}>|<${bawah ? bawah : 'teks bawah'}>`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`
    let img = await q.download()
    let url = await uploadImage(img, "true")
    meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas ? atas : '')}/${encodeURIComponent(bawah ? bawah : '')}.png?background=${url}`
try {
    let stiker = await sticker(null, meme, global.packname, global.author)
    await conn.sendFile(m.chat, stiker, {
      quoted: m
    })
  } catch (e) {
    m.reply('gagal membuat stiker, Mencoba Mengirim gambar')
    await conn.sendFile(m.chat, meme, 'image.png', 'JADIKAN STIKER SECARA MANUAL DENGAN MENGETIK .S', m)
  }
}
handler.help = ['smim <teks atas>|<teks bawah>']
handler.tags = ['sticker']
handler.command = /^(smim)$/i

handler.limit = false

module.exports = handler
export default module.exports;
