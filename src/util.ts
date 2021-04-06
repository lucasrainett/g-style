// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSProperty.js#L15-L59
import { Context, CssObject, CssRule, CssValue } from "./types";

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

export const entries = (object: any) => Object.keys(object).map((key) => [key, object[key]]);

export const ObjectEntriesShim = () => {
	(Object as any).entries = Object.entries || entries;
};

export const formatClassName = (text: string) =>
	text
		.trim()
		.replace(/[A-Z]|^ms/g, "-$&")
		.toLowerCase();

export const formatCssRule = (key: string, value: string) => `${key}:${value};`;

export const wrapCssRule = (className: string | undefined, cssRule: string) =>
	className !== undefined ? `${className}{${cssRule}}` : cssRule;

export const formatChildKey = (key: string) => (key.indexOf("&") === 0 ? key.substr(1) : " " + key);

export const formatPxUnit = (key: string, value: string | number): string =>
	typeof value === "number" && value !== 0 && noAutoPixel.indexOf(key) < 0
		? `${value}px`
		: String(value);

export const getNonceFromMeta = () =>
	document.querySelector("meta[property=csp-nonce]")?.getAttribute("content") || undefined;

export const insertRule = (rule: string, debug: boolean, sheet?: CSSStyleSheet) => {
	if (sheet) {
		try {
			sheet.insertRule(rule, sheet.cssRules.length);
			debug && console.log("Rule Inserted:", rule);
		} catch (e) {
			debug && console.error("ERROR: Rule not supported:", rule);
		}
	}
};

export const addToCache = <T>(cache: { [key: string]: T }, key: string, callback: () => T) =>
	(cache[key] = cache[key] || callback());

export const processStringValue = (
	{ cache, rules, config, sheet }: Context,
	{ key, value, childSelectors, mediaQuery }: CssRule<string>
): string =>
	addToCache(cache, [mediaQuery, ...childSelectors, key, value].filter(Boolean).join("_"), () => {
		const className = config.prefix + rules.length.toString(36);
		const rule = wrapCssRule(
			mediaQuery,
			wrapCssRule([".", className, ...childSelectors].join(""), formatCssRule(key, value))
		);
		rules.push(rule);
		insertRule(rule, !!config.debug, sheet);
		return className;
	});

export const processSingleValue = (
	context: Context,
	{ value, key, ...rest }: CssRule<string | number>
) =>
	processStringValue(context, {
		value: typeof value === "number" ? formatPxUnit(key, value) : value,
		key,
		...rest,
	});

export const processArrayValue = (
	context: Context,
	{ value, ...rest }: CssRule<Array<string | number>>
) =>
	value
		.filter((val) => typeof val === "string" || typeof val === "number")
		.map((value) => processSingleValue(context, { value, ...rest }));

export const processKeyFrame = (
	{ cache, rules, config, sheet }: Context,
	keyframeKey: string,
	keyframeObject: CssObject
): void => {
	const rule = wrapCssRule(
		keyframeKey,
		Object.entries(keyframeObject)
			.map(([stageKey, stageContent]) =>
				wrapCssRule(
					stageKey,
					Object.entries(stageContent)
						.map(([stageRuleKey, stageRuleValue]) =>
							formatCssRule(
								formatClassName(stageRuleKey),
								formatPxUnit(stageRuleKey, stageRuleValue)
							)
						)
						.join("")
				)
			)
			.join("")
	);
	addToCache(cache, rule, () => {
		rules.push(rule);
		insertRule(rule, !!config.debug, sheet);
		return "cache";
	});
};

export const processObjectValue = (
	context: Context,
	{ key, value, childSelectors, mediaQuery }: CssRule<CssObject>
) => {
	if (key.indexOf("@keyframes") === 0) {
		processKeyFrame(context, key, value);
		return [];
	} else if (key.indexOf("@media") === 0) {
		return processCssObject(context, value, childSelectors, key);
	} else {
		return processCssObject(
			context,
			value,
			[...childSelectors, formatChildKey(key)],
			mediaQuery
		);
	}
};

export const processValue = (context: Context, { value, ...rest }: CssRule<CssValue>) =>
	typeof value === "object" && !Array.isArray(value)
		? processObjectValue(context, {
				value,
				...rest,
		  })
		: processArrayValue(context, {
				value: Array.isArray(value) ? value : [value],
				...rest,
		  });

export const processMultiKeyValue = (context: Context, { key, ...rest }: CssRule<CssValue>) =>
	key
		.split(",")
		.map(formatClassName)
		.map((key) => processValue(context, { key, ...rest }));

export const processCssObject = (
	context: Context,
	style: CssObject,
	childSelectors: string[],
	mediaQuery?: string
): string[] =>
	Object.entries(style)
		.filter(([, value]) => typeof value === "number" || Boolean(value))
		.map(([key, value]) =>
			processMultiKeyValue(context, {
				key,
				value,
				childSelectors,
				mediaQuery,
			})
		)
		.flat(3);

export const createStyleTag = (nonce?: string) => {
	const style = document.createElement("style");
	if (nonce) {
		style.setAttribute("nonce", nonce);
	}
	return document.head.appendChild(style).sheet as CSSStyleSheet;
};
