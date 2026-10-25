import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
let fetch = require('node-fetch')
let handler = async (m, { args, usedPrefix, command }) => {

    if (!args[0]) throw 'link githubnya mana? contoh: https://github.com/BOTCAHX/RTXZY-MD'

    if (!regex.test(args[0])) throw 'link salah!'

    let [, user, repo] = args[0].match(regex) || []
    repo = repo.replace(/.git$/, '')
    let url = `https://api.github.com/repos/${user}/${repo}/zipball`
    	let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
		m.reply(wait)
		await conn.sendMessage(m.chat, { document: { url: url }, mimetype: 'application/zip', fileName: filename.replace('.zip.zip','.zip')}, { quoted : m })

}
handler.help = ['gitclone <url>']
handler.tags = ['downloader']
handler.command = /gitclone/i

handler.limit = false;
handler.group = true;

module.exports = handler
export default module.exports;
