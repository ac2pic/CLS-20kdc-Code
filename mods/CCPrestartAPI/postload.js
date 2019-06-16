/*
 * CCPrestartAPI - API for cross-modloader registration of prestart-phase functions
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

const prestart = [];

// Call order is preserved. Thus, dependency order is preserved.
window.registerPrestart = (fn) => {
	prestart.push(fn);
};

ig.module("__prestart_registry_internal_module__").requires("game.main").defines(function () {
	const oldIgMain = ig.main;
	ig.main = function () {
		for (var i = 0; i < prestart.length; i++)
			prestart[i]();
		prestart.length = 0;
		delete window.registerPrestart;
		return oldIgMain.apply(this, arguments);
	};
});
