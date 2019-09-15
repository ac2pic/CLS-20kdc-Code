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

