import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = m => m;

handler.before = async function (m) {
    let user = db.data.users[m.sender];
    if (user.premiumTime > 0 && new Date() - user.premiumTime > 0) {
        user.premiumTime = 0;
        user.premium = false;
    }
};

module.exports = handler;
export default module.exports;
