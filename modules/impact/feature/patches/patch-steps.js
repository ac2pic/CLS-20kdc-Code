ig.module(
	'impact.feature.patches.patch-steps'
)
.requires(
	'impact.feature.patches.patch'
)
.defines(function() {

ig.PATCH_STEP["ENTER"] = ig.PatchStepBase.extend({
	index: null,
	_wm: new ig.Config({
		attributes: {
			"index": {
				_type: "String",
				_info: "The index to enter."
			}
		},
	}),
	init: function (data) {
		assertContent(data, "index");
		this.index = data["index"];
	},
	start: function (stepData, success, error) {
		stepData.stack.push(stepData.object);
		stepData.object = stepData.object[this.index];
		success();
	}
});

ig.PATCH_STEP["EXIT"] = ig.PatchStepBase.extend({
	_wm: new ig.Config({
		attributes: {
		}
	}),
	init: function (data) {
	},
	start: function (stepData, success, error) {
		stepData.object = stepData.stack.pop();
		success();
	}
});

ig.PATCH_STEP["SET_KEY"] = ig.PatchStepBase.extend({
	index: null,
	content: void 0,
	_wm: new ig.Config({
		attributes: {
			"index": {
				_type: "String",
				_info: "The index to set."
			},
			"content": {
				_type: "Object", // Need to work out what this has to be. I don't have Cubic Weltmeister information and impact.js is not helpful.
				_optional: true,
				_info: "The value to put at the index. If not supplied, the index is deleted."
			}
		},
	}),
	init: function (data) {
		assertContent(data, "index");
		this.index = data["index"];
		this.content = data["content"];
	},
	start: function (stepData, success, error) {
		if (this.content === void 0) {
			delete stepData.object[this.index];
		} else {
			stepData.object[this.index] = ig.copy(this.content);
		}
		success();
	}
});

ig.PATCH_STEP["REMOVE_ARRAY_ELEMENT"] = ig.PatchStepBase.extend({
	index: null,
	_wm: new ig.Config({
		attributes: {
			"index": {
				_type: "Number",
				_info: "The index to remove. Negative values specify the position from the end of the array."
			}
		},
	}),
	init: function (data) {
		assertContent(data, "index");
		this.index = data["index"];
	},
	start: function (stepData, success, error) {
		stepData.object.splice(this.index, 1);
		success();
	}
});

ig.PATCH_STEP["ADD_ARRAY_ELEMENT"] = ig.PatchStepBase.extend({
	index: null,
	content: null,
	_wm: new ig.Config({
		attributes: {
			"index": {
				_type: "Number",
				_optional: true,
				_info: "The index to insert the element at. Negative values specify the position from the end of the array. If not specified, adds to the end."
			},
			"content": {
				_type: "Object", // Need to work out what this has to be. I don't have Cubic Weltmeister information and impact.js is not helpful.
				_info: "The data for the new array element."
			}
		},
	}),
	init: function (data) {
		assertContent(data, "content");
		this.index = data["index"];
		this.content = data["content"];
	},
	start: function (stepData, success, error) {
		if (this.index === void 0) {
			stepData.object.push(ig.copy(this.content));
		} else {
			stepData.object.splice(this.index, 0, ig.copy(this.content));
		}
		success();
	}
});

ig.PATCH_STEP["IMPORT"] = ig.PatchStepBase.extend({
	index: null,
	src: null,
	_wm: new ig.Config({
		attributes: {
			"index": {
				_type: "String",
				_optional: true,
				_info: "The index to set. If not provided, the import happens 'in-place', *additively*"
			},
			"src": {
				_type: "String",
				_info: "The filename, such as data/my-mod-test-cev.json"
			},
			"path": {
				_type: "String[]",
				_optional: true,
				_info: "If present, a trail of keys to follow inside the file before treating that as 'the file'."
			}
		},
	}),
	init: function (data) {
		assertContent(data, "src");
		this.index = data["index"];
		this.src = data["src"];
		this.path = data["path"];
	},
	start: function (stepData, success, error) {
		$.ajax({
			dataType: "json",
			context: this,
			url: ig.getFilePath(ig.root + this.src),
			success: function (data) {
				if (this.path !== void 0)
					for (var i = 0; i < this.path.length; i++)
						data = data[this.path[i]];
				if (this.index !== void 0) {
					stepData.object[this.index] = ig.copy(data);
				} else if (stepData.object.constructor == Array) {
					for (var i = 0; i < data.length; i++)
						stepData.object.push(ig.copy(data[i]));
				} else {
					for (var k in data)
						stepData.object[k] = ig.copy(data[k]);
				}
				success();
			},
			error: error
		});
	}
});

});

