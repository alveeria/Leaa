import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch')

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} betabotzz`   
    try {     
        let json = await fetch(`https://api.betabotz.eu.org/api/stalk/tt?username=${text}&apikey=${lann}`).then(res => res.json());
        let caption = `⦿  *T I K T O K - S T A L K*\n\n`
        caption += `	◦  *Username* : ${json.result.username}\n`
        caption += `	◦  *Description* : ${json.result.description}\n`
        caption += `	◦  *Likes* : ${json.result.likes}\n`
        caption += `	◦  *Followers* : ${json.result.followers}\n`
        caption += `	◦  *Following* : ${json.result.following}\n`
        caption += `	◦  *Totalposts* : ${json.result.totalPosts}\n\n`       
        conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: wm,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: json.result.profile,
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
            }
        }, {})
    } catch (e) {     
        throw `Error: ${eror}`
    }
}
handler.help = ['ttstalk <username>']
handler.tags = ['stalk']
handler.command = /^(ttstalk|tiktokstalk)$/i
handler.limit = true

module.exports = handler

export default module.exports;
