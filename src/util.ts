import { CssObject, CssValue } from "./index";

// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSProperty.js#L15-L59
export const noAutoPixel = [
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

const cleanRegex = /[A-Z]|^ms/g;
export const cleanText = (text: string) =>
	text.trim().replace(cleanRegex, "-$&").toLowerCase();

export const wrap = (key: string, value: string) => `${key}{${value}}`;

export const rule = (key: string, value: string) => `${key}:${value};`;

export const flat = (data: any[][]) =>
	data.reduce((final, item) => [...final, ...item], []);

export const isValidCssValue = (value: CssValue) =>
	typeof value === "number" || Boolean(value);

export const getMetaAttribute = (
	document: Document,
	property: string,
	attribute: string
) =>
	document
		.querySelector(`meta[property=${property}]`)
		?.getAttribute(attribute) || undefined;

export const isObject = (value: any): value is CssObject =>
	value != null && typeof value === "object" && !Array.isArray(value);
