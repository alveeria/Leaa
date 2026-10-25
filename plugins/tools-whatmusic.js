import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');
const uploader = require('../legacy-lib/uploadFile');

let handler = async (m, { conn, usedPrefix, command }) => {
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || q.mediaType || ''
	if (/video|audio/.test(mime)) {
		let buffer = await q.download()
		await m.reply(wait)
		try {
		let media = await uploader(buffer)
		let json = await (await fetch(`https://api.betabotz.eu.org/api/tools/whatmusic?url=${media}&apikey=${lann}`)).json()		
        conn.sendMessage(m.chat, { text: json.result }, { quoted: m })
        } catch (err) {
      throw `${eror}`
    }
 } else throw `Reply audio/video with command ${usedPrefix + command}`
}
handler.help = ['whatmusic']
handler.tags = ['tools']
handler.command = /^(whatmusic)$/i
handler.limit = true;

module.exports = handler

export default module.exports;
