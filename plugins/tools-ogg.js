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
	if (/video/.test(mime)) {
		let buffer = await q.download()
		await m.reply(wait)
		try {
		let media = await uploader(buffer)
		let json = await (await fetch(`https://api.betabotz.eu.org/api/tools/video2audio?url=${media}&apikey=${lann}`)).json()		
        await conn.sendFile(m.chat, json.result, "audio.mp3", "*DONE*", m)
        } catch (err) {
      throw eror
    }
 } else throw `Reply video with command ${usedPrefix + command}`
}
handler.help = handler.command = ['video2audio', 'tomp3', 'toaudio']
handler.tags = ['tools']
handler.limit = true;

module.exports = handler

export default module.exports;
