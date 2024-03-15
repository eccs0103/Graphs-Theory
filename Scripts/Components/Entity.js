"use strict";

import { Group, ModificationEvent, Node } from "./Node.js";
import { Point2D } from "../Modules/Measures.js";

const { atan2, PI } = Math;

/**
 * Represents a constant `Point2D(2, 2)` value.
 */
const CONSTANT_TWO_2D = Point2D.repeat(2);

//#region Entity
/** 
 * Enumeration representing different sectors in the area.
 * @enum {number}
 */
const AreaSectors = {
	/** @readonly */ top: 0,
	/** @readonly */ right: 1,
	/** @readonly */ bottom: 2,
	/** @readonly */ left: 3,
};
Object.freeze(AreaSectors);

/**
 * Represents a generic entity node with event capabilities.
 */
class Entity extends Node {
	/**
	 * Creates a new instance of the Entity class.
	 * @param {string} name - The name of the entity.
	 */
	constructor(name = ``) {
		super(name);
		this.addEventListener(`tryadoptchild`, (event) => {
			if (event instanceof ModificationEvent) {
				if (!(event.node instanceof Entity)) {
					event.preventDefault();
					throw new TypeError(`Entity's children also must be inherited from Entity`);
				}
			}
		});
	}
	/** @type {Group<Entity>} */
	#children = new Group(this);
	/**
	 * Gets the children of the entity.
	 * @readonly
	 */
	get children() {
		return this.#children;
	}
	/** @type {Point2D} */
	#position = Point2D.ZERO;
	/**
	 * Gets the position of the entity.
	 */
	get position() {
		return Object.freeze(this.#position);
	}
	/**
	 * Sets the position of the entity.
	 */
	set position(value) {
		let result = value.clone();
		this.#position = result;
	}
	/**
	 * Gets the global position of the entity.
	 */
	get globalPosition() {
		let result = this.#position;
		try {
			if (this.parent instanceof Entity) {
				result = result["+"](this.parent.globalPosition);
			}
		} finally {
			return Object.freeze(result);
		}
	}
	/**
	 * Sets the global position of the entity.
	 */
	set globalPosition(value) {
		let result = value.clone();
		try {
			if (this.parent instanceof Entity) {
				value = result["-"](this.parent.globalPosition);
			}
		} finally {
			this.#position = result;
		}
	}
	/** @type {Point2D} */
	#size = Point2D.ZERO;
	/**
	 * Gets the size of the entity.
	 */
	get size() {
		return Object.freeze(this.#size);
	}
	/**
	 * Sets the size of the entity.
	 */
	set size(value) {
		let result = value.clone();
		this.#size = result;
	}
	/**
	 * Gets the sector of the area in which another entity is located.
	 * @param {Entity} other - The other entity.
	 * @returns {AreaSectors} - The sector of the area.
	 */
	getAreaSector(other) {
		const alpha = atan2(this.size.x / 2, this.size.y / 2);

		const pointOtherPosition = other.globalPosition["-"](this.globalPosition);
		let angle = atan2(pointOtherPosition.x, pointOtherPosition.y);
		angle += alpha;
		if (angle < 0) angle += 2 * PI;

		const sectors = [2 * alpha, PI - 2 * alpha, 2 * alpha, PI - 2 * alpha];
		for (let begin = 0, index = 0; index < sectors.length; index++) {
			const sector = sectors[index];
			const end = begin + sector;
			if (begin <= angle && angle < end) {
				return index;
			}
			begin = end;
		}
		throw new RangeError(`Angle ${angle} out of range [0 - 2π).`);
	}
}
//#endregion

export { CONSTANT_TWO_2D, AreaSectors, Entity };