import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
var {
	format
} = require("util");
var {
	Image
} = require("node-webpmux");

var handler = async (m) => {
	if (!m.quoted) return m.reply('Tag stiker nya!')
	if (/sticker/.test(m.quoted.mtype)) {
		var gambar = new Image()
		await gambar.load(await m.quoted.download())
		m.reply(format(JSON.parse(gambar.exif.slice(22).toString())))
	}
};
handler.command = handler.help = ['getexif'];
handler.tags = ['sticker'];
module.exports = handler;

export default module.exports;
