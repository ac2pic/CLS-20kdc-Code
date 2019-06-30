/*
 * CCMenuAPI - API for cross-modloader menu button adding
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

for (var i = 0; i < 25; i++) {
	window.mainMenuAPI.buttons.push({
		text: "Test button " + i,
		runnable: () => {
			alert("*pets Lea cutely*");
		}
	});
}
