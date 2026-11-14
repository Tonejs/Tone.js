import { isString } from "tone";

/**
 * An element which can drive a Tone.js object
 */
export interface Bindable<T> {
	bind(target: T): void;
}

/**
 * Something with start and stop methods, like a source or the Transport
 */
export interface Startable {
	start(): unknown;
	stop(): unknown;
}

/**
 * Something with an attack and release, like an Envelope
 */
export interface Triggerable {
	triggerAttack(): unknown;
	triggerRelease(): unknown;
}

/**
 * Connect the element matching the selector to a Tone.js object.
 * What the target can be depends on the element, e.g. a tone-play-toggle
 * starts and stops its target and a tone-slider sets its target's value.
 */
export function bind<T>(selector: string | Element, target: T): Element {
	const element = isString(selector)
		? document.querySelector(selector)
		: selector;
	if (!element || !("bind" in element)) {
		throw new Error(`No bindable element matches "${selector}"`);
	}
	(element as unknown as Bindable<T>).bind(target);
	return element;
}

/**
 * Append to the example page if there is one
 */
export function defaultParent(): HTMLElement {
	return document.querySelector("tone-example") ?? document.body;
}

/**
 * Append the element, in the example page's controls sidebar
 * when the parent is the example page
 */
export function placeControls(element: HTMLElement, parent: HTMLElement) {
	if (parent.localName === "tone-example") {
		element.slot = "controls";
	}
	parent.appendChild(element);
}
