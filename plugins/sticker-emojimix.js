import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
import * as __baileys from '@whiskeysockets/baileys';
const fetch = require('node-fetch')
let fs = require("fs")
const { MessageType } = __baileys
const { sticker5 } = require('../legacy-lib/sticker')

let handler = async (m, { conn, text, args }) => {
  if (!args[0]) throw 'Contoh penggunaan:\n\n*.emojimix 🤨+😣*'
  try {
    let [emoji1, emoji2] = text.split`+`
    let anu = await fetch(`https://api.betabotz.eu.org/api/emoji/emojimix?emoji1=${emoji1}&emoji2=${emoji2}&apikey=${lann}`)
    let res = await anu.json()
    let stiker = await sticker5(res.result.results[0].media_formats.png_transparent.url, false, packname, author)
    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
  } catch (e) {
    m.reply('*🚩 Emoji tidak support!*');
  }
}

handler.help = ['emojimix']
handler.tags = ['sticker']
handler.command = /^(emojimix)$/i
handler.limit = true
module.exports = handler

export default module.exports;
