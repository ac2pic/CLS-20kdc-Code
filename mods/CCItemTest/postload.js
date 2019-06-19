/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

registerPrestart(function () {
	// You may be wondering why I'm handling this patch this way.
	// The answer is because patch steps isn't agreed-upon yet.
	sc.Inventory.inject({
		onload: function (a) {
			a["items"].push({
				"name": {
					"en_US": "Red Key",
					"langUid": 13371337
				},
				"description": {
					"en_US": "Looks like a chip of some sort.",
					"langUid": 13371337
				},
				"type": "KEY",
				"rarity": 0,
				"level": 1,
				"icon": "item-key",
				"order": 0,
				"noTrack": true,
				"customItem": "CCItemTest-RedKey"
			}, {
				"name": {
					"en_US": "Green Key",
					"langUid": 13371337
				},
				"description": {
					"en_US": "Seems edible!",
					"langUid": 13371337
				},
				"type": "CONS",
				"rarity": 0,
				"level": 1,
				"icon": "item-items",
				"time": 0,
				"stats": [
					"HEAL-4"
				],
				"effect": {
					"sheet": "drops",
					"name": "healing"
				},
				"useSpeed": 2,
				"order": 0,
				"noTrack": true,
				"customItem": "CCItemTest-GreenKey"
			}, {
				"name": {
					"en_US": "Blue Key",
					"langUid": 13371337
				},
				"description": {
					"en_US": "Looks wearable.",
					"langUid": 13371337
				},
				"type": "EQUIP",
				"equipType": "HEAD",
				"params": {
					"hp": 9000,
					"attack": 9000,
					"defense": 9000,
					"focus": 9000
				},
				"properties": {
				},
				"rarity": 0,
				"level": 1,
				"icon": "item-helm",
				"order": 0,
				"noTrack": true,
				"customItem": "CCItemTest-BlueKey"
			});
			this.parent(a);
		}
	});
	console.log("To give yourself the Red Key, use sc.model.player.addItem(itemAPI.customItemToId[\"CCItemTest-RedKey\"], 1)");
	console.log("To remove the Red Key, use sc.model.player.removeItem(itemAPI.customItemToId[\"CCItemTest-RedKey\"], 1)");
});

