"use strict";

import { engine, progenitor } from "./Node.js";
import { Renderer } from "./Utilities.js";

progenitor.addEventListener(`update`, (event) => {
	Renderer.clear();
	progenitor.dispatchEvent(new Event(`render`, { bubbles: true }));
});
window.dispatchEvent(new UIEvent(`resize`));
engine.launched = true;

export { };