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
	get from() {
		return this.#from;
	}
	set from(value) {
		this.#from = value;
	}
	/** @type {Verticle} */
	#to;
	get to() {
		return this.#to;
	}
	set to(value) {
		this.#to = value;
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
		return this.#verticles;
	}
	/** @type {Edge[]} */
	#edges;
	/** @readonly */
	get edges() {
		return this.#edges;
	}
}
//#endregion

export { };