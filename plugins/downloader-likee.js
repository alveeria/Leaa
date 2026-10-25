import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://l.likee.video/v/tmj1oh`;    
    try {
        if (!text.match(/likee/gi)) throw `URL Tidak Ditemukan!`;        
        m.reply(wait);      
        const response = await axios.get(`https://api.betabotz.eu.org/api/download/likee?url=${text}&apikey=${lann}`);        
        const res = response.data.result;      
        var { 
          title,
          withwm,
          nowm
        } = res;
        let capt = `乂 *L I K E E   V I D E O*\n\n`;
        capt += `◦ *Title* : ${title}\n`;
        capt += `\n`;        
        await conn.sendFile(m.chat, nowm, null, capt, m);
    } catch (e) {
        throw eror
    }
};
handler.command = handler.help = ['likee'];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;
export default module.exports;
