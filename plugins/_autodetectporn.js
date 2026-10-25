import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch');
let uploader = require('../legacy-lib/uploadImage');


let handler = m => m;

handler.before = async function(m, { conn }) {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!global.antiporn) return;
    if (!/image/.test(mime)) return;
    
    try {
        let media = await q.download();
        let url = await uploader(media);
        
        const response = await fetch(`https://api.betabotz.eu.org/api/tools/nsfw-detect?url=${url}&apikey=${lann}`);
        const res = await response.json();
        
        if (res.result.labelName === 'Porn') {
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });
            m.reply('⚠️antiporn detected⚠️');
        }
    } catch (e) {
        console.log(e);
    }
};

module.exports = handler;

export default module.exports;
