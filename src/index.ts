import "array-flat-polyfill";
import { Context, CssObject, IConfig } from "./types";
import { ObjectEntriesShim, getNonceFromMeta, processCssObject, createStyleTag } from "./util";
export { CssObject, IConfig };
ObjectEntriesShim();

export function css(style: CssObject) {
	return GlobalStyle.getClassNames(style);
}

export class GlobalStyle {
	private readonly context: Context;

	constructor(config: IConfig = {}) {
		this.context = {
			cache: {},
			rules: [],
			config: { ...config, prefix: config.prefix || "t" },
			sheet:
				!config.memoryOnly && typeof document !== "undefined"
					? createStyleTag(config.nonce || getNonceFromMeta())
					: undefined,
		};
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

	public getClassNames(style: CssObject): string {
		return processCssObject(this.context, style, []).join(" ").trim();
	}

	public getFullCss() {
		return this.context.rules.sort().join("\n");
	}
}
