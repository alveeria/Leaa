import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const cheerio = require('cheerio');
const fetch = require('node-fetch');

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    text,
    command
}) => {
    let startTime = new Date();
    let resl = await animeVideo();
    let cap = `*Fetching:* ${(new Date() - startTime) / 1000} seconds`;
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
    await conn.sendFile(m.chat, resl.source, "", cap, m);
}

handler.help = ["amv"];
handler.tags = ["anime"];
handler.command = /^(amv)$/i;
handler.register = false;
handler.premium = false;
handler.limit = false;
handler.group = false;

module.exports = handler;

async function animeVideo() {
    const url = 'https://mobstatus.com/anime-whatsapp-status-video/'; // Ganti dengan URL yang sesuai
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const videos = [];

    const title = $('strong').text();

    $('a.mb-button.mb-style-glass.mb-size-tiny.mb-corners-pill.mb-text-style-heavy').each((index, element) => {
        const href = $(element).attr('href');
        videos.push({
            title,
            source: href
        });
    });

    const randomIndex = Math.floor(Math.random() * videos.length);
    const randomVideo = videos[randomIndex];

    return randomVideo;
}
export default module.exports;
