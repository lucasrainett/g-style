import { cleanText, wrap, rule, getMetaAttribute, flat, isValidCssValue } from "./util";

export type CssValue = string | number | Array<string | number> | CssObject;

export interface CssObject {
	[key: string]: CssValue;
}

export interface IConfig {
	prefix: string;
	nonce?: string;
	nonceMetaProperty: string;
	nonceMetaAttribute: string;
	debug: boolean;
	memoryOnly: boolean;
}

// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSProperty.js#L15-L59
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
	"grid-row",
	"grid-row-end",
	"grid-row-span",
	"grid-row-start",
	"grid-column",
	"grid-column-end",
	"grid-column-span",
	"grid-column-start",
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
	"stroke-width"
];

export function css(style: CssObject) {
	return GlobalStyle.getClassNames(style);
}

export class GlobalStyle {
	private readonly cache: { [key: string]: string } = {};
	private readonly rules: string[] = [];
	private readonly sheet?: CSSStyleSheet;
	private config: IConfig;

	constructor(config: Partial<IConfig> = {}) {
		const { memoryOnly, nonce, nonceMetaProperty, nonceMetaAttribute } = this.config = {
			prefix: "t",
			nonceMetaProperty: "csp-nonce",
			nonceMetaAttribute: "content",
			debug: false,
			memoryOnly: false,
			...config
		};

		if (!memoryOnly && typeof document !== "undefined") {
			const style = document.createElement("style");
			const finalNonce = nonce || getMetaAttribute(nonceMetaProperty, nonceMetaAttribute);
			if (finalNonce) {
				style.setAttribute("nonce", finalNonce);
			}
			this.sheet = document.head.appendChild(style)
				.sheet as CSSStyleSheet;
		}
	}

	private static instance: GlobalStyle;

	public static getClassNames(style: CssObject) {
		this.instance = this.instance || new GlobalStyle();
		return this.instance.getClassNames(style);
	}

	public static getFullCss() {
		this.instance = this.instance || new GlobalStyle();
		return this.instance.getFullCss();
	}

	private insertRule(rule: string) {
		this.rules.push(rule);
		if (this.sheet) {
			try {
				this.sheet.insertRule(rule, this.sheet.cssRules.length);
				this.config.debug && console.log("Rule Inserted:", rule);
			} catch (e) {
				this.config.debug &&
				console.error("ERROR: Rule not supported:", rule);
			}
		}
	}

	private parseStringValue(
		styleKey: string,
		value: string,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		const cacheKey = styleKey + value + childSelector + mediaQuery;
		if (!this.cache[cacheKey]) {
			const className =
				this.config.prefix + this.rules.length.toString(36);

			const style = wrap(
				`.${className}${childSelector}`,
				rule(styleKey, value)
			);
			this.insertRule(mediaQuery ? wrap(mediaQuery, style) : style);
			this.cache[cacheKey] = className;
		}
		return this.cache[cacheKey];
	}

	private parseNumberValue(
		styleKey: string,
		value: number,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		return this.parseStringValue(
			styleKey,
			`${value}${noAutoPixel.indexOf(styleKey) < 0 ? "px" : ""}`,
			childSelector,
			mediaQuery
		);
	}

	private parseKeyframe(
		keyframeKey: string,
		keyframeObject: CssObject & any
	) {
		const keyframeValue = Object.keys(keyframeObject)
			.map((keyframeStageKey) => {
				const keyframeStage = keyframeObject[keyframeStageKey];
				const entryValue = Object.keys(keyframeStage)
					.map(cleanText)
					.map((keyframeRuleKey) =>
						rule(keyframeRuleKey, keyframeStage[keyframeRuleKey])
					)
					.join("");
				return wrap(keyframeStageKey, entryValue);
			})
			.join("");
		const formattedRule = wrap(keyframeKey, keyframeValue);
		if (!this.cache[formattedRule]) {
			this.cache[formattedRule] = "cache";
			this.insertRule(formattedRule);
		}
		return "";
	}

	private parseCssObjectValue(
		styleKey: string,
		value: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	): string[] {
		if (styleKey.indexOf("@keyframes") === 0) {
			this.parseKeyframe(styleKey, value);
			return [];
		} else if (styleKey.indexOf("@media") === 0) {
			return this.parseCssObject(value, childSelector, styleKey);
		} else {
			return this.parseCssObject(
				value,
				childSelector +
				(styleKey.indexOf("&") === 0
					? styleKey.substr(1)
					: " " + styleKey),
				mediaQuery
			);
		}
	}

	private parseSingleValue(
		styleKey: string,
		value: string | number,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		if (typeof value === "number") {
			return this.parseNumberValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		} else {
			return this.parseStringValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		}
	}

	private parseArrayValue(
		styleKey: string,
		values: Array<string | number>,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		return values.map((value) =>
			this.parseSingleValue(styleKey, value, childSelector, mediaQuery)
		);
	}

	private parseCssValue(
		styleKey: string,
		value: CssValue,
		childSelector: string = "",
		mediaQuery: string = ""
	): string[] {
		if (typeof value === "number" || typeof value === "string") {
			return [
				this.parseSingleValue(
					styleKey,
					value,
					childSelector,
					mediaQuery
				)
			];
		} else if (Array.isArray(value)) {
			return this.parseArrayValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		} else {
			return this.parseCssObjectValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		}
	}

	private parseCssObjectEntry(
		styleKey: string,
		value: CssValue,
		childSelector: string = "",
		mediaQuery: string = ""
	): string[] {
		return flat(styleKey
			.split(",")
			.map(cleanText)
			.map((styleKeyItem) =>
				this.parseCssValue(
					styleKeyItem,
					value,
					childSelector,
					mediaQuery
				)
			));
	}

	private parseCssObject(
		style: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	): string[] {
		return flat(Object.keys(style)
			.filter(
				(styleKey) => isValidCssValue(style[styleKey])
			)
			.map((styleKey) =>
				this.parseCssObjectEntry(
					styleKey,
					style[styleKey],
					childSelector,
					mediaQuery
				)
			)
		);
	}

	public getClassNames(style: CssObject) {
		return this.parseCssObject(style).join(" ").trim();
	}

	public getFullCss() {
		return this.rules.sort().join("\n");
	}
}
