/*
 * proposal-stage1 - Cross-Modloader standards for CrossCode modding, as Cubic Impact modules
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

var fs = require("fs");
var process = require("process");
var psl = require("./patch-steps-lib.js");

var cmd = process.argv[2];

if (cmd === "diff") {
	var ja = JSON.parse(fs.readFileSync(process.argv[3]));
	var jb = JSON.parse(fs.readFileSync(process.argv[4]));
	var comment;
	if (process.argv.length >= 6)
		comment = process.argv[5];
	console.log(JSON.stringify(psl.diff(ja, jb, {comment: comment})));
} else if (cmd === "patch") {
	var ja = JSON.parse(fs.readFileSync(process.argv[3]));
	var jp = JSON.parse(fs.readFileSync(process.argv[4]));
	psl.patch(ja, jp, function (inc, url, success, failure) {
		fs.readFile(url, function (err, data) {
			if (err) {
				failure(err);
			} else {
				success(JSON.parse(data));
			}
		});
	}, function () {
		console.log(JSON.stringify(ja));
	}, function (err) {
		throw err;
	});
} else {
	console.log("node difftool.js diff A B [comment]");
	console.log("node difftool.js patch A P");
}
