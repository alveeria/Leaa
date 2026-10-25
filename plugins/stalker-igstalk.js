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
    if (!text) throw `contoh:\n${usedPrefix + command} erlanrahmat_14`
    try {
        let api = await fetch(`https://api.betabotz.eu.org/api/stalk/ig?username=${text}&apikey=${lann}`)
        let response = await api.json()
        if (response.status) {
            let { photoUrl, postsCount, followers, following, bio, fullName, username } = response.result;
            let capt;
            capt = `乂 *I G S T A L K E R*\n\n`;
            capt += `◦ *Username* : ${username}\n`;
            capt += `◦ *Full Name* : ${fullName}\n`;
            capt += `◦ *Bio* : ${bio}\n`;
            capt += `◦ *Followers* : ${followers}\n`;           
            capt += `◦ *Following* : ${following}\n`;            
            capt += `◦ *Total Post* : ${postsCount}\n`;
           capt += `\n`;        
            return conn.sendFile(m.chat, photoUrl, 'pp.png', capt, m)
        } else {
            throw 'Sistem Sedang Bermasalah!'
        }
    } catch (e) {
        m.reply('Sistem Sedang Bermasalah!')
    }
}

handler.help = ['igstalk <username>']
handler.tags = ['stalk']
handler.command = /^(igstalk)$/i
handler.limit = true

module.exports = handler

export default module.exports;
