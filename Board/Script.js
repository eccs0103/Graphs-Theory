"use strict";

import { Entity } from "../Scripts/Components/Entity.js";
import { userInterface } from "../Scripts/Components/InterfaceItem.js";
import { canvas, context } from "../Scripts/Components/Node.js";
import { Renderer } from "../Scripts/Components/Utilities.js";
import { Point2D } from "../Scripts/Modules/Measures.js";

const { min, hypot, PI } = Math;

//#region Vertice entity
class VerticeEntity extends Entity {
	/** @type {Set<VerticeEntity>} */
	static #instances = new Set();
	/**
	 * @param {Readonly<Point2D>} point 
	 * @param {VerticeEntity?} exception
	 * @returns {boolean}
	 */
	static canPlaceAt(point, exception = null) {
		for (const entityVertice of VerticeEntity.#instances) {
			if (entityVertice === exception) continue;
			const { x, y } = entityVertice.globalPosition;
			if (hypot(point.x - x, point.y - y) < VerticeEntity.diameter) return false;
		}
		return true;
	}
	/** @type {number} */
	static #diameter = min(canvas.width, canvas.height) / 16;
	static get diameter() {
		return this.#diameter;
	}
	static set diameter(value) {
		this.#diameter = value;
	}
	static {
		window.addEventListener(`resize`, () => {
			this.diameter = min(canvas.width, canvas.height) / 16;
		});
	}
	/**
	 * @param {string} name 
	 */
	constructor(name = `Vertice entity`) {
		super(name);

		this.addEventListener(`connect`, () => {
			VerticeEntity.#instances.add(this);
		});
		this.addEventListener(`disconnect`, () => {
			VerticeEntity.#instances.delete(this);
		});

		this.addEventListener(`click`, () => {
			userInterface.children.remove(this);
		});
		/** @type {Readonly<Point2D>} */
		let pointInitialPosition;
		this.addEventListener(`dragbegin`, (event) => {
			pointInitialPosition = event.position;
		});
		this.addEventListener(`drag`, (event) => {
			this.globalPosition = event.position;
		});
		this.addEventListener(`dragend`, (event) => {
			if (VerticeEntity.canPlaceAt(event.position, this)) return;
			this.globalPosition = pointInitialPosition;
		});

		this.addEventListener(`render`, () => {
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
	/**
	 * @param {Readonly<Point2D>} point 
	 * @returns {boolean}
	 */
	isMesh(point) {
		const { x, y } = this.globalPosition;
		return (hypot(point.x - x, point.y - y) <= this.diameter / 2);
	}
	get size() {
		return super.size;
	}
	set size(value) {
		throw new TypeError(`Cannot set property position of #<VerticeEntity> which has only a getter`);
	}
	/** @readonly */
	get diameter() {
		return VerticeEntity.#diameter;
	}
}
//#endregion
//#region Edge entity
//#endregion

//#region Definition
const inputVerticeTool = document.getElement(HTMLInputElement, `input#vertice-tool`);
const buttonCaptureCanvas = document.getElement(HTMLButtonElement, `button#capture-canvas`);
//#endregion

await window.load(Promise.fulfill(() => { }), 200, 1000);

//#region Canvas
//#region Vertice drawing
userInterface.addEventListener(`click`, (event) => {
	if (!inputVerticeTool.checked) return;
	if (!VerticeEntity.canPlaceAt(event.position)) return;
	const verticeNewInstance = new VerticeEntity(`Vertice`);
	verticeNewInstance.globalPosition = event.position;
	userInterface.children.add(verticeNewInstance);
});
//#endregion
//#region Edge drawing

//#endregion
//#endregion

buttonCaptureCanvas.addEventListener(`click`, async () => {
	try {
		canvas.toBlob((blob) => {
			if (blob === null) throw new ReferenceError(`Unable to initialize canvas for capture`);
			navigator.download(new File([blob], `${Date.now()}.png`));
		});
	} catch (error) {
		await window.stabilize(Error.generate(error));
	}
});
