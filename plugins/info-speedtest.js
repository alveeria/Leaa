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
        o = await exec('python3 speed.py --share --secure')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) 
        conn.relayMessage(m.chat, {
extendedTextMessage:{
                text: stdout, 
                contextInfo: {
                     externalAdReply: {
                        title: "",
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg',
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
}}, {})
        if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['speedtest']
handler.tags = ['info']
handler.command = /^(speedtest|ookla)$/i
handler.premium = false
module.exports = handler

export default module.exports;
