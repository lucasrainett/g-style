import {
	entries,
	formatChildKey,
	formatClassName,
	formatCssRule,
	formatPxUnit,
	getNonceFromMeta,
	insertRule,
	ObjectEntriesShim,
	processStringValue,
	wrapCssRule,
} from "./util";
import { GlobalStyle } from "./index";

describe("Util", () => {
	it("should format class name", () => {
		[
			["text", "text"],
			["   text   ", "text"],
			["textText", "text-text"],
			["msText", "-ms-text"],
			[" ABCD ", "-a-b-c-d"],
		].forEach(([text, expected]) => {
			expect(formatClassName(text)).toEqual(expected);
		});
	});

	it("should format css rules", () => {
		expect(formatCssRule("test", "value")).toEqual("test:value;");
	});

	it("should wrap css rules", () => {
		expect(wrapCssRule("text", "rules")).toEqual("text{rules}");
		expect(wrapCssRule(undefined, "rules")).toEqual("rules");
	});

	it("should format child key", () => {
		expect(formatChildKey("&.text")).toEqual(".text");
		expect(formatChildKey(".text")).toEqual(" .text");
	});

	it("should add px for numbers different than zero, when css key px based", () => {
		expect(formatPxUnit("border", 1)).toEqual("1px");
		expect(formatPxUnit("border", 0)).toEqual("0");
		expect(formatPxUnit("flex", 1)).toEqual("1");
		expect(formatPxUnit("border", "1%")).toEqual("1%");
	});

	it("should provide polyfill function for Object.entries", () => {
		const object = {
			a: 1,
			b: 2,
			c: 3,
		};
		expect(Object.entries(object)).toEqual(entries(object));
	});

	it("should provide shim function for Object.entries", () => {
		const originalEntries = Object.entries;
		(Object as any).entries = undefined;
		expect(Object.entries).toBeFalsy();
		ObjectEntriesShim();
		expect(Object.entries).toBeTruthy();
		expect(Object.entries).not.toBe(originalEntries);

		const object = {
			a: 1,
			b: 2,
			c: 3,
		};
		expect(originalEntries(object)).toEqual(Object.entries(object));
	});

	it("should return nonce as undefined if meta is missing", () => {
		const nonce = getNonceFromMeta();
		expect(nonce).toBeUndefined();
	});

	it("should get nonce from meta tag", () => {
		const cspMeta = document.createElement("meta");
		cspMeta.setAttribute("property", "csp-nonce");
		cspMeta.setAttribute("content", "random-nonce");
		(document.querySelector as jest.Mock).mockReturnValue(cspMeta);
		const nonce = getNonceFromMeta();
		expect(nonce).toEqual("random-nonce");
	});

	it("should insert rules when sheet is available", () => {
		const rules: string[] = [];
		const rule = "fakeRule";
		const sheet = ({
			insertRule: jest.fn(),
			cssRules: [],
		} as any) as CSSStyleSheet;
		insertRule(rules, rule, true, sheet);
		expect(rules[0]).toEqual(rule);
		expect(sheet.insertRule).toHaveBeenCalledWith(rule, 0);
	});

	it("should not inject rule if sheet is not available", () => {
		const rules: string[] = [];
		const rule = "fakeRule";
		insertRule(rules, rule, true, undefined);
		expect(rules[0]).toEqual(rule);
	});

	it("should log message if insert rule fail", () => {
		console.error = jest.fn();
		const rules: string[] = [];
		const rule = "fakeRule";
		const sheet = ({
			insertRule: () => {
				throw new Error();
			},
			cssRules: [],
		} as any) as CSSStyleSheet;

		insertRule(rules, rule, true, sheet);
		expect(rules[0]).toEqual(rule);
		expect(console.error).toHaveBeenCalled();
	});

	it("should process String Value", () => {
		const cache = {};
		const config = {
			prefix: "P",
		};

		const rules: string[] = [];
		const sheet = ({
			insertRule: jest.fn(),
			cssRules: [],
		} as any) as CSSStyleSheet;

		const result = processStringValue(
			{
				key: "fakeKey",
				value: "fakeValue",
				childSelectors: [".fakeSelector"],
				mediaQuery: "@fakeMedia",
			},
			{
				cache,
				config,
				rules,
				sheet,
			}
		);

		expect(Object.keys(cache).length).toBe(1);
		expect(Object.keys(cache)[0]).toEqual(
			"@fakeMedia_.fakeSelector_fakeKey_fakeValue"
		);
		expect(result).toEqual("P0");
	});
});
