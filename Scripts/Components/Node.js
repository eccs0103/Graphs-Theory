"use strict";

import { FastEngine } from "../Modules/Executors.js";
import { } from "../Modules/Extensions.js";
import { Point2D } from "../Modules/Measures.js";

/**
 * Represents the canvas element used for display.
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
/**
 * Represents the rendering context for the canvas element.
 * @type {CanvasRenderingContext2D}
 */
const context = canvas.getContext(`2d`) ?? (() => {
	throw new TypeError(`Context is missing`);
})();
window.addEventListener(`resize`, (event) => {
	const { width, height } = canvas.getBoundingClientRect();
	canvas.width = width;
	canvas.height = height;

	const transform = context.getTransform();
	transform.e = canvas.width / 2;
	transform.f = canvas.height / 2;
	transform.d *= -1;
	context.setTransform(transform);
});

/**
 * Represents a factor used to modify the y-axis behavior for canvas rendering.
 * @type {Readonly<Point2D>}
 */
const AXIS_FACTOR = Object.freeze(new Point2D(1, -1));
/**
 * Represents a constant value for a 2D point.
 * @type {Readonly<Point2D>}
 */
const CONSTANT_TWO_2D = Object.freeze(Point2D.repeat(2));

/**
 * Represents the game engine instance.
 * @type {FastEngine}
 */
const engine = new FastEngine();

//#region Modification event
/**
 * @typedef VirtualModificationEventInit
 * @property {Node} node
 * 
 * @typedef {EventInit & VirtualModificationEventInit} ModificationEventInit
 */

/**
 * Represents a modification event.
 */
class ModificationEvent extends Event {
	/**
	 * Creates a new instance of ModificationEvent.
	 * @param {string} type The type of the event.
	 * @param {ModificationEventInit} dict The initialization dictionary.
	 */
	constructor(type, dict) {
		super(type, dict);
		this.#node = dict.node;
	}
	/** @type {Node?} */
	#node = null;
	/**
	 * Gets the node property of the ModificationEvent.
	 * @readonly
	 * @throws {ReferenceError} If the property is missing.
	 * @returns {Node}
	 */
	get node() {
		return this.#node ?? (() => {
			throw new ReferenceError(`Modification property is missing`);
		})();
	}
}
//#endregion
//#region Group
/**
 * Represents a group of nodes.
 * @template {Node} T
 */
class Group {
	/**
	 * Creates a new instance of the Group class.
	 * @param {Node} owner The owner node of the group.
	 * @param {T[]} items The initial items to add to the group.
	 */
	constructor(owner, ...items) {
		this.#owner = owner;
		for (const item of items) {
			this.add(item);
		}
	}
	/** @type {Node} */
	#owner;
	/** @type {Set<T>} */
	#nodes = new Set();
	/**
	 * Adds an item to the group.
	 * @param {T} item The item to add.
	 * @returns {void}
	 */
	add(item) {
		const parent = this.#owner, child = item;
		if (!parent.dispatchEvent(new ModificationEvent(`tryadoptchild`, { node: child, cancelable: true }))) return;
		if (!child.dispatchEvent(new ModificationEvent(`tryadopt`, { node: parent, cancelable: true }))) return;
		this.#nodes.add(item);
		parent.dispatchEvent(new ModificationEvent(`adoptchild`, { node: child }));
		child.dispatchEvent(new ModificationEvent(`adopt`, { node: parent }));
	}
	/**
	 * Removes an item from the group.
	 * @param {T} item The item to remove.
	 * @returns {void}
	 */
	remove(item) {
		const parent = this.#owner, child = item;
		if (!parent.dispatchEvent(new ModificationEvent(`tryabandonchild`, { node: child, cancelable: true }))) return;
		if (!child.dispatchEvent(new ModificationEvent(`tryabandon`, { node: parent, cancelable: true }))) return;
		this.#nodes.delete(item);
		parent.dispatchEvent(new ModificationEvent(`abandonchild`, { node: child }));
		child.dispatchEvent(new ModificationEvent(`abandon`, { node: parent }));
	}
	/**
	 * Checks if the group contains a specific item.
	 * @param {T} item The item to check for.
	 * @returns {boolean} True if the group contains the item, false otherwise.
	 */
	has(item) {
		return this.#nodes.has(item);
	}
	/**
	 * Removes all items from the group.
	 * @returns {void}
	 */
	clear() {
		for (const item of this.#nodes) {
			this.remove(item);
		}
	}
	/**
	 * Gets the number of items in the group.
	 * @returns {number}
	 */
	get size() {
		return this.#nodes.size;
	}
	/**
	 * Returns an iterator for the items in the group.
	 * @returns {Generator<T>} The iterator for the items.
	 */
	*[Symbol.iterator]() {
		for (const item of this.#nodes) {
			yield item;
		}
		return;
	}
}
//#endregion
//#region Node
/**
 * @typedef NodeEventMap
 * @property {ModificationEvent} tryadopt
 * @property {ModificationEvent} adopt
 * @property {ModificationEvent} tryabandon
 * @property {ModificationEvent} abandon
 * @property {ModificationEvent} tryadoptchild
 * @property {ModificationEvent} adoptchild
 * @property {ModificationEvent} tryabandonchild
 * @property {ModificationEvent} abandonchild
 * @property {Event} connect
 * @property {Event} disconnect
 * @property {Event} start
 * @property {Event} update
 * @property {Event} render
 */

/**
 * Represents a generic node with event capabilities.
 */
class Node extends EventTarget {
	/**
	 * @param {Node} target 
	 * @returns {void}
	 */
	static #connect(target) {
		target.#isConnected = true;
		target.dispatchEvent(new Event(`connect`));
		for (const child of target.children) {
			Node.#connect(child);
		}
	}
	/**
	 * @param {Node} target 
	 * @returns {void}
	 */
	static #disconnect(target) {
		target.#isConnected = false;
		for (const child of target.children) {
			Node.#disconnect(child);
		}
		target.dispatchEvent(new Event(`disconnect`));
	}
	/**
	 * Creates a new instance of the Node class.
	 * @param {string} name The name of the node.
	 */
	constructor(name = `Node`) {
		super();
		this.name = name;

		this.addEventListener(`adoptchild`, (event) => {
			event.node.#parent = this;
		});
		this.addEventListener(`abandonchild`, (event) => {
			event.node.#parent = null;
		});

		this.addEventListener(`adopt`, (event) => {
			const peak = this.peak;
			if (peak instanceof Progenitor || peak.#isConnected) {
				Node.#connect(this);
			}
		});
		this.addEventListener(`abandon`, (event) => {
			Node.#disconnect(this);
		});
	}
	/**
	 * @template {keyof NodeEventMap} K
	 * @param {K} type 
	 * @param {(this: Node, ev: NodeEventMap[K]) => any} listener 
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof NodeEventMap} K
	 * @param {K} type 
	 * @param {(this: Node, ev: NodeEventMap[K]) => any} listener 
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/**
	 * Dispatches an event to the Progenitor and its descendants.
	 * @param {Event} event The event to dispatch.
	 * @returns {boolean} True if the event was not canceled, false otherwise.
	 */
	dispatchEvent(event) {
		if (!super.dispatchEvent(event)) return false;
		if (event.bubbles) {
			for (const child of this.children) {
				if (!child.dispatchEvent(event)) return false;
			}
		}
		return true;
	}
	/** @type {string} */
	#name = ``;
	/**
	 * Gets the name of the node.
	 */
	get name() {
		return this.#name;
	}
	/**
	 * Sets the name of the node.
	 */
	set name(value) {
		this.#name = value;
	}
	/** @type {Node?} */
	#parent = null;
	/**
	 * Gets the parent node.
	 * @readonly
	 * @throws {ReferenceError} If the parent is null.
	 */
	get parent() {
		return this.#parent ?? (() => {
			throw new ReferenceError(`Parent of '${this.name}' is null`);
		})();
	}
	/** @type {Group<Node>} */
	#children = new Group(this);
	/**
	 * Gets the children of the node.
	 * @readonly
	 */
	get children() {
		return this.#children;
	}
	/**
	 * Gets the topmost ancestor of the node.
	 * @readonly
	 */
	get peak() {
		for (let current = (/** @type {Node} */ (this)); true;) {
			try {
				current = current.parent;
			} catch (error) {
				return current;
			}
		}
	}
	/** @type {boolean} */
	#isConnected = (this instanceof Progenitor);
	/**
	 * Gets whether the node is connected.
	 * @readonly
	 */
	get isConnected() {
		return this.#isConnected;
	}
}
//#endregion

//#region Device types
/** @enum {string} */
const DeviceTypes = {
	/** @readonly */ mobile: `mobile`,
	/** @readonly */ tablet: `tablet`,
	/** @readonly */ desktop: `desktop`,
};
Object.freeze(DeviceTypes);
//#endregion
//#region Pointer event
/**
 * @typedef VirtualPointerEventInit
 * @property {Readonly<Point2D>} position
 * 
 * @typedef {EventInit & VirtualPointerEventInit} PointerEventInit
 */

/**
 * Represents a pointer event.
 */
class PointerEvent extends Event {
	/**
	 * Creates a new PointerEvent.
	 * @param {string} type The type of the event.
	 * @param {PointerEventInit} dict The initialization options for the event.
	 */
	constructor(type, dict) {
		super(type, dict);
		this.#position = dict.position;
	}
	/** @type {Readonly<Point2D>?} */
	#position = null;
	/**
	 * Gets the position property of the PointerEvent.
	 * @readonly
	 * @throws {ReferenceError} If the property is missing.
	 * @returns {Readonly<Point2D>} The position of the pointer.
	 */
	get position() {
		return this.#position ?? (() => {
			throw new ReferenceError(`Pointer property is missing`);
		})();
	}
}
//#endregion
//#region Progenitor
/**
 * @typedef VirtualProgenitorEventMap
 * @property {PointerEvent} pointerdown
 * @property {PointerEvent} pointerup
 * @property {PointerEvent} pointermove
 * 
 * @typedef {NodeEventMap & VirtualProgenitorEventMap} ProgenitorEventMap
 */

/**
 * Represents a special node called Progenitor with specific behaviors.
 */
class Progenitor extends Node {
	/** @type {Progenitor?} */
	static #instance = null;
	/** 
	 * Gets the singleton instance of Progenitor.
	 * @readonly
	 */
	static get instance() {
		return Progenitor.#instance ?? (() => {
			Progenitor.#locked = false;
			Progenitor.#instance = new Progenitor();
			Progenitor.#locked = true;
			return Progenitor.#instance;
		})();
	}
	/** @type {boolean} */
	static #locked = true;
	/**
	 * Creates a new instance of the Progenitor class.
	 * @param {string} name The name of the Progenitor node.
	 * @throws {TypeError} If the constructor is called manually.
	 */
	constructor(name = `Progenitor`) {
		super(name);
		if (Progenitor.#locked) throw new TypeError(`Illegal constructor`);

		this.addEventListener(`tryadopt`, (event) => {
			event.preventDefault();
			throw new EvalError(`Progenitor can't be adopted by any node`);
		});

		engine.addEventListener(`start`, (event) => {
			this.dispatchEvent(new Event(`start`, { bubbles: true }));
		});
		engine.addEventListener(`update`, (event) => {
			this.dispatchEvent(new Event(`update`, { bubbles: true }));
		});

		/** @type {boolean} */
		let isPointerDown = false;
		/** @type {boolean} */
		let wasPointerDown = false;
		canvas.addEventListener(`mousedown`, (event) => {
			if (event.button !== 0) return;
			this.#fixMousePosition(event);
			isPointerDown = true;
		});
		canvas.addEventListener(`touchstart`, (event) => {
			this.#fixTouchPosition(event);
			isPointerDown = true;
		});

		/** @type {boolean} */
		let isPointerUp = false;
		window.addEventListener(`mouseup`, (event) => {
			if (event.button !== 0 || !wasPointerDown) return;
			this.#fixMousePosition(event);
			isPointerUp = true;
		});
		window.addEventListener(`touchend`, (event) => {
			if (!wasPointerDown) return;
			this.#fixTouchPosition(event);
			isPointerUp = true;
		});

		/** @type {boolean} */
		let isPointerMove = false;
		window.addEventListener(`mousemove`, (event) => {
			if (event.button !== 0) return;
			this.#fixMousePosition(event);
			isPointerMove = true;
		});
		window.addEventListener(`touchmove`, (event) => {
			this.#fixTouchPosition(event);
			isPointerMove = true;
		});

		this.addEventListener(`update`, (event) => {
			if (isPointerDown) {
				this.dispatchEvent(new PointerEvent(`pointerdown`, { position: this.#pointPointerPosition }));
				wasPointerDown = true;
				isPointerDown = false;
			}
			if (isPointerUp) {
				this.dispatchEvent(new PointerEvent(`pointerup`, { position: this.#pointPointerPosition }));
				wasPointerDown = false;
				isPointerUp = false;
			}
			if (isPointerMove) {
				this.dispatchEvent(new PointerEvent(`pointermove`, { position: this.#pointPointerPosition }));
				isPointerMove = false;
			}
		});
	}
	/**
	 * @template {keyof ProgenitorEventMap} K
	 * @param {K} type 
	 * @param {(this: Progenitor, ev: ProgenitorEventMap[K]) => any} listener 
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof ProgenitorEventMap} K
	 * @param {K} type 
	 * @param {(this: Progenitor, ev: ProgenitorEventMap[K]) => any} listener 
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/** @type {Readonly<Point2D>} */
	#pointPointerPosition = Object.freeze(Point2D.repeat(NaN));
	/**
	 * @param {MouseEvent} event 
	 * @returns {void}
	 */
	#fixMousePosition(event) {
		const { clientX: x, clientY: y } = event;
		const { x: xOffset, y: yOffset, width, height } = canvas.getBoundingClientRect();
		const pointClientPosition = new Point2D(x, y);
		const pointCanvasOffset = new Point2D(-xOffset - width / 2, yOffset - height / 2);
		this.#pointPointerPosition = Object.freeze(pointClientPosition["+"](pointCanvasOffset)["*"](AXIS_FACTOR));
	}
	/**
	 * @param {TouchEvent} event 
	 * @returns {void}
	 */
	#fixTouchPosition(event) {
		const touch = event.touches.item(0);
		if (touch === null) return;
		const { clientX: x, clientY: y } = touch;
		const { x: xOffset, y: yOffset, width, height } = canvas.getBoundingClientRect();
		const pointClientPosition = new Point2D(x, y);
		const pointCanvasOffset = new Point2D(-xOffset - width / 2, yOffset - height / 2);
		this.#pointPointerPosition = Object.freeze(pointClientPosition["+"](pointCanvasOffset)["*"](AXIS_FACTOR));
	}
}
//#endregion

/**
 * Represents the singleton instance of the Progenitor class.
 * @type {Progenitor}
 */
const progenitor = Progenitor.instance;

export { canvas, context, AXIS_FACTOR, CONSTANT_TWO_2D, engine, ModificationEvent, Group, Node, PointerEvent, progenitor };