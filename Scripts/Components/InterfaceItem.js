"use strict";

import { Point2D } from "../Modules/Measures.js";
import { CONSTANT_TWO_2D, Entity } from "./Entity.js";
import { ModificationEvent, canvas, display, progenitor } from "./Node.js";

//#region Interface item
/**
 * Represents an item in the interface.
 */
class InterfaceItem extends Entity {
	/**
	 * Creates a new instance of the InterfaceItem class.
	 * @param {string} name - The name of the interface item.
	 */
	constructor(name = ``) {
		super(name);
	}
	/** @type {Point2D} */
	#anchor = Point2D.ZERO;
	/**
	 * Gets the anchor point of the interface item.
	 */
	get anchor() {
		return Object.freeze(this.#anchor["*"](CONSTANT_TWO_2D));
	}
	/**
	 * Sets the anchor point of the interface item.
	 * @throws {RangeError} - If the anchor point is out of range.
	 */
	set anchor(value) {
		if (-1 > this.#anchor.x || this.#anchor.x > 1) throw new RangeError(`Anchor ${this.anchor} is out of range [(-1, -1) - (1, 1)]`);
		if (-1 > this.#anchor.y || this.#anchor.y > 1) throw new RangeError(`Anchor ${this.anchor} is out of range [(-1, -1) - (1, 1)]`);
		const result = value["/"](CONSTANT_TWO_2D);
		this.#anchor = result;
	}
	/**
	 * Gets the global position of the interface item.
	 */
	get globalPosition() {
		let result = super.globalPosition.clone();
		try {
			if (this.parent instanceof Entity) {
				result = result["+"](this.parent.size["*"](this.#anchor));
				result = result["-"](this.size["*"](this.#anchor));
			}
		} finally {
			return Object.freeze(result);
		}
	}
	/**
	 * Sets the global position of the interface item.
	 */
	set globalPosition(value) {
		let result = value;
		try {
			if (this.parent instanceof Entity) {
				result = result["-"](this.parent.size["*"](this.#anchor));
				result = result["+"](this.size["*"](this.#anchor));
			}
		} finally {
			super.globalPosition = result;
		}
	}
}
//#endregion
//#region User interface
/**
 * Represents a user interface with specific properties.
 */
class UserInterface extends InterfaceItem {
	/**
	 * Creates a new instance of the UserInterface class.
	 * @param {string} name - The name of the user interface.
	 */
	constructor(name = `User interface`) {
		super(name);
		super.size = new Point2D(canvas.width, canvas.height);
		display.addEventListener(`resize`, (event) => {
			super.size = new Point2D(canvas.width, canvas.height);
		});
		this.addEventListener(`tryadopt`, (event) => {
			if (event instanceof ModificationEvent) {
				if (event.node !== progenitor) {
					event.preventDefault();
					throw new EvalError(`User interface can be adopted only by Progenitor`);
				}
			}
		});
	}
	/**
	 * Gets the position of the user interface.
	 * @readonly
	 */
	get position() {
		return super.position;
	}
	/**
	 * Setting the position of the user interface is not allowed.
	 * @throws {TypeError} - On try to set the position.
	 */
	set position(value) {
		throw new TypeError(`Cannot set property position of #<UserInterface> which has only a getter`);
	}
	/**
	 * Gets the global position of the user interface.
	 * @readonly
	 */
	get globalPosition() {
		return super.globalPosition;
	}
	/**
	 * Setting the global position of the user interface is not allowed.
	 * @throws {TypeError} - On try to set the global position.
	 */
	set globalPosition(value) {
		throw new TypeError(`Cannot set property globalPosition of #<UserInterface> which has only a getter`);
	}
	/**
	 * Gets the size of the user interface.
	 * @readonly
	 */
	get size() {
		return super.size;
	}
	/**
	 * Setting the size of the user interface is not allowed.
	 * @throws {TypeError} - On try to set the size.
	 */
	set size(value) {
		throw new TypeError(`Cannot set property globalPosition of #<UserInterface> which has only a getter`);
	}
	/**
	 * Gets the anchor of the user interface.
	 * @readonly
	 */
	get anchor() {
		return super.anchor;
	}
	/**
	 * Setting the anchor of the user interface is not allowed.
	 * @throws {TypeError} - On try to set the anchor.
	 */
	set anchor(value) {
		throw new TypeError(`Cannot set property globalPosition of #<UserInterface> which has only a getter`);
	}
}
//#endregion

/**
 * Main instance of `UserInterface`.
 */
const userInterface = new UserInterface();
progenitor.children.add(userInterface);

export { InterfaceItem, UserInterface, userInterface };