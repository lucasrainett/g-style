// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSProperty.js#L15-L59
import { Context, CssRule } from "./types";

const noAutoPixel = [
	"animation-iteration-count",
	"border-image-outset",
	"border-image-slice",
	"border-image-width",
	"box-flex",
	"box-flex-group",
	"box-ordinal-group",
	"column-count",
	"columns",
	"flex",
	"flex-grow",
	"flex-positive",
	"flex-shrink",
	"flex-negative",
	"flex-order",
	"-ms-flex",
	"-ms-flex-grow",
	"-ms-flex-positive",
	"-ms-flex-shrink",
	"-ms-flex-negative",
	"-ms-flex-order",
	"grid-row",
	"grid-row-end",
	"grid-row-span",
	"grid-row-start",
	"grid-column",
	"grid-column-end",
	"grid-column-span",
	"grid-column-start",
	"-ms-grid-row",
	"-ms-grid-row-end",
	"-ms-grid-row-span",
	"-ms-grid-row-start",
	"-ms-grid-column",
	"-ms-grid-column-end",
	"-ms-grid-column-span",
	"-ms-grid-column-start",
	"font-weight",
	"line-clamp",
	"line-height",
	"opacity",
	"order",
	"orphans",
	"tab-size",
	"widows",
	"z-index",
	"zoom",
	"fill-opacity",
	"flood-opacity",
	"stop-opacity",
	"stroke-dasharray",
	"stroke-dashoffset",
	"stroke-miterlimit",
	"stroke-opacity",
	"stroke-width",
];

export function entries(object: any) {
	return Object.keys(object).map((key) => [key, object[key]]);
}

export function ObjectEntriesShim() {
	(Object as any).entries = Object.entries || entries;
}

export function formatClassName(text: string) {
	return text
		.trim()
		.replace(/[A-Z]|^ms/g, "-$&")
		.toLowerCase();
}

export function formatCssRule(key: string, value: string) {
	return `${key}:${value};`;
}

export function wrapCssRule(className: string | undefined, cssRule: string) {
	if (className !== undefined) {
		return `${className}{${cssRule}}`;
	} else {
		return cssRule;
	}
}

export function formatChildKey(key: string) {
	return key.indexOf("&") === 0 ? key.substr(1) : " " + key;
}

export function formatPxUnit(key: string, value: string | number): string {
	if (
		typeof value === "number" &&
		value !== 0 &&
		noAutoPixel.indexOf(key) < 0
	) {
		return `${value}px`;
	} else {
		return String(value);
	}
}

export function getNonceFromMeta() {
	return document
		.querySelector("meta[property=csp-nonce]")
		?.getAttribute("content");
}

export function insertRule(
	rules: string[],
	rule: string,
	debug: boolean,
	sheet?: CSSStyleSheet
) {
	rules.push(rule);
	if (sheet) {
		try {
			sheet.insertRule(rule, sheet.cssRules.length);
			debug && console.log("Rule Inserted:", rule);
		} catch (e) {
			debug && console.error("ERROR: Rule not supported:", rule);
		}
	}
}

export function processStringValue(
	{ key, value, childSelectors, mediaQuery }: CssRule<string>,
	{ cache, rules, config, sheet }: Context
): string {
	const cacheKey = [mediaQuery, ...childSelectors, key, value]
		.filter(Boolean)
		.join("_");

	cache[cacheKey] =
		cache[cacheKey] ||
		(() => {
			const className = config.prefix + rules.length.toString(36);

			insertRule(
				rules,
				wrapCssRule(
					mediaQuery,
					wrapCssRule(
						[".", className, ...childSelectors].join(""),
						formatCssRule(key, value)
					)
				),
				!!config.debug,
				sheet
			);

			return className;
		})();
	return cache[cacheKey];
}
