import { CssValue } from "./index";

export const cleanText = (text: string) =>
	text
		.trim()
		.replace(/[A-Z]|^ms/g, "-$&")
		.toLowerCase();

export const wrap = (key: string, value: string) => `${key}{${value}}`;

export const rule = (key: string, value: string) => `${key}:${value};`;

export const flat = (data: any[][]) => data.reduce((final, item) => [...final, ...item], []);

export const isValidCssValue = (value: CssValue) => typeof value === "number" || Boolean(value);

export const getMetaAttribute = (property: string, attribute: string) =>
	document
		?.querySelector(`meta[property=${property}]`)
		?.getAttribute(attribute) || undefined;
