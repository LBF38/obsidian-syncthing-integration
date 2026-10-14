/**
 * Global test setup.
 *
 * Obsidian patches several built-in prototypes at runtime (`String#contains`,
 * `Array#remove`, `Node#createEl`, `Element#addClass`, ...). Since the plugin
 * relies on those helpers, we reproduce them here so the code runs unchanged
 * inside Vitest.
 *
 * DOM related patches are only installed when a DOM is available (i.e. tests
 * that opt into the `happy-dom` environment).
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { Notice, Platform } from "obsidian";

/* -------------------------------------------------------------------------- */
/*                         Non-DOM prototype patches                          */
/* -------------------------------------------------------------------------- */

function installCoreExtensions(): void {
	const stringProto = String.prototype as unknown as Record<string, unknown>;
	if (typeof stringProto.contains !== "function") {
		stringProto.contains = function (this: string, target: string): boolean {
			return this.includes(target);
		};
	}

	const arrayProto = Array.prototype as unknown as Record<string, unknown>;
	if (typeof arrayProto.contains !== "function") {
		arrayProto.contains = function (this: unknown[], target: unknown): boolean {
			return this.includes(target);
		};
	}
	if (typeof arrayProto.remove !== "function") {
		arrayProto.remove = function (this: unknown[], target: unknown): void {
			const index = this.indexOf(target);
			if (index >= 0) {
				this.splice(index, 1);
			}
		};
	}
}

/* -------------------------------------------------------------------------- */
/*                            DOM prototype patches                           */
/* -------------------------------------------------------------------------- */

function installDomExtensions(): void {
	const nodeProto = Node.prototype as unknown as Record<string, unknown>;
	const elementProto = Element.prototype as unknown as Record<string, unknown>;
	const htmlElementProto = HTMLElement.prototype as unknown as Record<
		string,
		unknown
	>;

	nodeProto.empty = function (this: Node): void {
		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}
	};
	nodeProto.detach = function (this: Node): void {
		this.parentNode?.removeChild(this);
	};
	nodeProto.appendText = function (this: Node, text: string): void {
		this.appendChild(document.createTextNode(text));
	};
	nodeProto.insertAfter = function <T extends Node>(
		this: Node,
		node: T,
		child: Node | null,
	): T {
		if (child) {
			(child as ChildNode).after(node);
			return node;
		}
		this.appendChild(node);
		return node;
	};
	nodeProto.createEl = function (
		this: Node,
		tag: string,
		info?: DomElementInfo | string,
		callback?: (el: HTMLElement) => void,
	): HTMLElement {
		const el = document.createElement(tag);
		applyDomInfo(el, info);
		this.appendChild(el);
		callback?.(el);
		return el;
	};
	nodeProto.createDiv = function (
		this: Node,
		info?: DomElementInfo | string,
		callback?: (el: HTMLDivElement) => void,
	): HTMLDivElement {
		const el = document.createElement("div");
		applyDomInfo(el, info);
		this.appendChild(el);
		callback?.(el);
		return el;
	};
	nodeProto.createSpan = function (
		this: Node,
		info?: DomElementInfo | string,
		callback?: (el: HTMLSpanElement) => void,
	): HTMLSpanElement {
		const el = document.createElement("span");
		applyDomInfo(el, info);
		this.appendChild(el);
		callback?.(el);
		return el;
	};

	elementProto.getText = function (this: Element): string {
		return this.textContent ?? "";
	};
	elementProto.setText = function (
		this: Element,
		value: string | DocumentFragment,
	): void {
		if (typeof value === "string") {
			this.textContent = value;
		} else {
			this.empty();
			this.appendChild(value);
		}
	};
	elementProto.addClass = function (this: Element, ...classes: string[]): void {
		this.classList.add(...classes.filter((cls) => cls.length > 0));
	};
	elementProto.addClasses = function (this: Element, classes: string[]): void {
		this.classList.add(...classes);
	};
	elementProto.removeClass = function (
		this: Element,
		...classes: string[]
	): void {
		this.classList.remove(...classes);
	};
	elementProto.toggleClass = function (
		this: Element,
		classes: string | string[],
		value: boolean,
	): void {
		const list = Array.isArray(classes) ? classes : [classes];
		list.forEach((cls) => this.classList.toggle(cls, value));
	};
	elementProto.hasClass = function (this: Element, cls: string): boolean {
		return this.classList.contains(cls);
	};
	elementProto.setAttr = function (
		this: Element,
		qualifiedName: string,
		value: string | number | boolean | null,
	): void {
		if (value === null || value === false) {
			this.removeAttribute(qualifiedName);
		} else {
			this.setAttribute(qualifiedName, String(value));
		}
	};
	elementProto.setAttrs = function (
		this: Element,
		attributes: Record<string, string | number | boolean | null>,
	): void {
		for (const [key, value] of Object.entries(attributes)) {
			(this as unknown as Element).setAttr(key, value);
		}
	};
	elementProto.getAttr = function (
		this: Element,
		qualifiedName: string,
	): string | null {
		return this.getAttribute(qualifiedName);
	};
	elementProto.find = function (
		this: Element,
		selector: string,
	): Element | null {
		return this.querySelector(selector);
	};
	elementProto.findAll = function (
		this: Element,
		selector: string,
	): HTMLElement[] {
		return Array.from(this.querySelectorAll(selector)) as HTMLElement[];
	};

	htmlElementProto.onClickEvent = function (
		this: HTMLElement,
		listener: (evt: MouseEvent) => unknown,
		options?: AddEventListenerOptions,
	): void {
		this.addEventListener("click", listener as EventListener, options);
	};
	htmlElementProto.show = function (this: HTMLElement): void {
		this.style.display = "";
	};
	htmlElementProto.hide = function (this: HTMLElement): void {
		this.style.display = "none";
	};
	htmlElementProto.setCssStyles = function (
		this: HTMLElement,
		styles: Partial<CSSStyleDeclaration>,
	): void {
		Object.assign(this.style, styles);
	};
	htmlElementProto.setCssProps = function (
		this: HTMLElement,
		props: Record<string, string>,
	): void {
		for (const [key, value] of Object.entries(props)) {
			this.style.setProperty(key, value);
		}
	};
}

function applyDomInfo(
	el: HTMLElement,
	info?: DomElementInfo | string,
): void {
	if (typeof info === "string") {
		el.className = info;
		return;
	}
	if (!info) {
		return;
	}
	if (info.cls) {
		el.className = Array.isArray(info.cls) ? info.cls.join(" ") : info.cls;
	}
	if (typeof info.text === "string") {
		el.textContent = info.text;
	}
	if (info.title !== undefined) {
		el.title = info.title;
	}
	if (info.type !== undefined) {
		el.setAttribute("type", info.type);
	}
	if (info.value !== undefined) {
		el.setAttribute("value", info.value);
	}
	if (info.placeholder !== undefined) {
		el.setAttribute("placeholder", info.placeholder);
	}
	if (info.href !== undefined) {
		el.setAttribute("href", info.href);
	}
	if (info.attr) {
		for (const [key, value] of Object.entries(info.attr)) {
			if (value === null || value === undefined || value === false) {
				el.removeAttribute(key);
			} else {
				el.setAttribute(key, String(value));
			}
		}
	}
}

/* -------------------------------------------------------------------------- */
/*                              Initialisation                                */
/* -------------------------------------------------------------------------- */

installCoreExtensions();
if (typeof window !== "undefined" && typeof Node !== "undefined") {
	installDomExtensions();
}

/**
 * Default platform flags, used to restore `Platform` between tests so that a
 * test toggling mobile flags cannot leak into another one.
 */
const DEFAULT_PLATFORM = { ...Platform };

afterEach(() => {
	vi.clearAllMocks();
	Object.assign(Platform, DEFAULT_PLATFORM);
	(Notice as unknown as { instances: unknown[] }).instances.length = 0;
});
