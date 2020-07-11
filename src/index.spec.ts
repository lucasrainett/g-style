import {GlobalStyle} from "./index";

describe("GlobalStyle", () => {

    const insertRule = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        (document.head.appendChild as jest.Mock).mockReturnValue({
            sheet: {
                insertRule,
                cssRules: []
            }
        });
    });


    it("should create class name", () => {
        const globalStyle = new GlobalStyle();
        const classNames = globalStyle.getClassNames({color: "gold"});
        expect(classNames).toEqual(expect.any(String));
    });

    it("should insert style on document", () => {
        const globalStyle = new GlobalStyle();
        globalStyle.getClassNames({color: "gold"});
        expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
    });

    it("should deduplicate rules", () => {
        const globalStyle = new GlobalStyle();
        const classNames1 = globalStyle.getClassNames({color: "gold"});
        const classNames2 = globalStyle.getClassNames({color: "gold"});

        expect(classNames1).toEqual("t0");
        expect(classNames2).toEqual("t0");

        expect(globalStyle.getFullCss()).toEqual(".t0{color:gold;}");
    });

    it("should handles child selectors", () => {
        const globalStyle = new GlobalStyle();
        const className = globalStyle.getClassNames({
            color: "gold",
            "&:hover": {
                color: "black"
            }
        });

        expect(className).toEqual("t0 t1");
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            ".t1:hover{color:black;}"
        ].join("\n"));
    });

    it("should handles media queries", () => {
        const globalStyle = new GlobalStyle();
        globalStyle.getClassNames({
            color: "gold",
            "@media print": {
                color: "black"
            }
        })
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            "@media print{.t1{color:black;}}"
        ].join("\n"));
    });

    it("should handles media queries and child selectors", () => {
        const globalStyle = new GlobalStyle();
        globalStyle.getClassNames({
            color: "gold",
            "@media screen": {
                "&:hover": {
                    color: "black"
                }
            }
        })
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            "@media screen{.t1:hover{color:black;}}"
        ].join("\n"));
    });

    it("should ignore null values", () => {
        const globalStyle = new GlobalStyle();
        const classNames = globalStyle.getClassNames({
            color: null
        } as any)
        expect(classNames).toEqual("");
        expect(globalStyle.getFullCss()).toEqual("");
    });

    it("should accept custom prefix", () => {
        const globalStyle = new GlobalStyle("_cxs");
        globalStyle.getClassNames({color: "gold"});
        expect(globalStyle.getFullCss()).toEqual("._cxs0{color:gold;}");
    });

    it("should handles sub class selectors", () => {
        const globalStyle = new GlobalStyle();
        const className = globalStyle.getClassNames({
            color: "gold",
            ".button": {
                color: "black"
            }
        });

        expect(className).toEqual("t0 t1");
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            ".t1 .button{color:black;}"
        ].join("\n"));
    });

    it("should handles extension class selectors", () => {
        const globalStyle = new GlobalStyle();
        const className = globalStyle.getClassNames({
            color: "gold",
            "&.button": {
                color: "black"
            }
        });

        expect(className).toEqual("t0 t1");
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            ".t1.button{color:black;}"
        ].join("\n"));
    });

    it("should support multiple instances", () => {
        const globalStyle1 = new GlobalStyle("test1");
        const globalStyle2 = new GlobalStyle("test2");

        const className1 = globalStyle1.getClassNames({
            color: "gold"
        });

        const className2 = globalStyle2.getClassNames({
            color: "gold"
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
                backgroundColor: "red"
            },
            "&.button": {
                color: "black"
            },
            "@media print": {
                border: "1px solid #ccc",
            }
        });

        expect(className).toEqual("t0 t1 t2 t3");
        expect(globalStyle.getFullCss()).toEqual([
            ".t0{color:gold;}",
            ".t1 .box{background-color:red;}",
            ".t2.button{color:black;}",
            "@media print{.t3{border:1px solid #ccc;}}"
        ].join("\n"));
    });
});



