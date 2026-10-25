import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = m => m

handler.before = async function (m) {
  this.ev.on('call', async (call) => {
      if (call[0].status == 'offer') {
        await this.rejectCall(call[0].id, call[0].from);
        await this.updateBlockStatus(call[0].from, "block");
      }
  });
}

module.exports = handler

//admin mohon maaf atas kesalahan kode sebelum nya
export default module.exports;
