/*
 * patch-steps-to-cjs - tool for converting patch-steps-es6 to CJS, simpler than a massive build system
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

const fs = require("fs");

const text = fs.readFileSync("patch-steps-es6.js", "utf8");
fs.writeFileSync('patch-steps-lib.js',`
${text.replace(/export /g, "")}
module.exports = {
	diff: diff,
	patch: patch,
	appliers: appliers,
	photocopy: photocopy,
	photomerge: photomerge,
	defaultSettings: defaultSettings,
	DebugState: DebugState
};`);
