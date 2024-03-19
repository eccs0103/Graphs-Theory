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

window.load(Promise.fulfill(() => {
	canvas.addEventListener(`pointerdown`, async (event) => {
		const controller = new AbortController();
		if (event.button !== 0) return;
		const pointPointerBeginPosition = new Point2D(event.clientX, event.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
		const verticleAlreadyPlaced = VerticleEntity.getVerticleAt(pointPointerBeginPosition);
		await (/** @type {Promise<void>} */ (new Promise((resolve) => {
			if (verticleAlreadyPlaced === null) {
				window.addEventListener(`pointerup`, (event2) => {
					if (event2.button !== 0) return;
					const pointPointerEndPosition = new Point2D(event2.clientX, event2.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
					if (VerticleEntity.getVerticleAt(pointPointerEndPosition) !== null) return;
					const verticleNew = new VerticleEntity(`Verticle`);
					progenitor.children.add(verticleNew);
					verticleNew.diameter = min(canvas.width, canvas.height) / 16;
					verticleNew.globalPosition = pointPointerEndPosition;
					resolve();
				}, { signal: controller.signal });
			} else {
				let positionInitial = verticleAlreadyPlaced.globalPosition.clone();
				window.addEventListener(`pointermove`, (event2) => {
					const pointPointerDragPosition = new Point2D(event2.clientX, event2.clientY)["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR);
					verticleAlreadyPlaced.globalPosition = pointPointerDragPosition;
				}, { signal: controller.signal });
				window.addEventListener(`pointerup`, (event2) => {
					if (verticleAlreadyPlaced.globalPosition === positionInitial) {
						progenitor.children.remove(verticleAlreadyPlaced);
					} else if (VerticleEntity.getVerticleAt(verticleAlreadyPlaced.globalPosition, verticleAlreadyPlaced) !== null) {
						verticleAlreadyPlaced.globalPosition = positionInitial;
					}
					resolve();
				}, { signal: controller.signal });
			}
		})));
		controller.abort();
	});
}), 200, 1000);
