/*
 * patch-steps-to-cjs - tool for converting patch-steps-es6 to CJS, simpler than a massive build system
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

const fs = require("fs");

const text = fs.readFileSync("patch-steps-es6.js", "utf8");
console.log(text.replace(/export /g, ""));
console.log("module.exports = {");
console.log("\tdiff: diff,");
console.log("\tpatch: patch,");
console.log("\tappliers: appliers,");
console.log("\tphotocopy: photocopy,");
console.log("\tphotomerge: photomerge,");
console.log("\tdefaultSettings: defaultSettings");
console.log("};");
