import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let cp = require ('child_process')
let { promisify } = require ('util')
let exec = promisify(cp.exec).bind(cp)
let handler = async (m, { conn}) => {
	await conn.reply(m.chat, `Please Wait`, m)
    let o
    try {
        o = await exec('cd && du -h --max-depth=1')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim())
        m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['disk']
handler.tags = ['info']
handler.command = /^(disk)$/i
handler.premium = false
module.exports = handler

export default module.exports;
