"use strict";

import { progenitor } from "../Scripts/Components/Node.js";
import { Random } from "../Scripts/Modules/Generators.js";
import { } from "../Scripts/Structure.js";

try {
	progenitor.addEventListener(`start`, (event) => {
		// Engine start callback
	});
	progenitor.addEventListener(`update`, (event) => {
		// Frame update callback
	});
} catch (error) {
	await window.stabilize(Error.generate(error));
}
