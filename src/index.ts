import "array-flat-polyfill";

import { Context, CssObject, CssRule, CssValue, IConfig } from "./types";

import {
	formatChildKey,
	formatClassName,
	formatCssRule,
	formatPxUnit,
	wrapCssRule,
	ObjectEntriesShim,
	getNonceFromMeta,
	insertRule,
	processStringValue,
} from "./util";

export { CssObject, IConfig };

ObjectEntriesShim();

export function css(style: CssObject) {
	return GlobalStyle.getClassNames(style);
}

export class GlobalStyle {
	private readonly cache: { [key: string]: string } = {};
	private readonly rules: string[] = [];
	private readonly sheet?: CSSStyleSheet;

	constructor(private config: IConfig = {}) {
		this.config.prefix = this.config.prefix || "t";

		if (!this.config.memoryOnly && typeof document !== "undefined") {
			const style = document.createElement("style");
			const nonce = this.config.nonce || getNonceFromMeta();
			if (nonce) {
				style.setAttribute("nonce", nonce);
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

	private parseSingleValue({
		value,
		key,
		...rest
	}: CssRule<string | number>) {
		return processStringValue(
			{
				value:
					typeof value === "number"
						? formatPxUnit(key, value)
						: value,
				key,
				...rest,
			},
			{
				cache: this.cache,
				rules: this.rules,
				config: this.config,
				sheet: this.sheet,
			}
		);
	}

	private parseArrayValue({
		value,
		...rest
	}: CssRule<Array<string | number>>) {
		return value
			.filter((val) => typeof val === "string" || typeof val === "number")
			.map((value) => this.parseSingleValue({ value, ...rest }));
	}

	private parseKeyFrame(
		keyframeKey: string,
		keyframeObject: CssObject
	): void {
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
		this.cache[rule] =
			this.cache[rule] ||
			(() => {
				insertRule(this.rules, rule, !!this.config.debug, this.sheet);
				return "cache";
			})();
	}

	private parseObjectValue({
		key,
		value,
		childSelectors,
		mediaQuery,
	}: CssRule<CssObject>) {
		if (key.indexOf("@keyframes") === 0) {
			this.parseKeyFrame(key, value);
			return [];
		} else if (key.indexOf("@media") === 0) {
			return this.parseCssObject(value, childSelectors, key);
		} else {
			return this.parseCssObject(
				value,
				[...childSelectors, formatChildKey(key)],
				mediaQuery
			);
		}
	}

	private parseValue({ value, ...rest }: CssRule<CssValue>) {
		if (typeof value === "object" && !Array.isArray(value)) {
			return this.parseObjectValue({
				value,
				...rest,
			});
		} else {
			return this.parseArrayValue({
				value: Array.isArray(value) ? value : [value],
				...rest,
			});
		}
	}

	private parseMultiKeyValue({ key, ...rest }: CssRule<CssValue>) {
		return key
			.split(",")
			.map(formatClassName)
			.map((key) =>
				this.parseValue({
					key,
					...rest,
				})
			);
	}

	private parseCssObject(
		style: CssObject,
		childSelectors: string[],
		mediaQuery?: string
	): string[] {
		return Object.entries(style)
			.filter(([, value]) => typeof value === "number" || Boolean(value))
			.map(([key, value]) =>
				this.parseMultiKeyValue({
					key,
					value,
					childSelectors,
					mediaQuery,
				})
			)
			.flat(3);
	}

	public getClassNames(style: CssObject): string {
		return this.parseCssObject(style, []).join(" ").trim();
	}

	public getFullCss() {
		return this.rules.sort().join("\n");
	}
}
