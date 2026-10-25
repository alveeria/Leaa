import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const fs = require('fs');
const path = require('path');

const storeDatabaseFilePath = path.join(__dirname, 'store-database.json');

const loadStoreDatabase = () => {
    if (fs.existsSync(storeDatabaseFilePath)) {
        const data = fs.readFileSync(storeDatabaseFilePath);
        return JSON.parse(data);
    }
    return { store: {}, transactions: {}, setlist: {} };
};

const saveStoreDatabase = (data) => {
    fs.writeFileSync(storeDatabaseFilePath, JSON.stringify(data, null, 2));
};

const handler = async (message, { isOwner, usedPrefix }) => {
    const storeDatabase = loadStoreDatabase();
    storeDatabase.setlist = storeDatabase.setlist || {};

    const chatId = message.chat;

    if (!isOwner) throw `Hanya owner yang dapat menghapus setlist.`;

    if (storeDatabase.setlist[chatId]) {
        delete storeDatabase.setlist[chatId];
        saveStoreDatabase(storeDatabase);
        return message.reply(`Berhasil menghapus setlist untuk grup ini!`);
    } else {
        return message.reply(`Setlist untuk grup ini belum diatur.`);
    }
};

handler.help = ['delsetlist'];
handler.tags = ['store'];
handler.command = /^delsetlist$/i;
handler.owner = true;
module.exports = handler;


// no copas code dari luar, logic pakai kepala
// bebas ubah karena open source
// danaputra133
// tutorial pakai ada di: https://youtu.be/P7K5ycatYJA
export default module.exports;
