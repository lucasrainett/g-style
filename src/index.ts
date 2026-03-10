import { cleanText, wrap, rule, getMetaAttribute, isValidCssValue, noAutoPixel, isObject } from "./util";

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

export const css = (style: CssObject) => GlobalStyle.getClassNames(style);

export class GlobalStyle {
	private readonly cache = new Map<string, string>();
	private readonly rules: string[] = [];
	private readonly sheet?: CSSStyleSheet;
	private config: IConfig;

	constructor(config: Partial<IConfig> = {}) {
		const { memoryOnly, nonce, nonceMetaProperty, nonceMetaAttribute } = (this.config = {
			prefix: "t",
			nonceMetaProperty: "csp-nonce",
			nonceMetaAttribute: "content",
			debug: false,
			memoryOnly: false,
			...config,
		});

		if (!memoryOnly && typeof document !== "undefined") {
			const style = document.createElement("style");
			const finalNonce = nonce ?? getMetaAttribute(document, nonceMetaProperty, nonceMetaAttribute);
			if (finalNonce) {
				style.setAttribute("nonce", finalNonce);
			}
			this.sheet = document.head.appendChild(style).sheet as CSSStyleSheet;
		}
	}

	private static instance: GlobalStyle;
	private static getInstance() {
		this.instance ??= new GlobalStyle();
		return this.instance;
	}

	public static getClassNames(style: CssObject) {
		return this.getInstance().getClassNames(style);
	}

	public static getFullCss() {
		return this.getInstance().getFullCss();
	}

	private insertRule = (rule: string) => {
		this.rules.push(rule);
		if (this.sheet) {
			try {
				this.sheet.insertRule(rule, this.sheet.cssRules.length);
				if (this.config.debug) console.log("Rule Inserted:", rule);
			} catch {
				if (this.config.debug) console.error("ERROR: Rule not supported:", rule);
			}
		}
	};

	private parseValue = (styleKey: string, childSelector: string, mediaQuery: string, value: string | number) => {
		const formattedValue = `${value}${typeof value === "number" && !noAutoPixel.has(styleKey) ? "px" : ""}`;
		const cacheKey = styleKey + formattedValue + childSelector + mediaQuery;
		if (!this.cache.has(cacheKey)) {
			const className = this.config.prefix + this.rules.length.toString(36);
			const style = wrap(`.${className}${childSelector}`, rule(styleKey, formattedValue));
			this.insertRule(mediaQuery ? wrap(mediaQuery, style) : style);
			this.cache.set(cacheKey, className);
		}
		return this.cache.get(cacheKey)!;
	};

	private parseKeyframe = (keyframeKey: string, keyframeObject: CssObject) => {
		const keyframeValue = Object.keys(keyframeObject)
			.map((keyframeStageKey) => {
				const keyframeStage = keyframeObject[keyframeStageKey] as CssObject;
				const entryValue = Object.keys(keyframeStage)
					.map((keyframeRuleKey) => rule(cleanText(keyframeRuleKey), String(keyframeStage[keyframeRuleKey])))
					.join("");
				return wrap(keyframeStageKey, entryValue);
			})
			.join("");
		const formattedRule = wrap(keyframeKey, keyframeValue);
		if (!this.cache.has(formattedRule)) {
			this.cache.set(formattedRule, "cache");
			this.insertRule(formattedRule);
		}
	};

	private parseCssObjectValue = (styleKey: string, value: CssObject, childSelector: string, mediaQuery: string): string[] => {
		if (styleKey.startsWith("@keyframes")) {
			this.parseKeyframe(styleKey, value);
			return [];
		} else if (styleKey.startsWith("@media")) {
			return this.parseCssObject(value, childSelector, styleKey);
		} else {
			const cleanStyleKey = styleKey.startsWith("&") ? styleKey.substring(1) : " " + styleKey;
			return this.parseCssObject(value, childSelector + cleanStyleKey, mediaQuery);
		}
	};

	private parseCssValue = (styleKey: string, value: CssValue, childSelector: string, mediaQuery: string): string[] => {
		if (isObject(value)) {
			return this.parseCssObjectValue(styleKey, value, childSelector, mediaQuery);
		} else {
			const valueArray = Array.isArray(value) ? value : [value];
			return valueArray.map(this.parseValue.bind(this, styleKey, childSelector, mediaQuery));
		}
	};

	private parseCssObjectEntry = (styleKey: string, value: CssValue, childSelector: string, mediaQuery: string): string[] =>
		styleKey
			.split(",")
			.map(cleanText)
			.flatMap((styleKeyItem) => this.parseCssValue(styleKeyItem, value, childSelector, mediaQuery));

	private parseCssObject = (style: CssObject, childSelector: string, mediaQuery: string): string[] =>
		Object.keys(style)
			.filter((styleKey) => isValidCssValue(style[styleKey]))
			.flatMap((styleKey) => this.parseCssObjectEntry(styleKey, style[styleKey], childSelector, mediaQuery));

	public getClassNames = (style: CssObject) => this.parseCssObject(style, "", "").join(" ");

	public getFullCss = () => this.rules.sort().join("\n");
}
