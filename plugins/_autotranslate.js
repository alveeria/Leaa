import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const axios = require('axios');

module.exports = {
    before: async function (m) {
        const chat = global.db.data.chats[m.chat];
        if (!chat || !chat.autotranslate) return;

        let text = m.text;

        try {
            let res = await axios.get(`https://api.betabotz.eu.org/api/tools/translate?text=${encodeURIComponent(text)}&lang=id&apikey=${lann}`);
            
            if (res.data.status && res.data.result && res.data.result !== text) {
                let translatedText = res.data.result;
                m.reply(`*Auto Translate detected*\n\n_${translatedText}_`);
            }
        } catch (error) {
            console.error('Error translating text:', error);
        }
    }
};

export default module.exports;
