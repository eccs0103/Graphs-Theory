"use strict";

import { } from "./Modules/Executors.js";
import { } from "./Modules/Extensions.js";
import { } from "./Modules/Generators.js";
import { } from "./Modules/Measures.js";
import { } from "./Modules/Palette.js";
import { } from "./Modules/Storage.js";
import { } from "./Modules/Time.js";

import { } from "./Components/Node.js";
import { } from "./Components/Entity.js";
import { } from "./Components/InterfaceItem.js";
import { } from "./Components/Corporeal.js";
import { } from "./Components/Utilities.js";

//#region Verticle
class Verticle { }
//#endregion
//#region Edge
class Edge {
	/**
	 * @param {Verticle} from 
	 * @param {Verticle} to 
	 */
	constructor(from, to) {
		this.#from = from;
		this.#to = to;
	}
	/** @type {Verticle} */
	#from;
	/** @readonly */
	get from() {
		return this.#from;
	}
	/** @type {Verticle} */
	#to;
	/** @readonly */
	get to() {
		return this.#to;
	}
}
//#endregion
//#region Graph
class Graph {
	/**
	 * @param {Verticle[]} verticles 
	 * @param {Edge[]} edges 
	 */
	constructor(verticles, edges) {
		this.#verticles = verticles;
		this.#edges = edges;
	}
	/** @type {Verticle[]} */
	#verticles;
	/** @readonly */
	get verticles() {
		return Object.freeze(this.#verticles);
	}
	/**
	 * @returns {void}
	 */
	addVerticle() {
		this.#verticles.push(new Verticle());
	}
	/**
	 * @param {number} index 
	 * @returns {void}
	 */
	removeVerticle(index) {
		if (!Number.isInteger(index) || 0 > index || index >= this.#verticles.length)
			throw new RangeError(`Verticle index ${index} is out of range [0 - ${this.#verticles.length})`);
		const verticleSelected = this.#verticles[index];
		this.#edges = this.#edges.filter(edge => (edge.from !== verticleSelected && edge.to !== verticleSelected));
		this.#verticles.splice(index, 1);
	}
	/** @type {Edge[]} */
	#edges;
	/** @readonly */
	get edges() {
		return Object.freeze(this.#edges);
	}
	/**
	 * @param {number} from 
	 * @param {number} to 
	 * @returns {void}
	 */
	addEdge(from, to) {
		if (!Number.isInteger(from) || 0 > from || from >= this.#verticles.length)
			throw new RangeError(`Verticle index ${from} is out of range [0 - ${this.#verticles.length})`);
		const verticleFrom = this.#verticles[from];
		if (!Number.isInteger(to) || 0 > to || to >= this.#verticles.length)
			throw new RangeError(`Verticle index ${to} is out of range [0 - ${this.#verticles.length})`);
		const verticleTo = this.#verticles[to];
		if (this.#edges.find(edge => (edge.from === verticleFrom && edge.to === verticleTo)) !== undefined)
			throw new EvalError(`Edge from ${from} to ${to} already exists`);
		this.#edges.push(new Edge(verticleFrom, verticleTo));
	}
	/**
	 * @param {number} from 
	 * @param {number} to 
	 * @returns {void}
	 */
	removeEdge(from, to) {
		if (!Number.isInteger(from) || 0 > from || from >= this.#verticles.length)
			throw new RangeError(`Verticle index ${from} is out of range [0 - ${this.#verticles.length})`);
		const verticleFrom = this.#verticles[from];
		if (!Number.isInteger(to) || 0 > to || to >= this.#verticles.length)
			throw new RangeError(`Verticle index ${to} is out of range [0 - ${this.#verticles.length})`);
		const verticleTo = this.#verticles[to];
		const indexSelected = this.#edges.findIndex(edge => (edge.from === verticleFrom && edge.to === verticleTo));
		if (indexSelected < 0) throw new ReferenceError(`Unable to find edge from ${from} to ${to}`);
		this.#edges.splice(indexSelected, 1);
	}
}
//#endregion

export { Verticle, Edge, Graph };