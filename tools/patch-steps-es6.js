/*
 * patch-steps-lib - Library for the Patch Steps spec.
 *
 * Written starting in 2019.
 * Version: 1.0.2
 * (Ideally, this would comply with semver.)
 * Credits:
 *  Main code by 20kdc
 *  URL-style file paths, bughunting by ac2pic
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

export const defaultSettings = {
	arrayTrulyDifferentThreshold: 0.5,
	trulyDifferentThreshold: 0.5,
	arrayLookahead: 8,
	diffAddNewKey: 0,
	diffAddDelKey: 1,
	diffMulSameKey: 0.75
};

/**
 * A generic merge function.
 * NOTE: This should match Patch Steps specification, specifically how IMPORT merging works.
 * @param {any} a The value to merge into.
 * @param {any} b The value to merge from.
 * @returns {any} a
 */
export function photomerge(a, b) {
	if (b.constructor === Object) {
		for (let k in b)
			a[photocopy(k)] = photocopy(b[k]);
	} else if (b.constructor == Array) {
		for (let i = 0; i < b.length; i++)
			a.push(photocopy(b[i]));
	} else {
		throw new Error("We can't do that! ...Who'd clean up the mess?");
	}
	return a;
}

/**
 * A generic copy function.
 * @param {any} a The value to copy.
 * @returns {any} copied value
 */
export function photocopy(o) {
	if (o === void 0)
		return o;
	if (o.constructor === Array)
		return photomerge([], o);
	if (o.constructor === Object)
		return photomerge({}, o);
	return o;
}

/**
 * A difference heuristic.
 * @param {any} a The first value to check.
 * @param {any} b The second value to check.
 * @param {any} settings The involved control settings.
 * @returns {number} A difference value from 0 (same) to 1 (different).
 */
function diffHeuristic(a, b, settings) {
	if ((a === null) && (b === null))
		return 0;
	if ((a === null) || (b === null))
		return null;
	if (a.constructor !== b.constructor)
		return 1;

	if (a.constructor === Array) {
		let array = diffArrayHeuristic(a, b, settings);
		if (array.length == 0)
			return 0;
		let changes = 0;
		let ai = 0;
		let bi = 0;
		for (let i = 0; i < array.length; i++) {
			if (array[i] == "POPA") {
				changes++;
				ai++;
			} else if (array[i] == "INSERT") {
				// Doesn't count
				bi++;
			} else if (array[i] == "PATCH") {
				changes += diffHeuristic(a[ai], b[bi], settings);
				ai++;
				bi++;
			}
		}
		return changes / array.length;
	} else if (a.constructor === Object) {
		let total = [];
		for (let k in a)
			total.push(k);
		for (let k in b)
			if (!(k in a))
				total.push(k);
		let change = 0;
		for (let i = 0; i < total.length; i++) {
			if ((total[i] in a) && !(total[i] in b)) {
				change += settings.diffAddNewKey;
			} else if ((total[i] in b) && !(total[i] in a)) {
				change += settings.diffAddDelKey;
			} else {
				change += diffHeuristic(a[total[i]], b[total[i]], settings) * settings.diffMulSameKey;
			}
		}
		if (total.length != 0)
			return change / total.length;
		return 0;
	} else {
		return a == b ? 0 : 1;
	}
}

/*
 * This is the array heuristic. It's read by the main heuristic and the diff heuristic.
 * The results are a series of operations on an abstract machine building the new array.
 * These results are guaranteed to produce correct results, but aren't guaranteed to produce optimal results.
 * The abstract machine has two input stacks (for a/b), first element at the top.
 * The operations are:
 * "POPA": Pops an element from A, discarding it.
 * "INSERT": Pops an element from B, copying and inserting it verbatim.
 * "PATCH": Pops an element from both A & B, creating a patch from A to B.
 * Valid output from this must always exhaust the A and B stacks and must not stack underflow.
 * Programs that follow that will always generate valid output, as the only way to exhaust the B stack
 *  is to use INSERT and PATCH, both of which output to the resulting array.
 *
 * The actual implementation is different to this description, but follows the same rules.
 * Stack A and the output are the same.
 */
function diffArrayHeuristic(a, b, settings) {
	const lookahead = settings.arrayLookahead;
	let sublog = [];
	let ia = 0;
	for (let i = 0; i < b.length; i++) {
		let validDif = 2;
		let validSrc = null;
		for (let j = ia; j < Math.min(ia + lookahead, a.length); j++) {
			let dif = diffHeuristic(a[j], b[i], settings);
			if (dif < validDif) {
				validDif = dif;
				validSrc = j;
			}
		}
		if (validDif > settings.arrayTrulyDifferentThreshold)
			validSrc = null;
		if (validSrc != null) {
			while (ia < validSrc) {
				sublog.push("POPA");
				ia++;
			}
			sublog.push("PATCH");
			ia++;
		} else {
			if (ia == a.length) {
				sublog.push("INSERT");
			} else {
				sublog.push("PATCH");
				ia++;
			}
		}
	}
	while (ia < a.length) {
		sublog.push("POPA");
		ia++;
	}
	return sublog;
}

/**
 * Diffs two objects
 * 
 * @param {any} a The original value
 * @param {any} b The target value
 * @param {object} [settings] Optional bunch of settings. May include "comment".
 * @return {object[]|null} Null if unpatchable (this'll never occur for two Objects or two Arrays), Array of JSON-ready Patch Steps otherwise
 */
export function diff(a, b, settings) {
	let trueSettings = photocopy(defaultSettings);
	if (settings !== void 0)
		photomerge(trueSettings, settings);
	return diffInterior(a, b, trueSettings);
}

function diffCommentExpansion(a, b, element, settings) {
	let bkcomment = settings.comment;
	if (settings.comment !== void 0)
		settings.comment = settings.comment + "." + element;
	let log = diffInterior(a, b, settings);
	settings.comment = bkcomment;
	return log;
}

function diffInterior(a, b, settings) {
	if ((a === null) && (b === null))
		return [];
	if ((a === null) || (b === null))
		return null;
	if (a.constructor !== b.constructor)
		return null;
	let log = [];

	if (a.constructor === Array) {
		let array = diffArrayHeuristic(a, b, settings);
		let ai = 0;
		let bi = 0;
		// Advancing ai/bi pops from the respective stack.
		// Since outputting an element always involves popping from B,
		//  and vice versa, the 'b' stack position is also the live array position.
		// At patch time, a[ai + x] for arbitrary 'x' is in the live array at [bi + x]
		for (let i = 0; i < array.length; i++) {
			if (array[i] == "POPA") {
				log.push({"type": "REMOVE_ARRAY_ELEMENT", "index": bi, "comment": settings.comment});
				ai++;
			} else if (array[i] == "INSERT") {
				let insertion = {"type": "ADD_ARRAY_ELEMENT", "index": bi, "content": photocopy(b[bi]), "comment": settings.comment};
				// Is this a set of elements being inserted at the end?
				let j;
				for (j = i + 1; j < array.length; j++)
					if ((array[j] != "INSERT") && (array[j] != "POPA"))
						break;
				// If it is a set of elements being inserted at the end, they are appended
				if (j == array.length)
					delete insertion["index"];
				log.push(insertion);
				bi++;
			} else if (array[i] == "PATCH") {
				let xd = diffCommentExpansion(a[ai], b[bi], bi, settings);
				if (xd != null) {
					if (xd.length != 0) {
						log.push({"type": "ENTER", "index": bi});
						log = log.concat(xd);
						log.push({"type": "EXIT"});
					}
				} else {
					log.push({"type": "SET_KEY", "index": bi, "content": photocopy(b[bi]), "comment": settings.comment});
				}
				ai++;
				bi++;
			}
		}
	} else if (a.constructor === Object) {
		for (let k in a) {
			if (k in b) {
				if (diffHeuristic(a[k], b[k], settings) >= settings.trulyDifferentThreshold) {
					log.push({"type": "SET_KEY", "index": k, "content": photocopy(b[k]), "comment": settings.comment});
				} else {
					let xd = diffCommentExpansion(a[k], b[k], k, settings);
					if (xd != null) {
						if (xd.length != 0) {
							log.push({"type": "ENTER", "index": k});
							log = log.concat(xd);
							log.push({"type": "EXIT"});
						}
					} else {
						// should it happen? probably not. will it happen? maybe
						log.push({"type": "SET_KEY", "index": k, "content": photocopy(b[k]), "comment": settings.comment});
					}
				}
			} else {
				log.push({"type": "SET_KEY", "index": k, "comment": settings.comment});
			}
		}
		for (let k in b)
			if (!(k in a))
				log.push({"type": "SET_KEY", "index": k, "content": photocopy(b[k]), "comment": settings.comment});
	} else if (a != b) {
		return null;
	}
	return log;
}

// Custom extensions are registered here.
// Their 'this' is the Step, they are passed the state, and they are expected to return a Promise.
// In practice this is done with async old-style functions.
export const appliers = {};

/*
 * @param {any} a The object to modify
 * @param {object|object[]} steps The patch, fresh from the JSON. Can be in legacy or Patch Steps format.
 * @param {(fromGame: boolean, url: string) => Promise<any>} loader The loading function. If fromGame is true, the file is from the game (see IMPORT). If fromGame is not true, the file is from the mod (see INCLUDE).
 * @return {Promise<void>} A Promise
 */
export async function patch(a, steps, loader) {
	if (steps.constructor === Object) {
		// Standardized Mods specification
		for (let k in steps) {
			// Switched back to a literal translation in 1.0.2 to make it make sense with spec, it's more awkward but simpler.
			// ac2pic thought up the "check for truthy" regarding steps[k].constructor
			if (a[k] === void 0) {
				a[k] = steps[k]; // 1.
			} else if (steps[k] && (steps[k].constructor === Object)) {
				// steps[k] is Object, so this won't escape the Standardized Mods version of patching
				await patch(a[k], steps[k], loader); // 2.
			} else {
				a[k] = steps[k]; // 3.
			}
		}
		return;
	}
	const state = {
		currentValue: a,
		stack: [],
		cloneMap: new Map(),
		callStack: ["BASE"],
		loader: loader
	};
	for (let index = 0; index < steps.length; index++) {
		try {
			state.callStack.push(index);
			await applyStep(steps[index], state);
			state.callStack.pop();			
		} catch(e) {
			printError(state.callStack, e.message);
			console.error(e);
			return;
		}
	}
}

function printError(stack, errorMessage) {
	let message = errorMessage + '\n';
	if (stack.length%2 === 1) {
		message += `\t\t\tin ${stack.pop()}\n`;
	}
	while(stack.length > 0) {
		const stepIndex = stack.pop();
		const stepName = stack.pop();
		message += `\t\t\tat ${stepName} (step: ${stepIndex})\n`;
	}
	console.log(message);	
}

async function applyStep(step, state) {
	state.callStack.push(step["type"]);
	if (!appliers[step["type"]]) {
		state.callStack.pop();
		throw TypeError(`Error: ${step['type']} is not a valid type.`);
	}
	await appliers[step["type"]].call(step, state);
	state.callStack.pop();
}

/**
 * @param {object} obj The object to search and replace the values of
 * @param {RegExp| {[replacementId: string]: RegExp}} keyword The expression to match against
 * @param {String| {[replacementId]: string | number}} value The value the replace the match
 * @returns {void}
 * */ 
function valueInsertion(obj, keyword, value) {
	if (typeof obj === "string") {
		// search for all instances of value and replace it 
		let oldValue = obj[key];
		
		// It's more complex than we thought.
		if (!Array.isArray(keyword) && typeof keyword === "object") {
			// go through each and check if it matches anywhere.
			for(const property in keyword) {
				if (keyword[property]) {
					obj[key] = oldValue.replace(new RegExp(keyword[property], "g"), value[property] || "");
					oldValue = obj[key];
				}
			}
		} else {
			obj[key] = oldValue.replace(new RegExp(keyword, "g"), value); 
		}
	} else if (Array.isArray(obj)) {
		for (const child of obj[key]) {
			valueInsertion(child, keyword, value);
		}
	} else if (typeof obj === "object") {
		for(let key in obj) {
			if (obj[key].constructor === Object) {
				valueInsertion(obj[key], value);
			}
		}	
	}
}

// -- Step Execution --


appliers["FOR_IN"] = async function (state) {
	const body = this["body"];
	const values = this["values"];
	const keyword = this["keyword"];

	if (!Array.isArray(body)) {
		throw Error('Error: body must be an array.');
	}

	if (!values) {
		throw Error('Error: values must be set.');
	}

	if (!keyword) {
		throw Error('Error: keyword must be set.');
	}

	for(let i = 0; i < values.length; i++) {
		for (index = 0; index < body.length; index++) {
			const statement = body[index];
			state.callStack.push(index);
			const value = values[i];
			const type = statement["type"];
			const clone = photocopy(statement);
			
			valueInsertion(clone, keyword, value);
			// to preserve type of statement
			clone.type = type;
			
			await applyStep(clone, state);
			state.callStack.pop();
			
		}
	}
};

// copy the value with name
appliers["COPY"] = async function(state) {
	if (!this["alias"]) {
		throw Error("Error: COPY requires 'alias'");
	}
	const value = photocopy(state.currentValue);
	state.cloneMap.set(this["alias"], value);
};

// paste
appliers["PASTE"] = async function(state) {
	if (!this["alias"]) {
		throw Error("Error: PASTE requires 'alias'");
	}
	const value = photocopy(state.cloneMap.get(this["alias"]));
	if (Array.isArray(state.currentValue)) {
		const obj = {
			type: "ADD_ARRAY_ELEMENT",
			content: value
		};
		
		if (!isNaN(this["index"])) {
			obj.index = this["index"];
		}
		await applyStep(obj, state);		
		
	} else if (typeof state.currentValue === "object") {
		await applyStep({
			type: "SET_KEY",
			index: this["index"],
			content: value
		}, state);
	} else {
		throw `Error: Could not PASTE. Type ${typeof state.currentValue} is not supported.`;
	}
};


appliers["COMMENT"] = async function(state) {
	console.log(this["value"]);
};

appliers["ENTER"] = async function (state) {
	if (!this["index"]) {
		throw Error(`Error: Could not ENTER. Property index must be set.`);
	}

	let path = [this["index"]];
	if (this["index"].constructor == Array)
		path = this["index"];
	for (let i = 0; i < path.length;i++) {
		const idx = path[i];
		state.stack.push(state.currentValue);
		if (state.currentValue[idx] === undefined) {
			const subArr = path.slice(0, idx + 1);
			throw Error(`Error: index sequence ${subArr.join(",")} leads to an undefined state.`);
		}
		
		state.currentValue = state.currentValue[idx];
		
	}
};

appliers["EXIT"] = async function (state) {
	let count = 1;
	if ("count" in this)
		count = this["count"];
	for (let i = 0; i < count; i++) {
		if (state.stack.length === 0) {
			throw Error(`Error: EXIT #${count + 1} leads to an undefined state.`);
		}
		state.currentValue = state.stack.pop();
	}
		
};

appliers["SET_KEY"] = async function (state) {
	if (!this["index"]) {
		throw Error('Error: index must be set.');
	}

	if ("content" in this) {
		state.currentValue[this["index"]] = photocopy(this["content"]);
	} else {
		delete state.currentValue[this["index"]];
	}
};

appliers["REMOVE_ARRAY_ELEMENT"] = async function (state) {
	const index = this["index"]%1;
	if (isNaN(index)) {
		throw Error('Error: index must be a finite number.');
	}

	state.currentValue.splice(index, 1);
};

appliers["ADD_ARRAY_ELEMENT"] = async function (state) {
	if ("index" in this) {
		const index = this["index"]%1;
		if (isNaN(index)) {
			throw Error('Error: index must be a finite number.');
		}

		state.currentValue.splice(index, 0, photocopy(this["content"]));
	} else {
		state.currentValue.push(photocopy(this["content"]));
	}
};

function resolveUrl(url, opts = {}) {
	const config = Object.assign({
		fromGame: false,
		url
	}, opts);

	try {
		const decomposedUrl = new URL(url);
		const protocol = decomposedUrl.protocol;
		config.url = decomposedUrl.pathname;
		
		if (protocol === 'mod:') {
			config.fromGame = false;
		} else if (protocol === 'game:') {
			config.fromGame = true;
		}
	} catch (e) {}

	return config;
}

appliers["IMPORT"] = async function (state) {
	if (!this["src"]) {
		throw Error('Error: src must be set.');
	}

	const {fromGame, url} = resolveUrl(this["src"], {
		fromGame: true
	});
	
	let obj = await state.loader(fromGame, url);

	if ("path" in this) {
		if (!Array.isArray(this["path"])) {
			throw Error('Error: path must be an array.');
		}
		for (let i = 0; i < this["path"].length; i++)
			obj = obj[this["path"][i]];
	}
	
	if ("index" in this) {
		state.currentValue[this["index"]] = photocopy(obj);
	} else {
		photomerge(state.currentValue, obj);
	}
};

appliers["INCLUDE"] = async function (state) {
	if (!this["src"]) {
		throw Error('Error: src must be set.');
	}

	const {fromGame, url} = resolveUrl(this["src"], {
		fromGame: false
	});

	const includedSteps = await state.loader(fromGame, url);
	await patch(state.currentValue, includedSteps, state.loader);
};

appliers["INIT_KEY"] = async function (state) {
	if (!this["index"]) {
		throw Error('Error: index must be set.');
	}

	if (!(this["index"] in state.currentValue))
		state.currentValue[this["index"]] = photocopy(this["content"]);
};

