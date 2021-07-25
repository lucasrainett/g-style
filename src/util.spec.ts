import {
	cleanText,
	flat,
	getMetaAttribute,
	isValidCssValue,
	rule,
	wrap,
} from "./util";

describe("Util", () => {
	it("should clean text", () => {
		expect(
			["TextText", "   asdf   ", "msTest", "asdfAsdf"].map(cleanText)
		).toEqual(["-text-text", "asdf", "-ms-test", "asdf-asdf"]);
	});

	it("should wrap css value into css rule", () => {
		expect(wrap("test", "value")).toEqual("test{value}");
	});

	it("should format css rules", () => {
		expect(rule("test", "value")).toEqual("test:value;");
	});

	it("should get attribute from meta tags", () => {
		const fakeGetAttribute = jest.fn().mockReturnValue("example-value");
		(document.querySelector as jest.Mock).mockReturnValue({
			getAttribute: fakeGetAttribute,
		});
		const result = getMetaAttribute(
			document,
			"example-mata",
			"example-content"
		);
		expect(result).toEqual("example-value");
		expect(document.querySelector).toHaveBeenCalledWith(
			`meta[property=example-mata]`
		);
		expect(fakeGetAttribute).toHaveBeenCalledWith("example-content");
	});

	it("should return undefined if meta tag doesn't exist", () => {
		(document.querySelector as jest.Mock).mockReturnValue(null);
		const result = getMetaAttribute(
			document,
			"example-mata",
			"example-content"
		);
		expect(result).toBeUndefined();
		expect(document.querySelector).toHaveBeenCalledWith(
			`meta[property=example-mata]`
		);
	});

	it("should flat lists", () => {
		expect(
			flat([
				[1, 2, 3],
				[4, 5, 6],
			])
		).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it("should validate css values", () => {
		expect(isValidCssValue("test")).toBeTruthy();
		expect(isValidCssValue({})).toBeTruthy();
		expect(isValidCssValue([])).toBeTruthy();

		expect(isValidCssValue("")).toBeFalsy();
		expect(isValidCssValue(null as any)).toBeFalsy();
		expect(isValidCssValue(undefined as any)).toBeFalsy();
	});
});
