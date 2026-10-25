import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fetch = require('node-fetch');

let handler = async (m, { conn, command }) => {
    let anu = `─────〔 *${command}* 〕─────\n`;

    if (command === 'bucin') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/katabucin?apikey=${lann}`)).json();
        anu += res.bucin;
    } else if (command === 'katailham') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/katailham?apikey=${lann}`)).json();
        anu += res.hasil;
    } else if (command === 'katadilan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/katadilan?apikey=${lann}`)).json();
        anu += res.dilan;
    } else if (command === 'fiersa') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/fiersa?apikey=${lann}`)).json();
        anu += res.fiersa;
    } else if (command === 'fakta') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/fakta?apikey=${lann}`)).json();
        anu += res.result;
    } else if (command === 'nyindir') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/nyindir?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'ngawur') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/ngawur?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'jawa') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/quotesjawa?apikey=${lann}`)).json();
        anu += res.quotes;
    } else if (command === 'quotes') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/quotes?apikey=${lann}`)).json();
        anu += res.quotes;
    } else if (command === 'sunda') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/sunda?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'batak') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/batak?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'aceh') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/aceh?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'cina') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/china?apikey=${lann}`)).json();
        anu += res.hasl;
    } else if (command === 'minangkabau') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/random/minangkabau?apikey=${lann}`)).json();
        anu += res.hasl;
    }
    m.reply(anu);
};

handler.help = ['bucin', 'katailham', 'katadilan', 'fiersa', 'fakta', 'nyindir', 'ngawur', 'jawa', 'quotes','sunda','batak', 'aceh', 'cina', 'minangkabau'];
handler.tags = ['quotes'];
handler.command = /^(bucin|katailham|katadilan|fiersa|fakta|nyindir|ngawur|jawa|quotes|sunda|batak|aceh|cina|minangkabau)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;
handler.register = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;

module.exports = handler;
export default module.exports;
