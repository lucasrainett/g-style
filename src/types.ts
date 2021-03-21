export type CssValue = string | number | Array<string | number> | CssObject;

export interface CssObject {
	[key: string]: CssValue;
}

export interface IConfig {
	prefix?: string;
	nonce?: string;
	debug?: boolean;
	memoryOnly?: boolean;
}

export interface CssRule<T> {
	value: T;
	key: string;
	childSelectors: string[];
	mediaQuery?: string;
}

export interface Context {
	cache: { [key: string]: string };
	rules: string[];
	config: IConfig;
	sheet?: CSSStyleSheet;
}
