"use strict";

import { AXIS_FACTOR, CONSTANT_TWO_2D, Entity } from "../Scripts/Components/Entity.js";
import { userInterface } from "../Scripts/Components/InterfaceItem.js";
import { canvas, context, engine, progenitor } from "../Scripts/Components/Node.js";
import { Renderer } from "../Scripts/Components/Utilities.js";
import { Point2D } from "../Scripts/Modules/Measures.js";

const { min, max, hypot, PI } = Math;

//#region Definition
const inputVerticeTool = document.getElement(HTMLInputElement, `input#vertice-tool`);
const inputEdgeTool = document.getElement(HTMLInputElement, `input#edge-tool`);
const buttonCaptureCanvas = document.getElement(HTMLButtonElement, `button#capture-canvas`);
//#endregion

//#region Vertice entity
class VerticeEntity extends Entity {
	/** @type {Set<VerticeEntity>} */
	static #instances = new Set();
	/**
	 * @param {Readonly<Point2D>} position 
	 * @param {VerticeEntity?} exception
	 * @returns {VerticeEntity?}
	 */
	static getVerticeAt(position, exception = null) {
		for (const instance of VerticeEntity.#instances) {
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
			VerticeEntity.#instances.add(this);
		});
		this.addEventListener(`disconnect`, (event) => {
			VerticeEntity.#instances.delete(this);
		});

		this.diameter = min(canvas.width, canvas.height) / 16;

		this.addEventListener(`render`, (event) => {
			context.save();
			context.fillStyle = Renderer.colorHighlight.pass(0.1).toString(true);
			context.strokeStyle = Renderer.colorHighlight.toString(true);
			const { globalPosition: position, diameter } = this;
			context.beginPath();
			context.arc(position.x, position.y, diameter / 2, 0, 2 * PI);
			context.closePath();
			context.stroke();
			context.fill();
			context.restore();
		});
	}
	get size() {
		return super.size;
	}
	set size(value) {
		throw new TypeError(`Cannot set property position of #<Vertice> which has only a getter`);
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

//#region Canvas
/**
 * @param {MouseEvent} event 
 * @returns {Readonly<Point2D>}
 */
function getMousePosition({ clientX: x, clientY: y }) {
	const { x: xOffset, y: yOffset } = canvas.getBoundingClientRect();
	const pointClientPosition = new Point2D(x, y);
	const pointCanvasOffset = new Point2D(xOffset, yOffset);
	return Object.freeze(pointClientPosition["-"](userInterface.size["/"](CONSTANT_TWO_2D))["*"](AXIS_FACTOR)["-"](pointCanvasOffset));
}

canvas.addEventListener(`pointerdown`, async (event) => {
	const controller = new AbortController();
	if (event.button !== 0) return;
	const pointPointerBeginPosition = getMousePosition(event);
	const verticeAlreadyExist = VerticeEntity.getVerticeAt(pointPointerBeginPosition);
	await (/** @type {Promise<void>} */ (new Promise((resolve) => {
		if (verticeAlreadyExist === null) {
			//#region New instance
			window.addEventListener(`pointerup`, (event2) => {
				if (event2.button !== 0) return;
				const pointPointerEndPosition = getMousePosition(event2);
				if (VerticeEntity.getVerticeAt(pointPointerEndPosition) !== null) return;
				const verticeNewInstance = new VerticeEntity(`Vertice`);
				verticeNewInstance.globalPosition = pointPointerEndPosition;
				progenitor.children.add(verticeNewInstance);
				resolve();
			}, { signal: controller.signal });
			//#endregion
		} else {
			//#region Already exist
			const pointInitialPosition = verticeAlreadyExist.globalPosition;
			window.addEventListener(`pointerup`, (event2) => {
				const pointCurrentPosition = verticeAlreadyExist.globalPosition;
				if (hypot(pointInitialPosition.x - pointCurrentPosition.x, pointInitialPosition.y - pointCurrentPosition.y) < 1) {
					progenitor.children.remove(verticeAlreadyExist);
				} else if (VerticeEntity.getVerticeAt(pointCurrentPosition, verticeAlreadyExist) !== null) {
					verticeAlreadyExist.globalPosition = pointInitialPosition;
				}
				resolve();
			}, { signal: controller.signal });
			window.addEventListener(`pointermove`, (event2) => {
				const pointPointerDragPosition = getMousePosition(event2);
				verticeAlreadyExist.globalPosition = pointPointerDragPosition;
			}, { signal: controller.signal });
			//#endregion
		}
	})));
	controller.abort();
});
//#endregion

buttonCaptureCanvas.addEventListener(`click`, async (event) => {
	try {
		canvas.toBlob((blob) => {
			if (blob === null) throw new ReferenceError(`Unable to initialize canvas for capture`);
			navigator.download(new File([blob], `${Date.now()}.png`));
		});
	} catch (error) {
		await window.stabilize(Error.generate(error));
	}
});