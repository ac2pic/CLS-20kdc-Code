/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

// This file assists mod creation with various tweaks.
const itemAPI = window.itemAPI;

// 0: This bit might be better as a mod of it's own.
ig.Loader.inject({
	stagedLoaderRemainingStages: [],
	finalize: function () {
		// If there's more to do, cause more resource loads & continue.
		if (this.stagedLoaderRemainingStages.length > 0) {
			this.prevResourcesCnt = ig.resources.length;
			ig.resources.length = 0;
			clearInterval(this._intervalId);
			this.stagedLoaderRemainingStages.shift()();
			this.load();
			return;
		}
		this.parent();
	},
	init: function (gameClass) {
		if (gameClass) {
			const mainStage = ig.resources;
			ig.resources = [];
			this.stagedLoaderSetup(mainStage);
			this.parent(gameClass);
		} else {
			this.parent(gameClass);
		}
	},
	stagedLoaderSetup: function (resources) {
			this.stagedLoaderRemainingStages.push(function () {
				for (var i = 0; i < resources.length; i++)
					ig.resources.push(resources[i]);
			});
	}
});

// 1: Handle item database super early & register json templates after it's done starting up. (The 'register JSON templates' part is handled above.)
ig.Loader.inject({
	stagedLoaderSetup: function (resources) {
		ig.resources.splice(resources.indexOf(sc.inventory), 1);
		this.stagedLoaderRemainingStages.push(function () {
			ig.resources.push(sc.inventory);
		});
		this.parent(resources);
	}
});

// 2: More templating. The Database seems to be an exception to templating, and that's a problem for custom items.
ig.Database.inject({
	onload: function (data) {
		data = ig.jsonTemplate.resolve(data);
		return this.parent.apply(this, arguments);
	}
});

// 3: Map templating
ig.Game.inject({
	loadLevel: function (data) {
		data = ig.jsonTemplate.resolve(data);
		return this.parent.apply(this, arguments);
	}
});

// 4: PlayerSkinLibrary from Database
// NOTE: PlayerSkinLibrary is a GameAddon. This means it gets created in Game.init, which is *after* ig.Database is loaded (because it's part of the post-game-creation loading stage)
// This defines the object playerSkins in the Database (which has just been JSON-templatized)
sc.PlayerSkinLibrary.inject({
	init: function () {
		this.parent();
		var psl = ig.database.get("playerSkins");
		if (psl !== void 0)
			for (var k in psl)
				this.registerSkin(k, psl[k]);
	}
});

