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
const schedule = require('node-schedule');


const sendDatabaseToGroup = async (conn, groupJid) => {
    try {
        const filePath = path.resolve('./database.json'); 
        if (!fs.existsSync(filePath)) {
            console.error('File database.json tidak ditemukan!');
            return;
        }

        const fileBuffer = fs.readFileSync(filePath); 
        await conn.sendMessage(
            groupJid,
            {
                document: fileBuffer,
                mimetype: 'application/json',
                fileName: 'database.json',
            }
        );
        console.log(`Database berhasil dikirim ke grup: ${groupJid}`);
    } catch (err) {
        console.error('Error saat mengirim file database:', err);
    }
};
const scheduleSendDatabase = (conn, groupJid) => {
    schedule.scheduleJob('00 22 * * *', async () => {   
        // 00 22 * * * artinya backup setiap jam 22:00
        // 00 -> menit 22 -> jam
        console.log('Memulai pengiriman database pada jam 22:00...');
        try {
            await sendDatabaseToGroup(conn, groupJid); 
        } catch (err) {
            console.error('Terjadi kesalahan saat mengirim:', err);
        }
    });
};

const groupJid = '120363216901617825@g.us'; //di ganti dengan Jid grub kamu! di dapat dari (=> m)

if (global.conn) {
    scheduleSendDatabase(global.conn, groupJid);
} else {
    console.error('Koneksi ke grup belum ada!');
}

module.exports = {};
export default module.exports;
