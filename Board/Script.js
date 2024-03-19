"use strict";

import { AXIS_FACTOR, CONSTANT_TWO_2D, Entity } from "../Scripts/Components/Entity.js";
import { userInterface } from "../Scripts/Components/InterfaceItem.js";
import { canvas, progenitor } from "../Scripts/Components/Node.js";
import { Renderer } from "../Scripts/Components/Utilities.js";
import { Point2D } from "../Scripts/Modules/Measures.js";
import { } from "../Scripts/Structure.js";

const { min, max, hypot } = Math;

//#region Verticle entity
class VerticleEntity extends Entity {
	/** @type {Set<VerticleEntity>} */
	static #instances = new Set();
	/**
	 * @param {Readonly<Point2D>} position 
	 * @param {VerticleEntity?} exception
	 * @returns {VerticleEntity?}
	 */
	static getVerticleAt(position, exception = null) {
		for (const instance of VerticleEntity.#instances) {
			if (exception === instance) continue;
			const { x: xOther, y: yOther } = instance.globalPosition;
			const { x: xThis, y: yThis } = position;
			if (hypot(xOther - xThis, yOther - yThis) <= instance.diameter / 2) return instance;
		}
		return null;
	}
	/**
	 * @param {string} name 
	 */
	constructor(name = ``) {
		super(name);

		this.addEventListener(`connect`, (event) => {
			VerticleEntity.#instances.add(this);
		});
		this.addEventListener(`disconnect`, (event) => {
			VerticleEntity.#instances.delete(this);
		});

		this.diameter = min(canvas.width, canvas.height) / 16;

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

await window.load(Promise.fulfill(() => { }), 200, 1000);

canvas.addEventListener(`pointerdown`, async (event) => {
	const controller = new AbortController();
	if (event.button !== 0) return;
	const pointPointerBeginPosition = new Point2D(event.clientX, event.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
	const verticleAlreadyExist = VerticleEntity.getVerticleAt(pointPointerBeginPosition);
	await (/** @type {Promise<void>} */ (new Promise((resolve) => {
		if (verticleAlreadyExist === null) {
			//#region New instance
			window.addEventListener(`pointerup`, (event2) => {
				if (event2.button !== 0) return;
				const pointPointerEndPosition = new Point2D(event2.clientX, event2.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
				if (VerticleEntity.getVerticleAt(pointPointerEndPosition) !== null) return;
				const verticleNewInstance = new VerticleEntity(`Verticle`);
				verticleNewInstance.globalPosition = pointPointerEndPosition;
				progenitor.children.add(verticleNewInstance);
				resolve();
			}, { signal: controller.signal });
			//#endregion
		} else {
			//#region Already exist
			const pointInitialPosition = verticleAlreadyExist.globalPosition;
			window.addEventListener(`pointerup`, (event2) => {
				const pointCurrentPosition = verticleAlreadyExist.globalPosition;
				if (hypot(pointInitialPosition.x - pointCurrentPosition.x, pointInitialPosition.y - pointCurrentPosition.y) < 1) {
					progenitor.children.remove(verticleAlreadyExist);
				} else if (VerticleEntity.getVerticleAt(verticleAlreadyExist.globalPosition, verticleAlreadyExist) !== null) {
					verticleAlreadyExist.globalPosition = pointInitialPosition;
				}
				resolve();
			}, { signal: controller.signal });
			window.addEventListener(`pointermove`, (event2) => {
				const pointPointerDragPosition = new Point2D(event2.clientX, event2.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
				verticleAlreadyExist.globalPosition = pointPointerDragPosition;
			}, { signal: controller.signal });
			//#endregion
		}
	})));
	controller.abort();
});
