export type CssValue = string | number | Array<string | number> | CssObject;

export interface CssObject {
	[key: string]: CssValue;
}

export interface IConfig {
	prefix?: string;
	nonce?: string;
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
			const style = `.${className}${childSelector}{${styleKey}:${value};}`;
			const rule = mediaQuery ? `${mediaQuery}{${style}}` : style;
			this.cache[cacheKey] = className;
			this.rules.push(rule);
			if (this.sheet) {
				this.sheet.insertRule(rule, this.sheet.cssRules.length);
			}
		}
		return this.cache[cacheKey];
	}

	private parseObjectValue(
		styleKey: string,
		value: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		if (styleKey.indexOf("@media") === 0) {
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
			.filter((key) => Boolean(style[key]))
			.map((key): string =>
				this.parseValue(
					key
						.trim()
						.replace(/[A-Z]|^ms/g, "-$&")
						.toLowerCase(),
					style[key],
					childSelector,
					mediaQuery
				)
			)
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
