import {ReallyES6} from './really-es6.js';

if (!ReallyES6)
	throw new Error("CONFORMANCE: Has to really be ES6.");

if (!window.standardizedModsConformanceTest)
	throw new Error("CONFORMANCE: Got run before the dependency, this is not allowed.");

if (!window.ig)
	throw new Error("CONFORMANCE: magic.js is a postload script, ig must exist.");

if (window.ig.modules["dom.ready"].loaded)
	throw new Error("CONFORMANCE: magic.js is a postload script, dom.ready can't be here yet.");

if (window.ig.modules["impact.base.impact"].loaded)
	throw new Error("CONFORMANCE: magic.js is a postload script, the modloader cheated");

// This'll be the mechanism on which the "prestart mod" will be based
ig.module(
	"ccstandardizedmodsconformancetest"
).requires(
	"game.main"
).defines(function () {

const oldIgMain = ig.main;
let confirmedConformance = false;
ig.main = function () {
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
	return oldIgMain.apply(this, arguments);
};

})
