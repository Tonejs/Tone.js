import { pageStyles } from "./styles";

/**
 * Add the boilerplate that every example page needs to the document head,
 * so the pages only have to include the script.
 */
export function addHeadElements() {
	const script = document.currentScript as HTMLScriptElement | null;
	const base = script?.src ?? document.baseURI;
	addOnce('meta[name="viewport"]', "meta", {
		name: "viewport",
		content: "width=device-width, initial-scale=1, maximum-scale=1",
	});
	addOnce('link[rel="icon"]', "link", {
		rel: "icon",
		type: "image/png",
		href: new URL("favicon.png", base).href,
	});
	if (!document.adoptedStyleSheets.includes(pageStyles.styleSheet)) {
		document.adoptedStyleSheets = [
			...document.adoptedStyleSheets,
			pageStyles.styleSheet,
		];
	}
	addOnce('link[href*="Hanken+Grotesk"]', "link", {
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
	});
	addOnce('link[href*="Material+Icons"]', "link", {
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css?family=Material+Icons&display=block",
	});
}

function addOnce(
	selector: string,
	tagName: string,
	attributes: Record<string, string>
) {
	if (!document.head.querySelector(selector)) {
		const element = document.createElement(tagName);
		for (const [name, value] of Object.entries(attributes)) {
			element.setAttribute(name, value);
		}
		document.head.appendChild(element);
	}
}
