import {ReallyES6} from './really-es6.js';

if (!ReallyES6)
	throw new Error("CONFORMANCE: Has to really be ES6.");

let confirmedConformance = false;

// It's not strictly specified how this works, though $.ajax is standard and we *may* want to make that mandatory

const HugControlDatabase = ig.JsonLoadable.extend({
	cacheType: "ConformanceHugControlDatabase",
	init: function (a) {
		this.parent(a);
	},
	getJsonPath: function () {
		return ig.root + this.path.toPath("data/", ".json") + ig.getCacheSuffix();
	},
	onload: function (n) {
		const expected = "{\"yqt\":[1282764385,1517908072],\"nqt\":[1098019433],\"null\":null}";
		if (JSON.stringify(n) != expected)
			throw new Error("CONFORMANCE: Patch applied incorrectly or JSON indeterminism happened?");
		console.log("Loaded hug control database, ready to hug people");
	}
});

window.conformanceHugControlDatabase = new HugControlDatabase("conformance-hug-control-database");

// Show an image to prove we can

const image = new ig.Image("media/conformance-asset.png");
sc.TitleScreenButtonGui.inject({
	updateDrawables: function (displayList) {
		this.parent(displayList);
		displayList.addGfx(image, 0, 0, 0, 0, 256, 256);
		if (!confirmedConformance) {
			confirmedConformance = true;
			console.log("Conformance testing complete and successful. If you don't see this, the modloader failed.");
		}
	}
});

