ig.module(
	'impact.feature.patches.patch'
)
.requires(
	'impact.base.steps'
)
.defines(function() {

// -- The PATCH_STEP base (library) --
// start: function (stepData, success, error)
// where stepData contains stack: and object:
// The Patch Step Interpreter does not support run at this time, it's the wrong 'model'
ig.PatchStepBase = ig.StepBase;
ig.PATCH_STEP = {};
ig.PatchHelpers = {
	executePatchSteps: function (patchData, targetObject, success, error) {
		var stepData = {};
		stepData.stack = [];
		stepData.object = targetObject;
		function advance(step) {
			if (step) {
				step.start(stepData, function () {
					advance(step.getNext(stepData));
				}, error);
			} else {
				success();
			}
		}
		advance(ig.StepHelpers.constructSteps(patchData, ig.PATCH_STEP, {}));
	}
};

// -- The ig part (implementation) --

// Object mapping filenames to arrays of patch files.
ig.filePatches = {};

// Nasty, but necessary right now.
// This would preferably be done in some other way (ig.SingleJsonLoadable = ig.SingleLoadable.extend for example would heavily reduce the amount of functions needing alteration)
// For now, this works.
var oldAjax = $.ajax;
$.ajax = function () {
	var settings = arguments[0];
	var url;
	if (arguments.length > 1) {
		settings = arguments[1];
		url = arguments[0] || settings.url;
	} else {
		url = settings.url;
	}
	if ((settings.dataType == "json") && (url in ig.filePatches)) {
		for (var i = 0; i < ig.filePatches[url].length; i++) {
			var patchURL = ig.filePatches[url][i];
			var oldSuccess = settings.success || function () {};
			function errorCallback() {
				console.error("Encountered error getting patch file:", arguments);
				return settings.error.apply(settings.context, arguments);
			}
			settings.success = function (fileObj, oB, oC) {
				$.ajax({
					dataType: "json",
					url: patchURL,
					success: function (patchObj) {
						ig.PatchHelpers.executePatchSteps(patchObj, fileObj, function () {
							return oldSuccess.call(settings.context, fileObj, oB, oC);
						}, errorCallback);
					},
					error: errorCallback
				});
			};
		}
	}
	return oldAjax.apply($, arguments);
};

});

