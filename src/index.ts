export interface CssObject {
	[key: string]: string | string[] | CssObject;
}

export class GlobalStyle {
	private readonly cache: { [key: string]: string } = {};
	private readonly rules: string[] = [];
	private readonly sheet?: CSSStyleSheet;

	constructor(private prefix: string = "t") {
		if (typeof document !== "undefined") {
			this.sheet = document.head.appendChild(document.createElement("style"))
				.sheet as CSSStyleSheet;
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
			const className = this.prefix + this.rules.length.toString(36);
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
		value: any,
		childSelector: string = "",
		mediaQuery: string = ""
	) {
		if (styleKey.startsWith("@media")) {
			return this.parseCssObject(value, childSelector, styleKey);
		} else {
			const formattedChildKey = styleKey.startsWith("&")
				? styleKey.substr(1)
				: " " + styleKey;
			return this.parseCssObject(value, childSelector + formattedChildKey, mediaQuery);
		}
	}

	private parseValue(
		styleKey: string,
		value: any,
		childSelector: string = "",
		mediaQuery: string = ""
	): string {
		if (typeof value === "string") {
			return this.parseStringValue(styleKey, value, childSelector, mediaQuery);
		} else if (Array.isArray(value)) {
			return value
				.filter((val) => typeof val === "string")
				.map((val) => this.parseStringValue(styleKey, val, childSelector, mediaQuery))
				.join(" ");
		} else {
			return this.parseObjectValue(styleKey, value, childSelector, mediaQuery);
		}
	}

	private parseCssObject(
		style: CssObject,
		childSelector: string = "",
		mediaQuery: string = ""
	): string {
		return Object.keys(style)
			.filter((key) => Boolean(style[key]))
			.map((key): string => {
				const styleKey = key
					.trim()
					.replace(/[A-Z]|^ms/g, "-$&")
					.toLowerCase();
				const value = style[key];
				return this.parseValue(styleKey, value, childSelector, mediaQuery);
			})
			.join(" ");
	}

	public getClassNames(style: CssObject) {
		return this.parseCssObject(style);
	}

	public getFullCss() {
		return this.rules.sort().join("\n");
	}
}
