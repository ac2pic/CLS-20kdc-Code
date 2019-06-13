// More magic...
// Not an ES6 module, this tests the '"module": false' side of things
window.standardizedModsConformanceTest = {
	moreMagic: true
};
// Will fail if ES6 (strict mode is on!). Deliberate.
standardizedModsConformanceTestMoreMagic = window.standardizedModsConformanceTest;
