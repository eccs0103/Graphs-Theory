"use strict";

import { Entity } from "../Scripts/Components/Entity.js";
import { userInterface } from "../Scripts/Components/InterfaceItem.js";
import { canvas, progenitor } from "../Scripts/Components/Node.js";
import { Renderer } from "../Scripts/Components/Utilities.js";
import { Matrix, Point2D } from "../Scripts/Modules/Measures.js";
import { } from "../Scripts/Structure.js";

const { max } = Math;

//#region Verticle tntity
class VerticleEntity extends Entity {
	/**
	 * @param {string} name 
	 */
	constructor(name = ``) {
		super(name);
		this.diameter = 0;

		this.addEventListener(`render`, (event) => {
			Renderer.markArea(this);
		});
	}
	get size() {
		return super.size;
	}
	set size(value) {
		throw new TypeError(`Cannot set property position of #<Verticle> which has only a getter`);
	}
	get diameter() {
		return max(super.size.x, super.size.y);
	}
	set diameter(value) {
		super.size = Point2D.repeat(value);
	}
}
//#endregion
//#region Edge entity
class EdgeEntity extends Entity {

}
//#endregion

const POINT2D_CONSTANT_TWO = Object.freeze(Point2D.repeat(2));

canvas.addEventListener(`pointerdown`, async (event) => {
	const pointPointerBeginPosition = new Point2D(event.clientX, event.clientY)["-"](userInterface.size["/"](POINT2D_CONSTANT_TWO));
	
});

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
