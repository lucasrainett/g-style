export type CssValue = string | number | Array<string | number> | CssObject;

export interface CssObject {
	[key: string]: CssValue;
}

export interface IConfig {
	prefix?: string;
	nonce?: string;
	debug?: boolean;
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
	"stroke-width",
];

export function css(style: CssObject){
	return GlobalStyle.getClassNames(style);
}

export class GlobalStyle {
	private readonly cache: { [key: string]: string } = {};
	private readonly rules: string[] = [];
	private readonly sheet?: CSSStyleSheet;

	constructor(private config: IConfig = {}) {
		this.config.prefix = this.config.prefix || "t";

		if (typeof document !== "undefined") {
			const style = document.createElement("style");
			const nonce = this.config.nonce || GlobalStyle.getNonceFromMeta();
			if (nonce) {
				style.setAttribute("nonce", nonce);
			}
			this.sheet = document.head.appendChild(style)
				.sheet as CSSStyleSheet;
		}
	}

	private static instance: GlobalStyle;
	public static getClassNames(style: CssObject){
		this.instance = this.instance || new GlobalStyle();
		return this.instance.getClassNames(style);
	}
	public static getFullCss(){
		this.instance = this.instance || new GlobalStyle();
		return this.instance.getFullCss();
	}

	private static getNonceFromMeta() {
		const metaCsp = document.querySelector("meta[property=csp-nonce]");
		if (metaCsp) {
			const nonce = metaCsp.getAttribute("content");
			if (nonce) {
				return nonce;
			}
		}
		return undefined;
	}

	private static cleanText(text: string) {
		return text
			.trim()
			.replace(/[A-Z]|^ms/g, "-$&")
			.toLowerCase();
	}

	private insertRule(rule: string) {
		this.rules.push(rule);
		if (this.sheet) {
			try {
				this.sheet.insertRule(rule, this.sheet.cssRules.length);
				this.config.debug && console.log("Rule Inserted:", rule);
			} catch (e) {
				this.config.debug && console.error("ERROR: Rule not supported:", rule);
			}
		}
	}

	private parseStringValue(
		styleKey: string,
		value: string | number,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		const cacheKey = styleKey + value + childSelector + mediaQuery;
		if (!this.cache[cacheKey]) {
			const className =
				this.config.prefix + this.rules.length.toString(36);

			const unit =
				typeof value === "number" &&
				value !== 0 &&
				noAutoPixel.indexOf(styleKey) < 0
					? "px"
					: "";
			const style = `.${className}${childSelector}{${styleKey}:${value}${unit};}`;
			const rule = mediaQuery ? `${mediaQuery}{${style}}` : style;
			this.cache[cacheKey] = className;
			this.insertRule(rule);
		}
		return this.cache[cacheKey];
	}

	private parseKeyFrame(
		keyframeKey: string,
		keyframeObject: CssObject & any
	) {
		const keyframeValue = Object.keys(keyframeObject)
			.map((keyframeStageKey) => {
				const keyframeStage = keyframeObject[keyframeStageKey];
				const entryValue = Object.keys(keyframeStage)
					.map(GlobalStyle.cleanText)
					.map(
						(keyframeRuleKey) =>
							`${keyframeRuleKey}:${keyframeStage[keyframeRuleKey]};`
					)
					.join("");
				return `${keyframeStageKey}{${entryValue}}`;
			})
			.join("");
		const rule = `${keyframeKey}{${keyframeValue}}`;
		if (!this.cache[rule]) {
			this.cache[rule] = "cache";
			this.insertRule(rule);
		}
		return "";
	}

	private parseObjectValue(
		styleKey: string,
		value: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		if (styleKey.indexOf("@keyframes") === 0) {
			return this.parseKeyFrame(styleKey, value);
		} else if (styleKey.indexOf("@media") === 0) {
			return this.parseCssObject(value, childSelector, styleKey);
		} else {
			const formattedChildKey =
				styleKey.indexOf("&") === 0
					? styleKey.substr(1)
					: " " + styleKey;
			return this.parseCssObject(
				value,
				childSelector + formattedChildKey,
				mediaQuery
			);
		}
	}

	private parseValue(
		styleKey: string,
		value: CssValue,
		childSelector: string = "",
		mediaQuery: string = ""
	): string {
		if (typeof value === "string" || typeof value === "number") {
			return this.parseStringValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		} else if (Array.isArray(value)) {
			return value
				.filter(
					(val) => typeof val === "string" || typeof val === "number"
				)
				.map((val) =>
					this.parseStringValue(
						styleKey,
						val,
						childSelector,
						mediaQuery
					)
				)
				.join(" ")
				.trim();
		} else {
			return this.parseObjectValue(
				styleKey,
				value,
				childSelector,
				mediaQuery
			);
		}
	}

	private parseCssObject(
		style: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	): string {
		return Object.keys(style)
			.filter(
				(key) => typeof style[key] === "number" || Boolean(style[key])
			)
			.map((key) =>
				key
					.split(",")
					.map(GlobalStyle.cleanText)
					.map((itemKey) =>
						this.parseValue(
							itemKey,
							style[key],
							childSelector,
							mediaQuery
						)
					)
			)
			.reduce((final, item) => [...final, ...item], [])
			.join(" ")
			.trim();
	}

	public getClassNames(style: CssObject) {
		return this.parseCssObject(style);
	}

	public getFullCss() {
		return this.rules.sort().join("\n");
	}
}
