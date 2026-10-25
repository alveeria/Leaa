import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fetch = require('node-fetch');

let handler = async (m, {
    text,
    usedPrefix,
    command
}) => {
    if (!text) throw `*Example:* ${usedPrefix + command} <token>`;
    m.reply(wait)
    try {
        let res = await (await fetch(`https://api.betabotz.eu.org/api/tools/2fa?token=${encodeURIComponent(text)}&apikey=${lann}`)).json();
        let content = `*2FA Verification Result*\n\n`;

        if (res.status && res.result) {
            content += `  ◦ *Token:* ${res.result.token}\n`;
        } else {
            content += 'Token gagal didapatkan!.';
        }
        await m.reply(content);
    } catch (error) {
        throw eror
    }
};

handler.command = handler.help = ['2fa', 'authenticator', 'autentikator'];
handler.tags = ['tools'];
handler.limit = true;
module.exports = handler;

export default module.exports;
