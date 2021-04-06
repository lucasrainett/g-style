import { GlobalStyle, css } from "./index";

describe("GlobalStyle", () => {
	const insertRule = jest.fn();

	beforeEach(() => {
		jest.resetAllMocks();
		(document.head.appendChild as jest.Mock).mockReturnValue({
			sheet: {
				insertRule,
				cssRules: [],
			},
		});
	});

	it("should create class name", () => {
		const globalStyle = new GlobalStyle();
		const classNames = globalStyle.getClassNames({ color: "gold" });
		expect(classNames).toEqual(expect.any(String));
	});

	it("should insert style tag on document", () => {
		const globalStyle = new GlobalStyle();
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
		expect(document.head.appendChild).toHaveBeenCalled();
	});

	it("should insert style rules on document", () => {
		const globalStyle = new GlobalStyle();
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
		expect(insertRule).toHaveBeenCalledWith(".t0{color:gold;}", 0);
	});

	it("should NOT insert style tag on document when memoryOnly is set to true", () => {
		const globalStyle = new GlobalStyle({ memoryOnly: true });
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
		expect(document.head.appendChild).not.toHaveBeenCalled();
	});

	it("should NOT insert style rules on document when memoryOnly is set to true", () => {
		const globalStyle = new GlobalStyle({ memoryOnly: true });
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
		expect(insertRule).not.toHaveBeenCalled();
	});

	it("should handle error when inserting rules", () => {
		insertRule.mockImplementation(() => {
			throw new Error();
		});
		const globalStyle = new GlobalStyle({ debug: true });
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
		expect(insertRule).toHaveBeenCalled();
	});

	it("should deduplicate rules", () => {
		const globalStyle = new GlobalStyle();
		const classNames1 = globalStyle.getClassNames({ color: "gold" });
		const classNames2 = globalStyle.getClassNames({ color: "gold" });

		expect(classNames1).toEqual("t0");
		expect(classNames2).toEqual("t0");

		expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
	});

	it("should handles child selectors", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			color: "gold",
			"&:hover": {
				color: "black",
			},
		});

		expect(className).toEqual("t0 t1");
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{color:gold;}", ".t1:hover{color:black;}"].join("\n")
		);
	});

	it("should handles media queries", () => {
		const globalStyle = new GlobalStyle();
		globalStyle.getClassNames({
			color: "gold",
			"@media print": {
				color: "black",
			},
		});
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{color:gold;}", "@media print{.t1{color:black;}}"].join("\n")
		);
	});

	it("should handles media queries and child selectors", () => {
		const globalStyle = new GlobalStyle();
		globalStyle.getClassNames({
			color: "gold",
			"@media screen": {
				"&:hover": {
					color: "black",
				},
			},
		});
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{color:gold;}", "@media screen{.t1:hover{color:black;}}"].join("\n")
		);
	});

	it("should ignore null values", () => {
		const globalStyle = new GlobalStyle();
		const classNames = globalStyle.getClassNames({
			color: null,
		} as any);
		expect(classNames).toEqual("");
		expect(globalStyle.getFullCss()).toEqual("");
	});

	it("should accept custom prefix", () => {
		const globalStyle = new GlobalStyle({ prefix: "_cxs" });
		globalStyle.getClassNames({ color: "gold" });
		expect(globalStyle.getFullCss()).toEqual("._cxs0{color:gold;}");
	});

	it("should handles sub class selectors", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			color: "gold",
			".button": {
				color: "black",
			},
		});

		expect(className).toEqual("t0 t1");
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{color:gold;}", ".t1 .button{color:black;}"].join("\n")
		);
	});

	it("should handles extension class selectors", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			color: "gold",
			"&.button": {
				color: "black",
			},
		});

		expect(className).toEqual("t0 t1");
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{color:gold;}", ".t1.button{color:black;}"].join("\n")
		);
	});

	it("should handles zero value", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			margin: 0,
		});

		expect(className).toEqual("t0");
		expect(globalStyle.getFullCss()).toEqual(".t0{margin:0;}");
	});

	it("should support multiple instances", () => {
		const globalStyle1 = new GlobalStyle({ prefix: "test1" });
		const globalStyle2 = new GlobalStyle({ prefix: "test2" });

		const className1 = globalStyle1.getClassNames({
			color: "gold",
		});

		const className2 = globalStyle2.getClassNames({
			color: "gold",
		});

		expect(className1).toEqual("test10");
		expect(className2).toEqual("test20");

		expect(globalStyle1.getFullCss()).toEqual(".test10{color:gold;}");
		expect(globalStyle2.getFullCss()).toEqual(".test20{color:gold;}");
	});

	it("should support complex styles", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			color: "gold",
			".box": {
				backgroundColor: "red",
			},
			"&.button": {
				color: "black",
			},
			"@media print": {
				border: "1px solid #ccc",
			},
		});

		expect(className).toEqual("t0 t1 t2 t3");
		expect(globalStyle.getFullCss()).toEqual(
			[
				".t0{color:gold;}",
				".t1 .box{background-color:red;}",
				".t2.button{color:black;}",
				"@media print{.t3{border:1px solid #ccc;}}",
			].join("\n")
		);
	});

	it("should support multiple values", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			color: "gold",
			display: ["flex", "-webkit-flex"],
			"@media print": {
				display: ["flex", "-ms-flex"],
			},
			"&.button": {
				display: ["flex", "-moz-flex"],
			},
		});

		expect(className).toEqual("t0 t1 t2 t3 t4 t5 t6");
		expect(globalStyle.getFullCss()).toEqual(
			[
				".t0{color:gold;}",
				".t1{display:flex;}",
				".t2{display:-webkit-flex;}",
				".t5.button{display:flex;}",
				".t6.button{display:-moz-flex;}",
				"@media print{.t3{display:flex;}}",
				"@media print{.t4{display:-ms-flex;}}",
			].join("\n")
		);
	});

	it("should support strings and numbers on multiple values", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			test: ["string", 10],
			test2: 11,
		});

		expect(className).toEqual("t0 t1 t2");
		expect(globalStyle.getFullCss()).toEqual(
			[".t0{test:string;}", ".t1{test:10px;}", ".t2{test2:11px;}"].join("\n")
		);
	});

	it("should use provided nonce", () => {
		const globalStyle = new GlobalStyle({ nonce: "random" });
		globalStyle.getClassNames({ border: "1px" });

		const expectedStyle = document.createElement("style");
		expectedStyle.setAttribute("nonce", "random");

		expect(document.head.appendChild).toHaveBeenCalledWith(expectedStyle);
	});

	it("should support comma separated keys", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			"code,kbd, samp": { fontSize: "1em" },
		});

		expect(className).toEqual("t0 t1 t2");
		expect(globalStyle.getFullCss()).toEqual(
			[
				".t0 code{font-size:1em;}",
				".t1 kbd{font-size:1em;}",
				".t2 samp{font-size:1em;}",
			].join("\n")
		);
	});

	it("should support functional programming", () => {
		const className = GlobalStyle.getClassNames({
			borderWidth: 20,
		});
		expect(className).toEqual("t0");
		expect(GlobalStyle.getFullCss()).toEqual(".t0{border-width:20px;}");
	});

	it("should export single function", () => {
		const className = css({
			borderWidth: 20,
		});
		expect(className).toEqual("t0");
		expect(GlobalStyle.getFullCss()).toEqual(".t0{border-width:20px;}");
	});

	it("should support debug", () => {
		const originalConsole = global.console;
		(global.console as any) = {
			log: jest.fn(),
			error: jest.fn(),
		};
		const globalStyle = new GlobalStyle({ debug: true });
		globalStyle.getClassNames({
			"code,kbd, samp": { fontSize: "1em" },
		});
		expect(console.log).toHaveBeenNthCalledWith(3, "Rule Inserted:", expect.any(String));
		global.console = originalConsole;
	});

	it("should support @keyframes", () => {
		const globalStyle = new GlobalStyle();
		const className = globalStyle.getClassNames({
			animation: "spin 5s infinite",
			"@keyframes spin": {
				"0%": {
					transform: "rotate(0deg)",
					border: "1px",
				},
				"100%": {
					transform: "rotate(360deg)",
					border: "2px",
				},
			},
		});

		expect(className).toEqual("t0");
		expect(globalStyle.getFullCss()).toEqual(
			[
				".t0{animation:spin 5s infinite;}",
				"@keyframes spin{0%{transform:rotate(0deg);border:1px;}100%{transform:rotate(360deg);border:2px;}}",
			].join("\n")
		);
	});

	it("should cache keyframes", () => {
		const globalStyle = new GlobalStyle();
		const keyframe = {
			"@keyframes spin": {
				"0%": {
					transform: "rotate(0deg)",
					border: "1px",
				},
				"100%": {
					transform: "rotate(360deg)",
					border: "2px",
				},
			},
		};
		const className1 = globalStyle.getClassNames(keyframe);
		const className2 = globalStyle.getClassNames(keyframe);
		expect(className1).toEqual(className2);
	});

	it("should return empty when getFullCss is called but not rules were provided", () => {
		(GlobalStyle as any).instance = undefined;
		expect(GlobalStyle.getFullCss()).toEqual("");
	});

	const noAutoPixel = [
		"animationIterationCount",
		"borderImageOutset",
		"borderImageSlice",
		"borderImageWidth",
		"boxFlex",
		"boxFlexGroup",
		"boxOrdinalGroup",
		"columnCount",
		"columns",
		"flex",
		"flexGrow",
		"flexPositive",
		"flexShrink",
		"flexNegative",
		"flexOrder",
		"gridRow",
		"gridRowEnd",
		"gridRowSpan",
		"gridRowStart",
		"gridColumn",
		"gridColumnEnd",
		"gridColumnSpan",
		"gridColumnStart",
		"fontWeight",
		"lineClamp",
		"lineHeight",
		"opacity",
		"order",
		"orphans",
		"tabSize",
		"widows",
		"zIndex",
		"zoom",
		"fillOpacity",
		"floodOpacity",
		"stopOpacity",
		"strokeDasharray",
		"strokeDashoffset",
		"strokeMiterlimit",
		"strokeOpacity",
		"strokeWidth",
	];
	const exampleOfAutoPixel = ["width", "height", "margin", "padding"];

	it("should append px to number properties that are size related", () => {
		const style = [...exampleOfAutoPixel, ...noAutoPixel].reduce(
			(final, item) => ({ ...final, [item]: 10 }),
			{}
		);

		const globalStyle = new GlobalStyle();
		globalStyle.getClassNames(style);

		expect(globalStyle.getFullCss()).toEqual(
			[
				".t0{width:10px;}",
				".t10{zoom:10;}",
				".t11{fill-opacity:10;}",
				".t12{flood-opacity:10;}",
				".t13{stop-opacity:10;}",
				".t14{stroke-dasharray:10;}",
				".t15{stroke-dashoffset:10;}",
				".t16{stroke-miterlimit:10;}",
				".t17{stroke-opacity:10;}",
				".t18{stroke-width:10;}",
				".t1{height:10px;}",
				".t2{margin:10px;}",
				".t3{padding:10px;}",
				".t4{animation-iteration-count:10;}",
				".t5{border-image-outset:10;}",
				".t6{border-image-slice:10;}",
				".t7{border-image-width:10;}",
				".t8{box-flex:10;}",
				".t9{box-flex-group:10;}",
				".ta{box-ordinal-group:10;}",
				".tb{column-count:10;}",
				".tc{columns:10;}",
				".td{flex:10;}",
				".te{flex-grow:10;}",
				".tf{flex-positive:10;}",
				".tg{flex-shrink:10;}",
				".th{flex-negative:10;}",
				".ti{flex-order:10;}",
				".tj{grid-row:10;}",
				".tk{grid-row-end:10;}",
				".tl{grid-row-span:10;}",
				".tm{grid-row-start:10;}",
				".tn{grid-column:10;}",
				".to{grid-column-end:10;}",
				".tp{grid-column-span:10;}",
				".tq{grid-column-start:10;}",
				".tr{font-weight:10;}",
				".ts{line-clamp:10;}",
				".tt{line-height:10;}",
				".tu{opacity:10;}",
				".tv{order:10;}",
				".tw{orphans:10;}",
				".tx{tab-size:10;}",
				".ty{widows:10;}",
				".tz{z-index:10;}",
			].join("\n")
		);
	});
});
